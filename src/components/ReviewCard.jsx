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
    <div className={`bg-white rounded-2xl p-5 border transition-all duration-300 shadow-sm ${isReplying ? 'border-[#c8ff57] ring-1 ring-[#c8ff57]/20' : 'border-slate-100'}`}>
      {/* Top Row: Username & Delete */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] font-bold text-[#c8ff57] tracking-tight">
          @{review.reviewedBy || review.username || 'anonymous'}
        </span>
        {isReviewOwner && (
          <button
            onClick={handleDelete}
            className="bg-[#ff4d4d] text-white text-[11px] font-bold px-[12px] py-[4px] rounded-[16px] hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        )}
      </div>

      {/* Second Row: Stars */}
      <div className="flex items-center gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}
          />
        ))}
      </div>

      {/* Third Row: Review Text */}
      <p className="text-slate-600 text-sm leading-relaxed mb-4">
        {review.comment}
      </p>

      {/* Fourth Row: Reply Button or Owner Response */}
      {!review.businessReply && !isReplying && (
        <button
          onClick={handleReplyToggle}
          className="bg-[#1e1e1e] text-[#c8ff57] text-[11px] font-bold px-[12px] py-[4px] rounded-[16px] flex items-center gap-1.5 hover:bg-slate-800 transition-colors"
        >
          <MessageSquare size={12} />
          Reply as Business
        </button>
      )}

      {/* Inline Reply Form */}
      {isReplying && (
        <div className="mt-2 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write your response as the business owner..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20 min-h-[80px]"
          />
          <div className="flex gap-2">
            <button
              onClick={handlePostReply}
              disabled={isSaving || !replyText.trim()}
              className="bg-[#c8ff57] text-[#000] text-[11px] font-bold px-[12px] py-[4px] rounded-[16px] flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              Post Reply
            </button>
            <button
              onClick={handleReplyToggle}
              className="bg-[#2a2a2a] text-[#aaa] text-[11px] font-bold px-[12px] py-[4px] rounded-[16px] flex items-center gap-1.5"
            >
              <X size={12} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Owner Response Display */}
      {review.businessReply && (
        <div className="mt-4 pt-4 border-t border-slate-50">
          <div className="flex items-center gap-1.5 text-[#c8ff57] font-bold text-[11px] uppercase tracking-wider mb-1">
            <span>Owner Response 🏪</span>
          </div>
          <p className="text-[#e0e0e0] text-sm bg-[#1a1a1a] p-3 rounded-xl leading-relaxed">
            {review.businessReply}
          </p>
        </div>
      )}
    </div>
  );
}
