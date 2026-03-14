import React, { useEffect, useState } from 'react';
import { useProfile } from '../context/ProfileContext';
import FeedCard from '../components/FeedCard';
import { Loader2, Tag } from 'lucide-react';

export default function Deals() {
  const { profile } = useProfile();
  const { zip } = profile;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!zip) return;
    setLoading(true);
    fetch(`/api/feed?zip=${zip}&type=DEAL`)
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [zip]);

  const handleUpdateDeal = (updated) => {
    setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-12">
        <h1 tabIndex={0} className="text-4xl font-black text-white flex items-center gap-4 tracking-tight">
          <Tag className="text-white" size={40} />
          Local Deals
        </h1>
        <p className="text-white font-medium mt-2">Save money while supporting local in {zip}</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="animate-spin text-white mb-6" size={48} />
          <p className="text-white font-black uppercase tracking-[0.2em] text-xs">Hunting for deals...</p>
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map(post => (
            <FeedCard 
              key={post.id} 
              post={post} 
              onUpdate={handleUpdateDeal}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white/10 rounded-[40px] border border-white/20 shadow-2xl">
          <p className="text-white font-black uppercase tracking-widest text-sm mb-2">No active deals</p>
          <p className="text-white text-xs font-medium">Check back soon for new offers in your area!</p>
        </div>
      )}
    </div>
  );
}
