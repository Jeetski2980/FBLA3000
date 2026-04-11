import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { readData, writeData } from './server/src/utils/storage.js';
import { generateToken, verifyToken, isAdmin } from './server/src/middleware/auth.js';
import { getRecommendations } from './server/src/ai/geminiClient.js';
import { VERIFICATION_QUESTIONS } from './src/constants.js';

async function startServer() { // Boot the API and Vite server
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const dataDirectory = path.join(process.cwd(), 'server', 'data');
  const homeStatsClients = new Set(); // Open SSE connections
  const reviewStreamClients = new Map();
  const businessPostStreamClients = new Map();
  const feedStreamClients = new Set();
  const staticSitemapRoutes = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/feed', priority: '0.9', changefreq: 'daily' },
    { path: '/explore', priority: '0.9', changefreq: 'daily' },
    { path: '/deals', priority: '0.8', changefreq: 'daily' },
  ];

  app.use(express.json());
  app.use(cookieParser());

  const getBaseUrl = (req) => {
    const protocolHeader = req.headers['x-forwarded-proto'];
    const forwardedProtocol = Array.isArray(protocolHeader)
      ? protocolHeader[0]
      : protocolHeader?.split(',')[0]?.trim();
    const protocol = forwardedProtocol || req.protocol || 'http';
    return `${protocol}://${req.get('host')}`;
  };

  const buildSitemapUrlEntry = ({ loc, lastmod, changefreq, priority }) => [
    '  <url>',
    `    <loc>${loc}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
    priority ? `    <priority>${priority}</priority>` : null,
    '  </url>',
  ].filter(Boolean).join('\n');

  const getUserCount = async () => {
    const users = await readData('users.json');
    return Array.isArray(users)
      ? users.filter((user) => typeof user?.username === 'string' && user.username.trim()).length
      : 0;
  };

  const getBusinessCount = async () => {
    const businesses = await readData('businesses.json');
    return Array.isArray(businesses) ? businesses.length : 0;
  };

  const getHomeStats = async () => { // Combined home page totals
    const [users, businesses] = await Promise.all([
      getUserCount(),
      getBusinessCount()
    ]);

    return { users, businesses };
  };

  const googleMapsApiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

  const isPlaceholderImageUrl = (url) => typeof url === 'string' && url.includes('picsum.photos');

  const buildGooglePlacePhotoUrl = (photoName) => {
    if (!photoName || !googleMapsApiKey) {
      return '';
    }

    const params = new URLSearchParams({
      key: googleMapsApiKey,
      maxWidthPx: '1600',
      maxHeightPx: '1200',
    });

    return `https://places.googleapis.com/v1/${photoName}/media?${params.toString()}`;
  };

  const normalizeImageAttributions = (attributions) => (
    Array.isArray(attributions)
      ? attributions
        .map((attribution) => ({
          displayName: attribution?.displayName || '',
          uri: attribution?.uri || '',
        }))
        .filter((attribution) => attribution.displayName)
      : []
  );

  const fetchGooglePlacePhotoData = async (placeId) => {
    if (!googleMapsApiKey || !placeId) {
      return null;
    }

    try {
      const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
        headers: {
          'X-Goog-Api-Key': googleMapsApiKey,
          'X-Goog-FieldMask': 'id,photos.name,photos.authorAttributions.displayName,photos.authorAttributions.uri',
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const primaryPhoto = Array.isArray(data?.photos) ? data.photos[0] : null;
      const imageUrl = buildGooglePlacePhotoUrl(primaryPhoto?.name);

      if (!imageUrl) {
        return null;
      }

      return {
        imageUrl,
        imageAttributions: normalizeImageAttributions(primaryPhoto?.authorAttributions),
      };
    } catch (error) {
      console.error(`Failed to load Google photo for place ${placeId}:`, error);
      return null;
    }
  };

  const hydrateBusinessesWithGooglePhotos = async (businesses) => {
    if (!Array.isArray(businesses) || businesses.length === 0) {
      return [];
    }

    const placeIds = [...new Set(
      businesses
        .map((business) => business?.googlePlaceId)
        .filter(Boolean)
    )];

    if (!googleMapsApiKey || placeIds.length === 0) {
      return businesses;
    }

    const photoEntries = await Promise.all(
      placeIds.map(async (placeId) => [placeId, await fetchGooglePlacePhotoData(placeId)])
    );

    const photoMap = new Map(
      photoEntries.filter(([, value]) => Boolean(value))
    );

    return businesses.map((business) => {
      const googlePhoto = photoMap.get(business.googlePlaceId);
      const hasCustomImage = business.imageUrl && !isPlaceholderImageUrl(business.imageUrl);

      if (!googlePhoto || hasCustomImage) {
        return business;
      }

      return {
        ...business,
        imageUrl: googlePhoto.imageUrl,
        imageAttributions: googlePhoto.imageAttributions,
        imageSource: 'google-places',
      };
    });
  };

  const attachBusinessDetailsToPosts = (posts, businesses) => {
    const businessMap = new Map(
      Array.isArray(businesses)
        ? businesses.map((business) => [business.id, business])
        : []
    );

    return posts.map((post) => {
      const business = businessMap.get(post.businessId);
      const shouldUseBusinessPhoto = business?.imageUrl && (!post.imageUrl || isPlaceholderImageUrl(post.imageUrl));

      return {
        ...post,
        imageUrl: shouldUseBusinessPhoto ? business.imageUrl : post.imageUrl,
        imageAttributions: shouldUseBusinessPhoto ? business.imageAttributions || [] : post.imageAttributions || [],
        imageSource: shouldUseBusinessPhoto ? business.imageSource : post.imageSource,
        businessName: post.businessName || business?.name,
        businessCategory: post.businessCategory || business?.category || 'Local',
      };
    });
  };

  const writeSseEvent = (res, event, payload) => { // Send one SSE message
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  const initializeSse = (res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();
    res.write('retry: 5000\n\n');
  };

  const addScopedSseClient = (clientMap, scope, res) => {
    const clients = clientMap.get(scope) || new Set();
    clients.add(res);
    clientMap.set(scope, clients);
  };

  const removeScopedSseClient = (clientMap, scope, res) => {
    const clients = clientMap.get(scope);

    if (!clients) {
      return;
    }

    clients.delete(res);

    if (clients.size === 0) {
      clientMap.delete(scope);
    }
  };

  const attachSseHeartbeat = (req, res, removeClient) => {
    const heartbeat = setInterval(() => {
      res.write(': keepalive\n\n');
    }, 30000);

    req.on('close', () => {
      clearInterval(heartbeat);
      removeClient();
      res.end();
    });
  };

  const broadcastReviewChange = (businessId) => {
    const clients = reviewStreamClients.get(businessId);

    if (!clients) {
      return;
    }

    for (const client of clients) {
      writeSseEvent(client, 'reviews-changed', { businessId });
    }
  };

  const broadcastBusinessPostChange = (businessId) => {
    if (!businessId) {
      return;
    }

    const clients = businessPostStreamClients.get(businessId);

    if (!clients) {
      return;
    }

    for (const client of clients) {
      writeSseEvent(client, 'posts-changed', { businessId });
    }
  };

  const broadcastFeedChange = ({ zip, type }) => {
    for (const client of feedStreamClients) {
      if (client.zip && client.zip !== zip) {
        continue;
      }

      if (client.type && client.type !== type) {
        continue;
      }

      writeSseEvent(client.res, 'feed-changed', { zip, type });
    }
  };

  const broadcastHomeStats = async () => { // Push fresh stats to clients
    try {
      const stats = await getHomeStats();
      for (const client of homeStatsClients) {
        writeSseEvent(client, 'home-stats', stats);
      }
    } catch (error) {
      console.error('Failed to broadcast home stats:', error);
      for (const client of homeStatsClients) {
        writeSseEvent(client, 'home-stats-error', { message: 'Failed to load home stats' });
      }
    }
  };

  let homeStatsBroadcastTimeout;
  fs.watch(dataDirectory, (_eventType, filename) => {
    if (
      filename &&
      filename !== 'users.json' &&
      filename !== 'users.json.tmp' &&
      filename !== 'businesses.json' &&
      filename !== 'businesses.json.tmp'
    ) {
      return;
    }

    clearTimeout(homeStatsBroadcastTimeout);
    homeStatsBroadcastTimeout = setTimeout(() => {
      void broadcastHomeStats();
    }, 100);
  });

  app.get('/api/home/stats', async (_req, res) => {
    try {
      const stats = await getHomeStats();
      res.json(stats);
    } catch (error) {
      console.error('Failed to load home stats:', error);
      res.status(500).json({ error: 'Failed to load home stats' });
    }
  });

  app.get('/api/home/stats/stream', async (req, res) => {
    initializeSse(res);

    homeStatsClients.add(res);

    try {
      const stats = await getHomeStats();
      writeSseEvent(res, 'home-stats', stats);
    } catch (error) {
      console.error('Failed to initialize home stats stream:', error);
      writeSseEvent(res, 'home-stats-error', { message: 'Failed to load home stats' });
    }

    attachSseHeartbeat(req, res, () => {
      homeStatsClients.delete(res);
    });
  });

  app.get('/api/users/count', async (_req, res) => {
    try {
      const count = await getUserCount();
      res.json({ count });
    } catch (error) {
      console.error('Failed to load user count:', error);
      res.status(500).json({ error: 'Failed to load user count' });
    }
  });

  app.get('/api/users/count/stream', async (req, res) => {
    initializeSse(res);

    homeStatsClients.add(res);

    try {
      const count = await getUserCount();
      writeSseEvent(res, 'user-count', { count });
    } catch (error) {
      console.error('Failed to initialize user count stream:', error);
      writeSseEvent(res, 'user-count-error', { message: 'Failed to load user count' });
    }

    attachSseHeartbeat(req, res, () => {
      homeStatsClients.delete(res);
    });
  });

  app.get('/api/businesses/:id/reviews/stream', (req, res) => {
    initializeSse(res);
    addScopedSseClient(reviewStreamClients, req.params.id, res);
    writeSseEvent(res, 'reviews-ready', { businessId: req.params.id });
    attachSseHeartbeat(req, res, () => {
      removeScopedSseClient(reviewStreamClients, req.params.id, res);
    });
  });

  app.get('/api/businesses/:id/posts/stream', (req, res) => {
    initializeSse(res);
    addScopedSseClient(businessPostStreamClients, req.params.id, res);
    writeSseEvent(res, 'posts-ready', { businessId: req.params.id });
    attachSseHeartbeat(req, res, () => {
      removeScopedSseClient(businessPostStreamClients, req.params.id, res);
    });
  });

  app.get('/api/feed/stream', (req, res) => {
    const zip = typeof req.query.zip === 'string' ? req.query.zip : '';
    const type = typeof req.query.type === 'string' ? req.query.type : '';
    const client = { res, zip, type };

    initializeSse(res);
    feedStreamClients.add(client);
    writeSseEvent(res, 'feed-ready', { zip, type });
    attachSseHeartbeat(req, res, () => {
      feedStreamClients.delete(client);
    });
  });

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

    businesses = await hydrateBusinessesWithGooglePhotos(businesses);

    res.json(businesses);
  });

  app.get('/api/businesses/:id', async (req, res) => {
    const businesses = await readData('businesses.json');
    const [business] = await hydrateBusinessesWithGooglePhotos(
      businesses.filter(b => b.id === req.params.id)
    );
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
    const businesses = await hydrateBusinessesWithGooglePhotos(await readData('businesses.json'));

    if (zip) posts = posts.filter(p => p.zip === zip);
    if (type) posts = posts.filter(p => p.type === type);

    // Filter out expired deals
    const now = new Date();
    posts = posts.filter(p => !p.expiresAt || new Date(p.expiresAt) > now);

    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const enrichedPosts = attachBusinessDetailsToPosts(posts, businesses);

    res.json(enrichedPosts);
  });

  app.get('/api/businesses/:id/posts', async (req, res) => {
    let posts = await readData('posts.json');
    const businesses = await hydrateBusinessesWithGooglePhotos(await readData('businesses.json'));
    posts = posts.filter(p => p.businessId === req.params.id);
    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(attachBusinessDetailsToPosts(posts, businesses));
  });

  app.post('/api/businesses/:id/posts', async (req, res) => {
    const { type, title, body, imageUrl, couponCode, expiresAt, createdByUsername } = req.body;
    const businesses = await readData('businesses.json');
    const business = businesses.find(b => b.id === req.params.id);
    if (!business) return res.status(404).json({ error: 'Business not found' });

    const businessOwner = business.createdByUsername || business.createdBy;
    if (businessOwner && businessOwner !== createdByUsername) {
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
    broadcastBusinessPostChange(newPost.businessId);
    broadcastFeedChange({ zip: newPost.zip, type: newPost.type });
    const [hydratedBusiness] = await hydrateBusinessesWithGooglePhotos([business]);
    res.status(201).json(attachBusinessDetailsToPosts([newPost], [hydratedBusiness])[0]);
  });

  app.put('/api/posts/:id', async (req, res) => {
    const { username } = req.query;
    const posts = await readData('posts.json');
    const index = posts.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Post not found' });
    
    const post = posts[index];
    if (post.createdByUsername && username && post.createdByUsername.trim().toLowerCase() !== username.trim().toLowerCase()) {
      return res.status(403).json({ error: 'You can only edit posts that you created.' });
    }

    posts[index] = { ...posts[index], ...req.body, updatedAt: new Date().toISOString() };
    await writeData('posts.json', posts);
    broadcastBusinessPostChange(posts[index].businessId);
    broadcastFeedChange({ zip: posts[index].zip, type: posts[index].type });
    const businesses = await hydrateBusinessesWithGooglePhotos(await readData('businesses.json'));
    res.json(attachBusinessDetailsToPosts([posts[index]], businesses)[0]);
  });

  app.delete('/api/posts/:id', async (req, res) => {
    const { username } = req.query;
    const posts = await readData('posts.json');
    const post = posts.find(p => p.id === req.params.id);
    
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    if (post.createdByUsername && username && post.createdByUsername.trim().toLowerCase() !== username.trim().toLowerCase()) {
      return res.status(403).json({ error: 'You can only delete posts that you created.' });
    }

    const filtered = posts.filter(p => p.id !== req.params.id);
    await writeData('posts.json', filtered);
    broadcastBusinessPostChange(post.businessId);
    broadcastFeedChange({ zip: post.zip, type: post.type });
    res.json({ message: 'Post deleted' });
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
    broadcastFeedChange({ zip: newDeal.zip, type: newDeal.type });
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
    broadcastReviewChange(newReview.businessId);
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
    broadcastReviewChange(review.businessId);
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
    broadcastReviewChange(reviews[index].businessId);
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
    broadcastReviewChange(reviews[index].businessId);
    res.json(reviews[index]);
  });

  app.delete('/api/admin/reviews/:id', async (req, res) => {
    const reviews = await readData('reviews.json');
    const review = reviews.find(r => r.id === req.params.id);
    const filtered = reviews.filter(r => r.id !== req.params.id);
    await writeData('reviews.json', filtered);
    if (review) {
      broadcastReviewChange(review.businessId);
    }
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

  app.get('/robots.txt', async (req, res) => {
    const baseUrl = getBaseUrl(req);
    const robots = [
      'User-agent: *',
      'Allow: /',
      'Disallow: /admin',
      `Sitemap: ${baseUrl}/sitemap.xml`,
    ].join('\n');

    res.type('text/plain').send(robots);
  });

  app.get('/sitemap.xml', async (req, res) => {
    const baseUrl = getBaseUrl(req);
    const businesses = await readData('businesses.json');

    const staticEntries = staticSitemapRoutes.map((route) => buildSitemapUrlEntry({
      loc: `${baseUrl}${route.path}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: route.changefreq,
      priority: route.priority,
    }));

    const businessEntries = Array.isArray(businesses)
      ? businesses.map((business) => buildSitemapUrlEntry({
        loc: `${baseUrl}/business/${business.id}`,
        lastmod: business.createdAt
          ? new Date(business.createdAt).toISOString().split('T')[0]
          : undefined,
        changefreq: 'weekly',
        priority: '0.7',
      }))
      : [];

    const sitemap = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...staticEntries,
      ...businessEntries,
      '</urlset>',
    ].join('\n');

    res.type('application/xml').send(sitemap);
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
