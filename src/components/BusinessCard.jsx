import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Tag, Globe, X, Heart } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';

export default function BusinessCard({ business, onDelete, isBookmarked, onToggleBookmark }) {
  const { profile } = useProfile();

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
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete business');
      }
    } catch (err) {
      console.error('Failed to delete business:', err);
      alert('Failed to delete business');
    }
  };

  const isOwner = profile.username && business.createdBy && 
    profile.username.trim().toLowerCase() === business.createdBy.trim().toLowerCase();

  return (
    <div className="relative group">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleBookmark();
        }}
        className="absolute top-3 right-3 z-30 p-2 rounded-full bg-white/90 shadow-sm hover:bg-white transition-all text-slate-400 hover:text-red-500"
      >
        <Heart size={18} className={isBookmarked ? "fill-red-500 text-red-500" : ""} />
      </button>

      {isOwner && (
        <button
          onClick={handleDelete}
          className="absolute top-3 right-14 z-20 bg-[#ff4d4d] text-white text-[11px] font-bold px-[12px] py-[4px] rounded-[16px] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
        >
          <X size={12} />
          Delete
        </button>
      )}

      <Link to={`/business/${business.id}`} className="card block hover:border-primary/30 transition-all duration-300">
        <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden flex items-center justify-center">
          {business.imageUrl ? (
            <img
              src={business.imageUrl}
              alt={business.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-300">
              <Tag size={40} className="mb-2 opacity-20" />
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">No Image</span>
            </div>
          )}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-bold text-slate-700">{business.avgRating.toFixed(1)}</span>
          </div>
        </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-black group-hover:opacity-80 transition-opacity" style={{ color: '#111111' }}>
            {business.name}
          </h3>
          {isOwner && (
            <button
              onClick={handleDelete}
              className="bg-[#ff4d4d] text-white text-[10px] font-bold px-[10px] py-[3px] rounded-[16px] shadow-sm hover:bg-red-600 transition-colors flex items-center gap-1"
            >
              <X size={10} />
              Delete
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded">
            {business.category}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-slate-400 text-[10px] font-bold mb-2">
          <div className="flex items-center gap-1">
            <MapPin size={12} />
            {business.zip}
          </div>
          {business.website && (
            <div className="flex items-center gap-1 text-primary/70">
              <Globe size={12} />
              {cleanDomain(business.website)}
            </div>
          )}
        </div>

        <div className="text-[10px] text-[#666] font-medium mb-4">
          Listed by @{business.createdBy || 'unknown'}
        </div>

        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 pt-3 border-t border-slate-50">
          <span>{business.reviewCount} REVIEWS</span>
          {business.activeDeal && (
            <span className="flex items-center gap-1 text-primary">
              <Tag size={10} />
              ACTIVE DEAL
            </span>
          )}
        </div>
      </div>
    </Link>
    </div>
  );
}
