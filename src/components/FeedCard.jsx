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
      <div className={`card p-6 border-2 border-brand-green bg-brand-green/5 transition-all duration-300`}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Edit {isDeal ? 'Deal' : 'Post'}</h4>
            <div className="flex gap-[6px]">
              <button
                onClick={() => setIsEditing(false)}
                className="bg-[#2a2a2a] text-[#aaa] text-[11px] font-bold px-[12px] py-[4px] rounded-[16px] flex items-center gap-1"
              >
                <X size={12} /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#c8ff57] text-[#000] text-[11px] font-bold px-[12px] py-[4px] rounded-[16px] flex items-center gap-1 shadow-sm"
              >
                {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                Save Changes
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {isDeal ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Business Name</label>
                    <input
                      type="text"
                      value={editData.businessName}
                      onChange={(e) => setEditData({ ...editData, businessName: e.target.value })}
                      className="input text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Deal Title</label>
                    <input
                      type="text"
                      value={editData.title}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      className="input text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Description</label>
                  <textarea
                    value={editData.body}
                    onChange={(e) => setEditData({ ...editData, body: e.target.value })}
                    className="input text-sm min-h-[80px]"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Discount %</label>
                    <input
                      type="text"
                      value={editData.discount?.replace('%', '') || ''}
                      onChange={(e) => setEditData({ ...editData, discount: `${e.target.value}%` })}
                      className="input text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Zip Code</label>
                    <input
                      type="text"
                      value={editData.zip_code || ''}
                      onChange={(e) => setEditData({ ...editData, zip_code: e.target.value })}
                      className="input text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={editData.expiresAt || ''}
                      onChange={(e) => setEditData({ ...editData, expiresAt: e.target.value })}
                      className="input text-sm"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Title</label>
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Caption</label>
                  <textarea
                    value={editData.body}
                    onChange={(e) => setEditData({ ...editData, body: e.target.value })}
                    className="input text-sm min-h-[100px]"
                  />
                </div>
                <div>
                  <ImageUpload
                    label="Change Image"
                    value={editData.imageUrl}
                    onChange={(base64) => setEditData({ ...editData, imageUrl: base64 })}
                    onRemove={() => setEditData({ ...editData, imageUrl: '' })}
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
    <div className={`card group relative hover:border-primary/30 transition-all duration-300 ${isDeal ? 'bg-[#f9f9f9] p-6' : 'bg-white p-5'}`}>
      <div className={`absolute ${isDeal ? 'bottom-6 right-6' : 'top-4 right-4'} z-20 flex gap-[6px] opacity-0 group-hover:opacity-100 transition-opacity`}>
        <button
          onClick={() => setIsEditing(true)}
          className="bg-[#1e1e1e] text-[#ccc] text-[11px] font-bold px-[12px] py-[4px] rounded-[16px] flex items-center gap-1 shadow-md hover:bg-slate-800"
        >
          <Edit2 size={12} /> {isDeal ? 'Edit Deal' : 'Edit'}
        </button>
        <button
          onClick={handleDelete}
          className="bg-[#ff4d4d] text-white text-[11px] font-bold px-[12px] py-[4px] rounded-[16px] flex items-center gap-1 shadow-md hover:bg-red-600"
        >
          <Trash2 size={12} /> {isDeal ? 'Delete Deal' : 'Delete'}
        </button>
      </div>

      {post.imageUrl && (
        <div className="aspect-video overflow-hidden relative mb-5 rounded-xl">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        </div>
      )}
      
      <div className={`relative ${isDeal ? 'flex items-start gap-6' : ''}`}>
        {isDeal && post.discount && (
          <div 
            className="flex-shrink-0 flex flex-col items-center justify-center bg-[#0d1900] border-2 border-brand-green text-brand-green rounded-[14px] min-w-[80px] min-h-[80px] p-3 shadow-xl"
          >
            <div className="flex items-baseline leading-none">
              <span className="text-[26px] font-black">{post.discount.replace('%', '')}</span>
              <span className="text-[20px] font-black ml-0.5">%</span>
            </div>
            <div className="text-[11px] font-black uppercase tracking-[0.15em] mt-0.5">OFF</div>
          </div>
        )}

        <div className="flex-1">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-[6px]">
              <div className="text-[10px] font-black text-brand-green tracking-[0.2em]">
                {post.businessName}
              </div>
              {!isDeal && (
                <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                  <Calendar size={10} />
                  {format(new Date(post.createdAt), 'MMM d, yyyy')}
                </span>
              )}
            </div>

            <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors mb-[8px]">
              {post.title}
            </h3>
          </div>
          
          <p className="text-slate-600 text-sm mb-[10px] leading-relaxed">
            {post.body}
          </p>

          {isDeal && (
            <div className="flex flex-wrap items-center gap-4 mb-4">
              {post.zip_code && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                  <MapPin size={12} />
                  {post.zip_code}
                </div>
              )}
              {post.expiresAt && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                  <Calendar size={12} />
                  Expires {format(new Date(post.expiresAt), 'MMMM d, yyyy')}
                </div>
              )}
            </div>
          )}

          {isDeal && post.couponCode && (
            <div className="bg-white border border-dashed border-slate-200 rounded-xl p-3 mb-4 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Coupon Code:</span>
              <span className="text-sm font-bold text-primary tracking-wider">{post.couponCode}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {post.businessCategory || 'Local'}
            </span>
            {post.businessId ? (
              <Link
                to={`/business/${post.businessId}`}
                className="text-xs font-bold text-secondary flex items-center gap-1 hover:gap-2 transition-all"
              >
                View Business
                <ArrowRight size={14} />
              </Link>
            ) : (
              <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                Community Post
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
