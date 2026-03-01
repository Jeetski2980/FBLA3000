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

  const handleDeleteDeal = (id) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Tag className="text-primary" size={32} />
          Local Deals
        </h1>
        <p className="text-slate-500">Save money while supporting local in {zip}</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary mb-4" size={40} />
          <p className="text-slate-500 font-medium">Hunting for deals...</p>
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-[18px]">
          {posts.map(post => (
            <FeedCard 
              key={post.id} 
              post={post} 
              onDelete={handleDeleteDeal}
              onUpdate={handleUpdateDeal}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
          <p className="text-slate-500 font-medium">No active deals in this area right now.</p>
          <p className="text-slate-400 text-sm mt-1">Check back soon for new offers!</p>
        </div>
      )}
    </div>
  );
}
