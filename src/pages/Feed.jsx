import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import FeedCard from '../components/FeedCard';
import { Loader2, Filter, Sparkles, ArrowRight } from 'lucide-react';

export default function Feed() {
  const { profile } = useProfile();
  const { zip } = profile;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('');

  useEffect(() => {
    if (!zip) return;
    setLoading(true);
    fetch(`/api/feed?zip=${zip}${type ? `&type=${type}` : ''}`)
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [zip, type]);

  const handleUpdatePost = (updated) => {
    setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleDeletePost = (id) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* AI Recommendations Hero */}
      <div className="bg-gradient-to-br from-primary to-secondary rounded-3xl p-8 mb-12 text-white shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-white/20 transition-all duration-500" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <Sparkles size={24} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest opacity-80">AI Powered Discovery</span>
          </div>
          
          <h2 className="text-3xl font-bold mb-3 leading-tight">
            Discover your next favorite spot in {zip || 'your area'}
          </h2>
          
          <p className="text-white/80 mb-8 max-w-md leading-relaxed">
            Our AI analyzes local businesses and your interests to find the perfect matches just for you.
          </p>
          
          <Link 
            to="/profile" 
            className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            Get Recommendations
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-white rounded-3xl p-8 mb-12 border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Our Mission</h2>
        <p className="text-slate-600 leading-relaxed">
          Local Pulse connects local businesses with nearby customers. 
          Our mission is to help small businesses share updates, deals, and events with their community — completely free. 
          Unlike other platforms, Local Pulse does not charge listing fees or advertising costs.
        </p>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Community Feed</h1>
          <p className="text-slate-500">What's happening in {zip}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All Posts</option>
            <option value="DEAL">Deals Only</option>
            <option value="UPDATE">Updates Only</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary mb-4" size={40} />
          <p className="text-slate-500 font-medium">Loading your neighborhood...</p>
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map(post => (
            <FeedCard 
              key={post.id} 
              post={post} 
              onDelete={handleDeletePost}
              onUpdate={handleUpdatePost}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
          <p className="text-slate-500 font-medium">No posts found in this area yet.</p>
          <p className="text-slate-400 text-sm mt-1">Be the first to share something!</p>
        </div>
      )}
    </div>
  );
}
