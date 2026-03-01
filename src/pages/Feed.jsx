import React, { useEffect, useState } from 'react';
import { useProfile } from '../context/ProfileContext';
import { useUI } from '../context/UIContext';
import FeedCard from '../components/FeedCard';
import { Loader2, Filter, Sparkles, ArrowRight } from 'lucide-react';

export default function Feed() {
  const { profile } = useProfile();
  const { openPanel } = useUI();
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
      <div className="bg-[#111] border border-white/5 rounded-[40px] p-10 mb-16 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#c8ff57]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] group-hover:bg-[#c8ff57]/10 transition-all duration-700" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/5 p-3 rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl">
              <Sparkles size={28} className="text-[#c8ff57]" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">AI Powered Discovery</span>
          </div>
          
          <h2 className="text-4xl font-black mb-4 leading-tight text-white tracking-tight">
            Discover your next favorite spot in {zip || 'your area'}
          </h2>
          
          <p className="text-slate-400 mb-10 max-w-md leading-relaxed font-medium">
            Our AI analyzes local businesses and your interests to find the perfect matches just for you.
          </p>
          
          <button 
            onClick={() => openPanel('RECOMMENDATIONS')}
            className="inline-flex items-center justify-center gap-3 bg-[#c8ff57] text-black px-8 py-4 rounded-2xl font-black shadow-lg shadow-[#c8ff57]/20 hover:opacity-90 transition-all uppercase tracking-widest text-sm"
          >
            Get Recommendations
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-[700px] mx-auto mb-24 text-center">
        <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-6">
          Our Mission
        </div>
        <div className="bg-[#111] border-l-8 border-[#c8ff57] p-10 md:p-12 rounded-r-[40px] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#c8ff57]/5 to-transparent pointer-events-none" />
          <p className="text-2xl leading-[1.6] text-white italic font-serif relative z-10">
            "LocalPulse exists to rebuild the invisible thread that connects communities to the businesses that built them, giving every local shop, service, and hidden gem the visibility they deserve, and giving every resident a reason to look up from the algorithm and discover what's right around the corner."
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Community Feed</h1>
          <p className="text-slate-500 font-medium mt-1">What's happening in {zip}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Filter size={18} className="text-slate-600" />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="bg-[#111] border border-white/5 rounded-xl px-4 py-2 text-xs font-black text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20 shadow-2xl uppercase tracking-widest"
          >
            <option value="" className="bg-[#111]">All Posts</option>
            <option value="DEAL" className="bg-[#111]">Deals Only</option>
            <option value="UPDATE" className="bg-[#111]">Updates Only</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="animate-spin text-[#c8ff57] mb-6" size={48} />
          <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs">Loading your neighborhood...</p>
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-8">
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
        <div className="text-center py-24 bg-[#111] rounded-[40px] border border-white/5 shadow-2xl">
          <p className="text-slate-400 font-black uppercase tracking-widest text-sm mb-2">No posts found</p>
          <p className="text-slate-500 text-xs font-medium">Be the first to share something in your area!</p>
        </div>
      )}
    </div>
  );
}
