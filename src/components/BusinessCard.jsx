import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Tag, Globe, Trash2 } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { useUI } from '../context/UIContext';

export default function BusinessCard({ business, onDelete }) {
  const { profile } = useProfile();
  const { showToast } = useUI();

  const cleanDomain = (url) => {
    if (!url) return '';
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const username = profile.username || '';
      if (!username) return;
      
      const res = await fetch(`/api/businesses/${business.id}?username=${username}`, { method: 'DELETE' });
      
      if (res.ok) {
        if (onDelete) onDelete(business.id);
        showToast('Business deleted');
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to delete business');
      }
    } catch (err) {
      console.error('Failed to delete business:', err);
    }
  };

  const isOwner = profile.username && business.createdBy && 
    profile.username.trim().toLowerCase() === business.createdBy.trim().toLowerCase();

  return (
    <div className="relative group">
      {isOwner && (
        <button
          onClick={handleDelete}
          className="absolute top-4 right-4 z-20 bg-red-500/10 hover:bg-red-500 text-white hover:text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl backdrop-blur-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all border border-red-500/20 hover:border-red-500 flex items-center gap-2 translate-x-2 group-hover:translate-x-0 active:scale-95"
        >
          <Trash2 size={14} />
          Delete
        </button>
      )}

      <Link to={`/business/${business.id}`} className="block bg-white/10 border border-white/20 rounded-[40px] overflow-hidden hover:border-primary/40 transition-all duration-500 shadow-2xl group/card">
        <div className="aspect-[4/3] bg-white/5 relative overflow-hidden flex items-center justify-center">
          {business.imageUrl ? (
            <img
              src={business.imageUrl}
              alt={business.name}
              className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-white">
              <Tag size={48} className="mb-3 opacity-20" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">No Image</span>
            </div>
          )}
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-xl px-3 py-1.5 rounded-xl flex items-center gap-2 border border-white/10 shadow-2xl">
            <Star size={14} className="text-white fill-white" />
            <span className="text-xs font-black text-white">{business.avgRating.toFixed(1)}</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
        </div>

      <div className="p-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-2xl font-black text-white group-hover/card:text-white/90 transition-colors tracking-tight">
            {business.name}
          </h3>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] bg-primary px-3 py-1 rounded-full shadow-lg shadow-primary/10">
            {business.category}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-white text-[10px] font-black uppercase tracking-widest mb-6">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-white" />
            {business.zip}
          </div>
          {business.website && (
            <div className="flex items-center gap-2 text-white hover:text-white transition-colors">
              <Globe size={14} />
              {cleanDomain(business.website)}
            </div>
          )}
        </div>

        <div className="text-[10px] text-white font-black uppercase tracking-widest mb-6 flex items-center gap-2">
          <div className="w-1 h-1 bg-white/20 rounded-full" />
          Listed by <span className="text-white">@{business.createdBy || 'unknown'}</span>
        </div>

        <div className="flex items-center justify-between text-[10px] font-black text-white pt-6 border-t border-white/10 uppercase tracking-[0.2em]">
          <span>{business.reviewCount} REVIEWS</span>
          {business.activeDeal && (
            <span className="flex items-center gap-2 text-white animate-pulse">
              <Tag size={12} />
              ACTIVE DEAL
            </span>
          )}
        </div>
      </div>
    </Link>
    </div>
  );
}
