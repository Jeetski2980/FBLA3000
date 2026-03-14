import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { readData, writeData } from './server/src/utils/storage.js';
import { generateToken, verifyToken, isAdmin } from './server/src/middleware/auth.js';
import { getRecommendations } from './server/src/ai/geminiClient.js';
import { VERIFICATION_QUESTIONS } from './src/constants.js';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  app.use(cookieParser());

  // --- User Profile API (Local Storage based on client, but server can store if we want, 
  // but user said "no login", so we'll just handle ZIP/Bio in the AI request) ---

  // --- Businesses API ---
  app.post('/api/businesses/submit', async (req, res) => {
    const { name, category, description, zip, website, address, business_image, createdBy, username } = req.body;
    const finalCreatedBy = createdBy || username || 'Anonymous';
    
    if (!name || !category || !description || !zip) {
      return res.status(400).json({ error: 'Missing required fields (name, category, description, zip)' });
    }

    const businesses = await readData('businesses.json');
    const newBusiness = {
      id: uuidv4(),
      name,
      category,
      description,
      zip,
      address,
      website,
      imageUrl: business_image,
      createdBy: finalCreatedBy,
      createdAt: new Date().toISOString(),
      status: 'APPROVED'
    };

    businesses.push(newBusiness);
    await writeData('businesses.json', businesses);
    res.status(201).json({ message: 'Business submitted successfully!' });
  });

  app.delete('/api/businesses/:id', async (req, res) => {
    const { username } = req.query;
    const businesses = await readData('businesses.json');
    const business = businesses.find(b => b.id === req.params.id);
    
    if (!business) return res.status(404).json({ error: 'Business not found' });
    
    if (business.createdBy && username && business.createdBy.trim().toLowerCase() !== username.trim().toLowerCase()) {
      return res.status(403).json({ error: 'You can only delete businesses that you created.' });
    }

    const filtered = businesses.filter(b => b.id !== req.params.id);
    await writeData('businesses.json', filtered);
    res.json({ message: 'Business deleted' });
  });

  app.get('/api/businesses', async (req, res) => {
    const { zip, search, category, sort } = req.query;
    let businesses = await readData('businesses.json');
    
    const reviews = await readData('reviews.json');

    if (zip) businesses = businesses.filter(b => b.zip === zip);
    if (search) businesses = businesses.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));
    if (category) businesses = businesses.filter(b => b.category === category);

    // Calculate ratings
    businesses = businesses.map(b => {
      const bReviews = reviews.filter(r => r.businessId === b.id && r.status === 'VERIFIED');
      const avgRating = bReviews.length > 0 ? bReviews.reduce((sum, r) => sum + r.rating, 0) / bReviews.length : 0;
      return { ...b, avgRating, reviewCount: bReviews.length };
    });

    if (sort === 'Highest Rated') businesses.sort((a, b) => b.avgRating - a.avgRating);
    else if (sort === 'Lowest Rated') businesses.sort((a, b) => a.avgRating - b.avgRating);
    else if (sort === 'Most Reviewed') businesses.sort((a, b) => b.reviewCount - a.reviewCount);
    else if (sort === 'Alphabetical') businesses.sort((a, b) => a.name.localeCompare(b.name));

    res.json(businesses);
  });

  app.get('/api/businesses/:id', async (req, res) => {
    const businesses = await readData('businesses.json');
    const business = businesses.find(b => b.id === req.params.id);
    if (!business) return res.status(404).json({ error: 'Business not found' });

    const reviews = await readData('reviews.json');
    const bReviews = reviews.filter(r => r.businessId === business.id && r.status === 'VERIFIED');
    const avgRating = bReviews.length > 0 ? bReviews.reduce((sum, r) => sum + r.rating, 0) / bReviews.length : 0;

    res.json({ ...business, avgRating, reviewCount: bReviews.length });
  });

  // --- Feed API ---
  app.get('/api/feed', async (req, res) => {
    const { zip, type } = req.query;
    let posts = await readData('posts.json');
    const businesses = await readData('businesses.json');

    if (zip) posts = posts.filter(p => p.zip === zip);
    if (type) posts = posts.filter(p => p.type === type);

    // Filter out expired deals
    const now = new Date();
    posts = posts.filter(p => !p.expiresAt || new Date(p.expiresAt) > now);

    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Attach business info
    const enrichedPosts = posts.map(p => {
      const business = businesses.find(b => b.id === p.businessId);
      return { 
        ...p, 
        businessName: p.businessName || business?.name, 
        businessCategory: p.businessCategory || business?.category || 'Local'
      };
    });

    res.json(enrichedPosts);
  });

  app.get('/api/businesses/:id/posts', async (req, res) => {
    let posts = await readData('posts.json');
    posts = posts.filter(p => p.businessId === req.params.id);
    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(posts);
  });

  app.post('/api/businesses/:id/posts', async (req, res) => {
    const { type, title, body, imageUrl, couponCode, expiresAt, createdByUsername } = req.body;
    const businesses = await readData('businesses.json');
    const business = businesses.find(b => b.id === req.params.id);
    if (!business) return res.status(404).json({ error: 'Business not found' });

    if (business.createdByUsername && business.createdByUsername !== createdByUsername) {
      return res.status(403).json({ error: 'Only the business owner can post updates.' });
    }

    const posts = await readData('posts.json');
    const newPost = {
      id: uuidv4(),
      businessId: business.id,
      zip: business.zip,
      type,
      title,
      body,
      imageUrl,
      couponCode,
      expiresAt,
      createdByUsername: createdByUsername || 'Anonymous',
      createdAt: new Date().toISOString()
    };

    posts.push(newPost);
    await writeData('posts.json', posts);
    res.status(201).json(newPost);
  });

  app.put('/api/posts/:id', async (req, res) => {
    const posts = await readData('posts.json');
    const index = posts.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Post not found' });
    
    posts[index] = { ...posts[index], ...req.body, updatedAt: new Date().toISOString() };
    await writeData('posts.json', posts);
    res.json(posts[index]);
  });

  app.post('/api/deals/submit', async (req, res) => {
    const { businessName, title, description, discount, expiresAt, zip_code, createdByUsername } = req.body;
    if (!businessName || !title) {
      return res.status(400).json({ error: 'Business name and title are required' });
    }

    const posts = await readData('posts.json');
    const newDeal = {
      id: uuidv4(),
      businessId: null, // Not linked to a specific business ID from our DB
      businessName, // Store the name directly
      type: 'DEAL',
      title,
      body: description,
      discount: discount ? `${discount}%` : null,
      expiresAt,
      zip_code,
      createdByUsername: createdByUsername || 'Anonymous',
      createdAt: new Date().toISOString(),
      zip: req.query.zip || '90210' // Default or from query for feed filtering
    };

    // Prepend to array
    posts.unshift(newDeal);
    await writeData('posts.json', posts);
    res.status(201).json(newDeal);
  });

  // --- Reviews API ---
  app.get('/api/businesses/:id/reviews', async (req, res) => {
    const reviews = await readData('reviews.json');
    const users = await readData('users.json');
    const bReviews = reviews.filter(r => r.businessId === req.params.id && r.status === 'VERIFIED');
    bReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    const enrichedReviews = bReviews.map(r => {
      const user = users.find(u => u.id === r.userId);
      return { ...r, username: r.reviewedBy || r.username || user?.username };
    });

    res.json(enrichedReviews);
  });

  app.post('/api/businesses/:id/reviews', async (req, res) => {
    const { rating, comment, verificationAnswer, reviewedBy } = req.body;
    
    // Check if the answer matches ANY of the questions (simple enough for this requirement)
    const isValid = VERIFICATION_QUESTIONS.some(q => q.a === verificationAnswer.trim());
    
    if (!isValid) {
      return res.status(400).json({ error: 'Verification failed. Please provide the correct answer.' });
    }

    if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Invalid rating' });

    const reviews = await readData('reviews.json');
    const newReview = {
      id: uuidv4(),
      businessId: req.params.id,
      userId: 'anonymous', // No login, so anonymous or provided username
      reviewedBy: reviewedBy || 'Anonymous',
      rating,
      comment,
      status: 'VERIFIED', // Reviews appear automatically
      createdAt: new Date().toISOString()
    };

    reviews.push(newReview);
    await writeData('reviews.json', reviews);
    res.status(201).json(newReview);
  });

  app.get('/api/users/me/reviews', verifyToken, async (req, res) => {
    const reviews = await readData('reviews.json');
    const businesses = await readData('businesses.json');
    const userReviews = reviews.filter(r => r.userId === req.user.id);
    
    const enrichedReviews = userReviews.map(r => {
      const business = businesses.find(b => b.id === r.businessId);
      return { ...r, businessName: business?.name };
    });

    res.json(enrichedReviews);
  });

  app.delete('/api/reviews/:id', async (req, res) => {
    const { username } = req.query;
    const reviews = await readData('reviews.json');
    const review = reviews.find(r => r.id === req.params.id);
    
    if (!review) return res.status(404).json({ error: 'Review not found' });
    
    if (review.reviewedBy && username && review.reviewedBy.trim().toLowerCase() !== username.trim().toLowerCase()) {
      return res.status(403).json({ error: 'You can only delete your own reviews.' });
    }

    const filtered = reviews.filter(r => r.id !== req.params.id);
    await writeData('reviews.json', filtered);
    res.json({ message: 'Review deleted' });
  });

  app.post('/api/reviews/:id/reply', async (req, res) => {
    const { reply } = req.body;
    if (!reply) return res.status(400).json({ error: 'Reply text is required' });
    
    const reviews = await readData('reviews.json');
    const index = reviews.findIndex(r => r.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Review not found' });
    
    reviews[index].businessReply = reply;
    reviews[index].repliedAt = new Date().toISOString();
    await writeData('reviews.json', reviews);
    res.json(reviews[index]);
  });

  // --- Admin API ---
  app.get('/api/admin/reviews', async (req, res) => {
    const { status } = req.query;
    const reviews = await readData('reviews.json');
    const users = await readData('users.json');
    const businesses = await readData('businesses.json');

    let filtered = reviews;
    if (status) filtered = reviews.filter(r => r.status === status);

    const enriched = filtered.map(r => {
      const user = users.find(u => u.id === r.userId);
      const business = businesses.find(b => b.id === r.businessId);
      return { ...r, username: r.username || user?.username || 'Anonymous', businessName: business?.name };
    });

    res.json(enriched);
  });

  app.put('/api/admin/reviews/:id/verify', async (req, res) => {
    const reviews = await readData('reviews.json');
    const index = reviews.findIndex(r => r.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Review not found' });

    reviews[index].status = 'VERIFIED';
    reviews[index].verifiedAt = new Date().toISOString();
    await writeData('reviews.json', reviews);
    res.json(reviews[index]);
  });

  app.delete('/api/admin/reviews/:id', async (req, res) => {
    const reviews = await readData('reviews.json');
    const filtered = reviews.filter(r => r.id !== req.params.id);
    await writeData('reviews.json', filtered);
    res.json({ message: 'Review deleted' });
  });

  // --- AI API ---
  app.post('/api/ai/recommendations', async (req, res) => {
    const { zip, bio } = req.body;
    if (!zip || !bio) return res.status(400).json({ error: 'ZIP and Bio are required' });

    const businesses = await readData('businesses.json');
    const zipBusinesses = businesses.filter(b => b.zip === zip);

    if (zipBusinesses.length === 0) {
      return res.json({
        zip,
        suggestedCategories: [],
        recommendations: [],
        fallbackUsed: false,
        message: 'No businesses found in this ZIP code.'
      });
    }

    // Try Gemini
    const recommendations = await getRecommendations(bio, zip, zipBusinesses);

    if (recommendations) {
      return res.json({ ...recommendations, fallbackUsed: false });
    }

    // Fallback: Top rated in ZIP
    const reviews = await readData('reviews.json');
    const ratedBusinesses = zipBusinesses.map(b => {
      const bReviews = reviews.filter(r => r.businessId === b.id && r.status === 'VERIFIED');
      const avgRating = bReviews.length > 0 ? bReviews.reduce((sum, r) => sum + r.rating, 0) / bReviews.length : 0;
      return { ...b, avgRating, reviewCount: bReviews.length };
    });

    ratedBusinesses.sort((a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount);

    const fallbackRecs = ratedBusinesses.slice(0, 5).map(b => ({
      businessId: b.id,
      name: b.name,
      category: b.category,
      reason: "Highly rated in your area!"
    }));

    res.json({
      zip,
      suggestedCategories: [...new Set(zipBusinesses.map(b => b.category))],
      recommendations: fallbackRecs,
      fallbackUsed: true
    });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
