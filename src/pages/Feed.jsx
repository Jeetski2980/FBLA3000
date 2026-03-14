import React, { useEffect, useState } from 'react';
import { useProfile } from '../context/ProfileContext';
import FeedCard from '../components/FeedCard';
import { Loader2, Filter } from 'lucide-react';

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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 tabIndex={0} className="text-4xl font-black text-white tracking-tight">Community Feed</h1>
          <p className="text-white font-medium mt-1">What's happening in {zip}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Filter size={18} className="text-white" />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-xs font-black text-white focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-2xl uppercase tracking-widest"
          >
            <option value="" className="bg-bg">All Posts</option>
            <option value="DEAL" className="bg-bg">Deals Only</option>
            <option value="UPDATE" className="bg-bg">Updates Only</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="animate-spin text-white mb-6" size={48} />
          <p className="text-white font-black uppercase tracking-[0.2em] text-xs">Loading your neighborhood...</p>
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-8">
          {posts.map(post => (
            <FeedCard 
              key={post.id} 
              post={post} 
              onUpdate={handleUpdatePost}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white/10 rounded-[40px] border border-white/20 shadow-2xl">
          <p className="text-white font-black uppercase tracking-widest text-sm mb-2">No posts found</p>
          <p className="text-white text-xs font-medium">Be the first to share something in your area!</p>
        </div>
      )}
    </div>
  );
}
