import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Calendar, ArrowRight, MapPin, Edit2, Trash2, Check, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import ImageUpload from './ImageUpload';

export default function FeedCard({ post, onDelete, onUpdate }) {
  const isDeal = post.type === 'DEAL';
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...post });
  const [isSaving, setIsSaving] = useState(false);

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
      if (res.ok && onDelete) {
        onDelete(post.id);
      }
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

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
      <div className="bg-[#111] p-8 border border-[#c8ff57]/20 rounded-[40px] transition-all duration-500 shadow-2xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Edit {isDeal ? 'Deal' : 'Post'}</h4>
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10 hover:bg-white/10 transition-all"
              >
                <X size={14} /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#c8ff57] text-black text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-[#c8ff57]/20 hover:opacity-90 transition-all"
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
                    <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Business Name</label>
                    <input
                      type="text"
                      value={editData.businessName}
                      onChange={(e) => setEditData({ ...editData, businessName: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20 text-sm font-medium transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Deal Title</label>
                    <input
                      type="text"
                      value={editData.title}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20 text-sm font-medium transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Description</label>
                  <textarea
                    value={editData.body}
                    onChange={(e) => setEditData({ ...editData, body: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20 text-sm font-medium transition-all min-h-[100px]"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Discount %</label>
                    <input
                      type="text"
                      value={editData.discount?.replace('%', '') || ''}
                      onChange={(e) => setEditData({ ...editData, discount: `${e.target.value}%` })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20 text-sm font-medium transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Zip Code</label>
                    <input
                      type="text"
                      value={editData.zip_code || ''}
                      onChange={(e) => setEditData({ ...editData, zip_code: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20 text-sm font-medium transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Expiry Date</label>
                    <input
                      type="date"
                      value={editData.expiresAt || ''}
                      onChange={(e) => setEditData({ ...editData, expiresAt: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20 text-sm font-medium transition-all"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Title</label>
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20 text-sm font-medium transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Caption</label>
                  <textarea
                    value={editData.body}
                    onChange={(e) => setEditData({ ...editData, body: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20 text-sm font-medium transition-all min-h-[120px]"
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
    <div className={`group relative border border-white/5 rounded-[40px] overflow-hidden transition-all duration-500 shadow-2xl hover:border-[#c8ff57]/20 ${isDeal ? 'bg-[#111] p-8' : 'bg-[#111] p-6'}`}>
      <div className={`absolute ${isDeal ? 'bottom-8 right-8' : 'top-6 right-6'} z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0`}>
        <button
          onClick={() => setIsEditing(true)}
          className="bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10 hover:bg-white/10 transition-all"
        >
          <Edit2 size={14} /> {isDeal ? 'Edit Deal' : 'Edit'}
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl flex items-center gap-2 border border-red-500/20 hover:border-red-500 transition-all"
        >
          <Trash2 size={14} /> {isDeal ? 'Delete Deal' : 'Delete'}
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
            className="flex-shrink-0 flex flex-col items-center justify-center bg-black border-4 border-[#c8ff57] text-[#c8ff57] rounded-[32px] min-w-[100px] min-h-[100px] p-4 shadow-2xl shadow-[#c8ff57]/10"
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
              <div className="text-[10px] font-black text-[#c8ff57] uppercase tracking-[0.3em] opacity-80">
                {post.businessName}
              </div>
              {!isDeal && (
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={12} />
                  {format(new Date(post.createdAt), 'MMM d, yyyy')}
                </span>
              )}
            </div>

            <h3 className="text-2xl font-black text-white group-hover:text-[#c8ff57] transition-colors mb-3 tracking-tight">
              {post.title}
            </h3>
          </div>
          
          <p className="text-slate-400 text-sm mb-6 leading-relaxed font-medium">
            {post.body}
          </p>

          {isDeal && (
            <div className="flex flex-wrap items-center gap-6 mb-6">
              {post.zip_code && (
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <MapPin size={14} className="text-[#c8ff57]" />
                  {post.zip_code}
                </div>
              )}
              {post.expiresAt && (
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <Calendar size={14} className="text-[#c8ff57]" />
                  Expires {format(new Date(post.expiresAt), 'MMMM d, yyyy')}
                </div>
              )}
            </div>
          )}

          {isDeal && post.couponCode && (
            <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-4 mb-6 flex items-center justify-between shadow-inner">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Coupon Code</span>
              <span className="text-sm font-black text-[#c8ff57] tracking-[0.2em] uppercase">{post.couponCode}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-6 border-t border-white/5">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
              {post.businessCategory || 'Local'}
            </span>
            {post.businessId ? (
              <Link
                to={`/business/${post.businessId}`}
                className="text-[10px] font-black text-white flex items-center gap-2 hover:text-[#c8ff57] transition-all uppercase tracking-widest"
              >
                View Business
                <ArrowRight size={16} className="text-[#c8ff57]" />
              </Link>
            ) : (
              <div className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em]">
                Community Post
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
