import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Calendar, ArrowRight, MapPin, Edit2, Trash2, Check, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import ImageUpload from './ImageUpload';

export default function FeedCard({ post, onUpdate }) {
  const isDeal = post.type === 'DEAL';
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...post });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });
      if (res.ok) {
        const updated = await res.json();
        if (onUpdate) onUpdate(updated);
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Failed to save post:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white/10 p-8 border border-white/20 rounded-[40px] transition-all duration-500 shadow-2xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-black text-white/50 uppercase tracking-[0.2em]">Edit {isDeal ? 'Deal' : 'Post'}</h4>
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl flex items-center gap-2 border border-white/20 hover:bg-white/10 transition-all"
              >
                <X size={14} /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Save Changes
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {isDeal ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-white/60 uppercase tracking-widest mb-2">Business Name</label>
                    <input
                      type="text"
                      value={editData.businessName}
                      onChange={(e) => setEditData({ ...editData, businessName: e.target.value })}
                      className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-white/60 uppercase tracking-widest mb-2">Deal Title</label>
                    <input
                      type="text"
                      value={editData.title}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-white/60 uppercase tracking-widest mb-2">Description</label>
                  <textarea
                    value={editData.body}
                    onChange={(e) => setEditData({ ...editData, body: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all min-h-[100px]"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-white/60 uppercase tracking-widest mb-2">Discount %</label>
                    <input
                      type="text"
                      value={editData.discount?.replace('%', '') || ''}
                      onChange={(e) => setEditData({ ...editData, discount: `${e.target.value}%` })}
                      className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-white/60 uppercase tracking-widest mb-2">Zip Code</label>
                    <input
                      type="text"
                      value={editData.zip_code || ''}
                      onChange={(e) => setEditData({ ...editData, zip_code: e.target.value })}
                      className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-white/60 uppercase tracking-widest mb-2">Expiry Date</label>
                    <input
                      type="date"
                      value={editData.expiresAt || ''}
                      onChange={(e) => setEditData({ ...editData, expiresAt: e.target.value })}
                      className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-[10px] font-black text-white/60 uppercase tracking-widest mb-2">Title</label>
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-white/60 uppercase tracking-widest mb-2">Caption</label>
                  <textarea
                    value={editData.body}
                    onChange={(e) => setEditData({ ...editData, body: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all min-h-[120px]"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`group relative border border-white/20 rounded-[40px] overflow-hidden transition-all duration-500 shadow-2xl hover:border-primary/40 ${isDeal ? 'bg-[#6de3c2] p-8' : 'bg-white/10 p-6'}`}>
      <div className={`absolute ${isDeal ? 'bottom-8 right-8' : 'top-6 right-6'} z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0`}>
        <button
          onClick={() => setIsEditing(true)}
          className="bg-white/5 text-white/50 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl flex items-center gap-2 border border-white/20 hover:bg-white/10 transition-all active:scale-95"
        >
          <Edit2 size={14} /> {isDeal ? 'Edit Deal' : 'Edit'}
        </button>
      </div>

      {post.imageUrl && (
        <div className="aspect-video overflow-hidden relative mb-6 rounded-3xl shadow-2xl">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      )}
      
      <div className={`relative ${isDeal ? 'flex items-start gap-8' : ''}`}>
        {isDeal && post.discount && (
          <div 
            className={`flex-shrink-0 flex flex-col items-center justify-center bg-black border-4 border-primary rounded-[32px] min-w-[100px] min-h-[100px] p-4 shadow-2xl shadow-primary/10 ${isDeal ? 'text-white' : 'text-primary'}`}
          >
            <div className="flex items-baseline leading-none">
              <span className="text-4xl font-black tracking-tighter">{post.discount.replace('%', '')}</span>
              <span className="text-xl font-black ml-0.5">%</span>
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-80">OFF</div>
          </div>
        )}

        <div className="flex-1">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className={`text-[10px] font-black uppercase tracking-[0.3em] opacity-80 ${isDeal ? 'text-white' : 'text-white/50'}`}>
                {post.businessName} {post.createdByUsername && <span className={isDeal ? 'text-white/60' : 'text-white/30'}>by @{post.createdByUsername}</span>}
              </div>
              {!isDeal && (
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={12} />
                  {format(new Date(post.createdAt), 'MMM d, yyyy')}
                </span>
              )}
            </div>

            <h3 className="text-2xl font-black text-white group-hover:text-white/90 transition-colors mb-3 tracking-tight">
              {post.title}
            </h3>
          </div>
          
          <p className={`text-sm mb-6 leading-relaxed font-medium ${isDeal ? 'text-white' : 'text-white/70'}`}>
            {post.body}
          </p>

          {isDeal && (
            <div className="flex flex-wrap items-center gap-6 mb-6">
              {post.zip_code && (
                <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${isDeal ? 'text-white' : 'text-white/50'}`}>
                  <MapPin size={14} className={isDeal ? 'text-white' : 'text-white/40'} />
                  {post.zip_code}
                </div>
              )}
              {post.expiresAt && (
                <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${isDeal ? 'text-white' : 'text-white/50'}`}>
                  <Calendar size={14} className={isDeal ? 'text-white' : 'text-white/40'} />
                  Expires {format(new Date(post.expiresAt), 'MMMM d, yyyy')}
                </div>
              )}
            </div>
          )}

          {isDeal && post.couponCode && (
            <div className="bg-white/5 border border-dashed border-white/20 rounded-2xl p-4 mb-6 flex items-center justify-between shadow-inner">
              <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Coupon Code</span>
              <span className="text-sm font-black text-white/60 tracking-[0.2em] uppercase">{post.couponCode}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-6 border-t border-white/10">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
              {post.businessCategory || 'Local'}
            </span>
            {post.businessId ? (
              <Link
                to={`/business/${post.businessId}`}
                className="text-[10px] font-black text-white flex items-center gap-2 hover:text-white/80 transition-all uppercase tracking-widest hover:scale-105 active:scale-95"
              >
                View Business
                <ArrowRight size={16} className="text-white/40" />
              </Link>
            ) : (
              <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                Community Post
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
