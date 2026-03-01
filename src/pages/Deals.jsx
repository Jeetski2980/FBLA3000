import React, { useEffect, useState } from 'react';
import { useProfile } from '../context/ProfileContext';
import { useUI } from '../context/UIContext';
import FeedCard from '../components/FeedCard';
import { Loader2, Tag, PlusCircle } from 'lucide-react';

export default function Deals() {
  const { profile } = useProfile();
  const { openPanel } = useUI();
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
      <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-4 tracking-tight">
            <Tag className="text-[#c8ff57]" size={40} />
            Local Deals
          </h1>
          <p className="text-slate-500 font-medium mt-2">Save money while supporting local in {zip}</p>
        </div>
        <button 
          onClick={() => openPanel('PUBLISH_DEAL')}
          className="flex items-center justify-center gap-3 bg-[#c8ff57] text-black px-8 py-4 rounded-2xl font-black shadow-lg shadow-[#c8ff57]/20 hover:opacity-90 transition-all uppercase tracking-widest text-sm"
        >
          <PlusCircle size={20} />
          Publish Deal
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="animate-spin text-[#c8ff57] mb-6" size={48} />
          <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs">Hunting for deals...</p>
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-6">
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
        <div className="text-center py-24 bg-[#111] rounded-[40px] border border-white/5 shadow-2xl">
          <p className="text-slate-400 font-black uppercase tracking-widest text-sm mb-2">No active deals</p>
          <p className="text-slate-500 text-xs font-medium">Check back soon for new offers in your area!</p>
        </div>
      )}
    </div>
  );
}
