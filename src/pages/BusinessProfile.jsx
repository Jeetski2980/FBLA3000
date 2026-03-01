import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { useUI } from '../context/UIContext';
import { Star, MapPin, Globe, Loader2, MessageSquare, CheckCircle2, Send, User, PlusCircle, Tag, Megaphone, Info, Bookmark } from 'lucide-react';
import ReviewCard from '../components/ReviewCard';
import FeedCard from '../components/FeedCard';
import { VERIFICATION_QUESTIONS } from '../constants';

export default function BusinessProfile() {
  const { id } = useParams();
  const { profile, toggleBookmark } = useProfile();
  const { showToast } = useUI();
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const isBookmarked = profile.bookmarks?.includes(id);

  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
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

  const handleBookmark = () => {
    toggleBookmark(id);
    showToast(isBookmarked ? 'Bookmark removed' : 'Bookmarked! 🔖');
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
        const randomQ = VERIFICATION_QUESTIONS[Math.floor(Math.random() * VERIFICATION_QUESTIONS.length)];
        setCurrentQuestion(randomQ);
        fetchData();
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
        fetchData();
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
        <Loader2 className="animate-spin text-[#c8ff57] mb-4" size={40} />
        <p className="text-slate-500 font-medium">Loading business profile...</p>
      </div>
    );
  }

  if (!business) return <div className="text-center py-20 text-white">Business not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="bg-[#111] rounded-[40px] p-8 border border-white/5 shadow-2xl mb-8">
        <div className="flex flex-col md:flex-row gap-10 items-start">
          <div className="w-full md:w-1/3 aspect-square rounded-[32px] overflow-hidden bg-white/5 flex items-center justify-center relative">
            {business.imageUrl ? (
              <img
                src={business.imageUrl}
                alt={business.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-700">
                <PlusCircle size={48} className="mb-2 opacity-20" />
                <span className="text-xs font-bold uppercase tracking-widest opacity-40">No Image</span>
              </div>
            )}
            <button 
              onClick={handleBookmark}
              className={`absolute top-4 right-4 p-3 rounded-2xl backdrop-blur-md transition-all border ${
                isBookmarked 
                  ? 'bg-[#c8ff57] text-black border-[#c8ff57] shadow-lg' 
                  : 'bg-black/40 text-white border-white/20 hover:bg-black/60'
              }`}
            >
              <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} />
            </button>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-black text-black uppercase tracking-[0.2em] bg-[#c8ff57] px-4 py-1.5 rounded-full shadow-lg shadow-[#c8ff57]/10">
                {business.category}
              </span>
              {business.createdByUsername === (profile.username || 'Anonymous') && (
                <button 
                  onClick={() => setShowPostForm(!showPostForm)}
                  className="text-xs font-bold text-[#c8ff57] flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <Megaphone size={16} />
                  Post Update
                </button>
              )}
            </div>

            <h1 className="text-5xl font-black text-white mb-4 tracking-tight">{business.name}</h1>
            
            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
                <Star size={20} className="text-[#c8ff57] fill-[#c8ff57]" />
                <span className="text-xl font-black text-white">{business.avgRating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <MessageSquare size={18} />
                <span className="text-sm font-bold uppercase tracking-widest">{business.reviewCount} Reviews</span>
              </div>
            </div>

            <p className="text-slate-400 text-lg mb-10 leading-relaxed max-w-2xl">
              {business.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-4 text-slate-300">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                  <MapPin size={20} className="text-[#c8ff57]" />
                </div>
                <span className="font-medium">{business.address || business.zip}</span>
              </div>
              {business.website && (
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 text-slate-300 hover:text-[#c8ff57] transition-colors"
                >
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    <Globe size={20} className="text-[#c8ff57]" />
                  </div>
                  <span className="font-medium underline underline-offset-4">{business.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Business Owner Post Form */}
      {showPostForm && (
        <div className="bg-[#111] border border-[#c8ff57]/30 rounded-[40px] p-10 mb-8 shadow-2xl">
          <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
            <Megaphone className="text-[#c8ff57]" size={28} />
            Post to Community Feed
          </h2>
          <form onSubmit={submitPost} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Post Type</label>
                <select 
                  value={postData.type}
                  onChange={(e) => setPostData({...postData, type: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20"
                >
                  <option value="UPDATE" className="bg-[#111]">General Update</option>
                  <option value="DEAL" className="bg-[#111]">Special Deal / Coupon</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Title</label>
                <input 
                  type="text"
                  required
                  value={postData.title}
                  onChange={(e) => setPostData({...postData, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20"
                  placeholder="e.g. New Seasonal Menu!"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Message</label>
              <textarea 
                required
                value={postData.body}
                onChange={(e) => setPostData({...postData, body: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20 min-h-[120px]"
                placeholder="Share the details with your neighbors..."
              />
            </div>
            {postData.type === 'DEAL' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Coupon Code (Optional)</label>
                  <input 
                    type="text"
                    value={postData.couponCode}
                    onChange={(e) => setPostData({...postData, couponCode: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20"
                    placeholder="e.g. LOCAL20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Expires At (Optional)</label>
                  <input 
                    type="date"
                    value={postData.expiresAt}
                    onChange={(e) => setPostData({...postData, expiresAt: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20"
                  />
                </div>
              </div>
            )}
            <button 
              type="submit" 
              disabled={postSubmitting}
              className="w-full flex items-center justify-center gap-3 font-black py-5 rounded-2xl transition-all bg-[#c8ff57] text-black shadow-lg shadow-[#c8ff57]/20 hover:opacity-90"
            >
              {postSubmitting ? <Loader2 className="animate-spin" /> : (postData.type === 'DEAL' ? <Tag size={20} /> : <PlusCircle size={20} />)}
              {postData.type === 'DEAL' ? 'Publish Deal' : 'Publish to Feed'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Posts & Deals */}
        <div className="lg:col-span-2 space-y-10">
          <section>
            <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
              Updates & Deals
            </h2>
            {posts.length > 0 ? (
              <div className="space-y-8">
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
              <div className="bg-[#111] rounded-[32px] p-12 border border-white/5 text-center text-slate-500">
                No recent updates from this business.
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Reviews */}
        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
              Reviews
            </h2>
            
            <div className="bg-[#111] rounded-[32px] p-8 border border-white/5 shadow-xl mb-8">
              <h3 className="font-black text-white mb-6 uppercase tracking-widest text-sm">Leave a Review</h3>
              <form onSubmit={submitReview} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`p-1 transition-colors ${star <= rating ? 'text-[#c8ff57]' : 'text-slate-800'}`}
                      >
                        <Star size={28} fill={star <= rating ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Comment</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20 min-h-[120px] text-sm"
                    placeholder="Share your experience..."
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Verification: {currentQuestion.q}</label>
                    <div className="group relative">
                      <Info size={14} className="text-slate-600 cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-3 bg-slate-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-2xl border border-white/10">
                        Verification is used to prevent bot reviews and ensure authentic community feedback.
                      </div>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={verification}
                    onChange={(e) => setVerification(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20 text-sm"
                    placeholder="Answer here"
                  />
                </div>

                {message.text && (
                  <div className={`p-4 rounded-2xl text-xs font-bold ${
                    message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {message.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-3 font-black py-4 rounded-2xl transition-all bg-[#c8ff57] text-black shadow-lg shadow-[#c8ff57]/20 hover:opacity-90"
                >
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                  Submit Review
                </button>
              </form>
            </div>

            <div className="space-y-6">
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
                <div className="bg-[#111] rounded-[32px] p-12 border border-white/5 text-center text-slate-500">
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
