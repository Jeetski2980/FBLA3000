import React, { useState } from 'react';
import { Star, CheckCircle2, Trash2, MessageSquare, Send, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useProfile } from '../context/ProfileContext';

export default function ReviewCard({ review, onDelete, onReply, isActive, onActivate }) {
  const { profile } = useProfile();
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleReplyToggle = () => {
    if (!isReplying) {
      onActivate();
      setIsReplying(true);
    } else {
      setIsReplying(false);
      setReplyText('');
    }
  };

  // Close reply box if another card becomes active
  React.useEffect(() => {
    if (!isActive && isReplying) {
      setIsReplying(false);
      setReplyText('');
    }
  }, [isActive]);

  const handlePostReply = async () => {
    if (!replyText.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/reviews/${review.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: replyText })
      });
      if (res.ok) {
        const updatedReview = await res.json();
        onReply(updatedReview);
        setIsReplying(false);
        setReplyText('');
      }
    } catch (err) {
      console.error('Failed to post reply:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const username = profile.username || '';
      if (!username) return;
      
      const res = await fetch(`/api/reviews/${review.id}?username=${username}`, { method: 'DELETE' });
      if (res.ok) {
        onDelete(review.id);
      }
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  const isReviewOwner = profile.username && review.reviewedBy && 
    profile.username.trim().toLowerCase() === review.reviewedBy.trim().toLowerCase();

  return (
    <div className={`bg-[#111] rounded-[24px] p-6 border transition-all duration-300 shadow-xl ${isReplying ? 'border-[#c8ff57]/50 ring-1 ring-[#c8ff57]/10' : 'border-white/5'}`}>
      {/* Top Row: Username & Delete */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-black text-white tracking-tight">
          @{review.reviewedBy || review.username || 'anonymous'}
        </span>
        {isReviewOwner && (
          <button
            onClick={handleDelete}
            className="bg-red-500/80 text-white text-[10px] font-black px-3 py-1 rounded-full hover:bg-red-500 transition-colors"
          >
            DELETE
          </button>
        )}
      </div>

      {/* Second Row: Stars */}
      <div className="flex items-center gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < review.rating ? 'text-[#c8ff57] fill-[#c8ff57]' : 'text-slate-800'}
          />
        ))}
      </div>

      {/* Third Row: Review Text */}
      <p className="text-slate-400 text-sm leading-relaxed mb-6">
        {review.comment}
      </p>

      {/* Fourth Row: Reply Button or Owner Response */}
      {!review.businessReply && !isReplying && (
        <button
          onClick={handleReplyToggle}
          className="bg-white/5 text-white text-[11px] font-black px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <MessageSquare size={14} className="text-[#c8ff57]" />
          REPLY AS BUSINESS
        </button>
      )}

      {/* Inline Reply Form */}
      {isReplying && (
        <div className="mt-2 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write your response as the business owner..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20 min-h-[100px]"
          />
          <div className="flex gap-3">
            <button
              onClick={handlePostReply}
              disabled={isSaving || !replyText.trim()}
              className="bg-[#c8ff57] text-black text-[11px] font-black px-4 py-2 rounded-xl flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              POST REPLY
            </button>
            <button
              onClick={handleReplyToggle}
              className="bg-white/5 text-slate-400 text-[11px] font-black px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10"
            >
              <X size={14} />
              CANCEL
            </button>
          </div>
        </div>
      )}

      {/* Owner Response Display */}
      {review.businessReply && (
        <div className="mt-6 pt-6 border-t border-white/5">
          <div className="flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-[0.2em] mb-3">
            <CheckCircle2 size={12} className="text-[#c8ff57]" />
            <span>Owner Response 🏪</span>
          </div>
          <p className="text-slate-300 text-sm bg-white/5 p-4 rounded-2xl leading-relaxed border border-white/5">
            {review.businessReply}
          </p>
        </div>
      )}
    </div>
  );
}
