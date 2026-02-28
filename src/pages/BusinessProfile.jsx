import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { Star, MapPin, Globe, Loader2, MessageSquare, CheckCircle2, Send, User, PlusCircle, Tag, Megaphone, Info } from 'lucide-react';
import ReviewCard from '../components/ReviewCard';
import FeedCard from '../components/FeedCard';
import { VERIFICATION_QUESTIONS } from '../constants';

export default function BusinessProfile() {
  const { id } = useParams();
  const { profile } = useProfile();
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewUsername, setReviewUsername] = useState(profile.username || '');
  const [verification, setVerification] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState({ q: '', a: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeReplyId, setActiveReplyId] = useState(null);

  // Post form state
  const [showPostForm, setShowPostForm] = useState(false);
  const [postData, setPostData] = useState({
    type: 'UPDATE',
    title: '',
    body: '',
    imageUrl: '',
    couponCode: '',
    expiresAt: ''
  });
  const [postSubmitting, setPostSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
    // Set a random verification question
    const randomQ = VERIFICATION_QUESTIONS[Math.floor(Math.random() * VERIFICATION_QUESTIONS.length)];
    setCurrentQuestion(randomQ);
  }, [id]);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch(`/api/businesses/${id}`).then(res => res.json()),
      fetch(`/api/businesses/${id}/reviews`).then(res => res.json()),
      fetch(`/api/businesses/${id}/posts`).then(res => res.json())
    ]).then(([bData, rData, pData]) => {
      setBusiness(bData);
      setReviews(rData);
      setPosts(pData);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const submitReview = async (e) => {
    e.preventDefault();
    
    if (!profile.username.trim()) {
      setMessage({ type: 'error', text: 'Set your username at the top of the page before leaving a review' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch(`/api/businesses/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          rating, 
          comment, 
          verificationAnswer: verification,
          reviewedBy: profile.username
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'Review submitted! It is now live.' });
        setComment('');
        setVerification('');
        // New question for next review
        const randomQ = VERIFICATION_QUESTIONS[Math.floor(Math.random() * VERIFICATION_QUESTIONS.length)];
        setCurrentQuestion(randomQ);
        fetchData(); // Refresh reviews
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to submit review' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Something went wrong.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = (reviewId) => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
  };

  const handleReplyReview = (updatedReview) => {
    setReviews(prev => prev.map(r => r.id === updatedReview.id ? updatedReview : r));
    setActiveReplyId(null);
  };

  const submitPost = async (e) => {
    e.preventDefault();
    setPostSubmitting(true);
    try {
      const res = await fetch(`/api/businesses/${id}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });
      if (res.ok) {
        setPostData({ type: 'UPDATE', title: '', body: '', imageUrl: '', couponCode: '', expiresAt: '' });
        setShowPostForm(false);
        fetchData(); // Refresh posts
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPostSubmitting(false);
    }
  };

  const handleUpdatePost = (updated) => {
    setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleDeletePost = (id) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin text-primary mb-4" size={40} />
        <p className="text-slate-500 font-medium">Loading business profile...</p>
      </div>
    );
  }

  if (!business) return <div className="text-center py-20">Business not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-1/3 aspect-square rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center">
            {business.imageUrl ? (
              <img
                src={business.imageUrl}
                alt={business.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-300">
                <PlusCircle size={48} className="mb-2 opacity-20" />
                <span className="text-xs font-bold uppercase tracking-widest opacity-40">No Image Provided</span>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
                {business.category}
              </span>
              {business.createdByUsername === (profile.username || 'Anonymous') && (
                <button 
                  onClick={() => setShowPostForm(!showPostForm)}
                  className="text-xs font-bold text-secondary flex items-center gap-1 hover:underline"
                >
                  <Megaphone size={14} />
                  Business Owner? Post Update
                </button>
              )}
            </div>

            <h1 className="text-4xl font-black mb-2" style={{ color: '#111111' }}>{business.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                <Star size={20} className="text-yellow-400 fill-yellow-400" />
                <span className="text-lg font-bold text-slate-900">{business.avgRating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <MessageSquare size={16} />
                <span className="text-sm font-bold uppercase tracking-tighter">{business.reviewCount} Reviews</span>
              </div>
            </div>

            <p className="text-slate-600 mb-8 leading-relaxed">
              {business.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-slate-500 text-sm">
                <MapPin size={18} className="text-primary" />
                {business.address || business.zip}
              </div>
              {business.website && (
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-secondary text-sm font-medium hover:underline"
                >
                  <Globe size={18} />
                  {business.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Business Owner Post Form */}
      {showPostForm && (
        <div className="bg-secondary/5 border border-secondary/20 rounded-3xl p-8 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Megaphone className="text-secondary" />
            Post to Community Feed
          </h2>
          <form onSubmit={submitPost} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Post Type</label>
                <select 
                  value={postData.type}
                  onChange={(e) => setPostData({...postData, type: e.target.value})}
                  className="input"
                >
                  <option value="UPDATE">General Update</option>
                  <option value="DEAL">Special Deal / Coupon</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Title</label>
                <input 
                  type="text"
                  required
                  value={postData.title}
                  onChange={(e) => setPostData({...postData, title: e.target.value})}
                  className="input"
                  placeholder="e.g. New Seasonal Menu!"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Message</label>
              <textarea 
                required
                value={postData.body}
                onChange={(e) => setPostData({...postData, body: e.target.value})}
                className="input min-h-[100px]"
                placeholder="Share the details with your neighbors..."
              />
            </div>
            {postData.type === 'DEAL' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Coupon Code (Optional)</label>
                  <input 
                    type="text"
                    value={postData.couponCode}
                    onChange={(e) => setPostData({...postData, couponCode: e.target.value})}
                    className="input"
                    placeholder="e.g. LOCAL20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Expires At (Optional)</label>
                  <input 
                    type="date"
                    value={postData.expiresAt}
                    onChange={(e) => setPostData({...postData, expiresAt: e.target.value})}
                    className="input"
                  />
                </div>
              </div>
            )}
            <button 
              type="submit" 
              disabled={postSubmitting}
              className={`w-full flex items-center justify-center gap-2 font-bold py-4 rounded-2xl transition-all ${
                postData.type === 'DEAL' 
                  ? 'bg-brand-green text-slate-900 hover:opacity-88 shadow-lg shadow-brand-green/20' 
                  : 'btn-primary'
              }`}
            >
              {postSubmitting ? <Loader2 className="animate-spin" /> : (postData.type === 'DEAL' ? <Tag /> : <PlusCircle />)}
              {postData.type === 'DEAL' ? 'Publish Deal' : 'Publish to Feed'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Posts & Deals */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              Recent Updates & Deals
            </h2>
            {posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map(post => (
                  <FeedCard 
                    key={post.id} 
                    post={{ ...post, businessName: business.name, businessCategory: business.category }} 
                    onDelete={handleDeletePost}
                    onUpdate={handleUpdatePost}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center text-slate-500">
                No recent updates from this business.
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Reviews */}
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              Community Reviews
            </h2>
            
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-6">
              <h3 className="font-bold text-slate-900 mb-4">Leave a Review</h3>
              <form onSubmit={submitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`p-1 transition-colors ${star <= rating ? 'text-yellow-400' : 'text-slate-200'}`}
                      >
                        <Star size={24} fill={star <= rating ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Comment</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    className="input min-h-[100px] text-sm"
                    placeholder="Share your experience..."
                  />
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Verification: {currentQuestion.q}</label>
                    <div className="group relative">
                      <Info size={14} className="text-slate-300 cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                        Verification is used to prevent bot reviews and ensure authentic community feedback.
                      </div>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={verification}
                    onChange={(e) => setVerification(e.target.value)}
                    required
                    className="input text-sm"
                    placeholder="Answer here"
                  />
                </div>

                {message.text && (
                  <div className={`p-3 rounded-xl text-xs font-medium ${
                    message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                  }`}>
                    {message.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                  Submit Review
                </button>
              </form>
            </div>

            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map(review => (
                  <ReviewCard 
                    key={review.id} 
                    review={review} 
                    onDelete={handleDeleteReview}
                    onReply={handleReplyReview}
                    isActive={activeReplyId === review.id}
                    onActivate={() => setActiveReplyId(review.id)}
                  />
                ))
              ) : (
                <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center text-slate-500">
                  No reviews yet. Be the first!
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
