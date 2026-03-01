import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle2, Trash2, Loader2, Star } from 'lucide-react';
import { format } from 'date-fns';

export default function Admin() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = () => {
    setLoading(true);
    fetch('/api/admin/reviews?status=PENDING')
      .then(res => res.json())
      .then(data => {
        setReviews(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const verifyReview = async (id) => {
    const res = await fetch(`/api/admin/reviews/${id}/verify`, { method: 'PUT' });
    if (res.ok) fetchReviews();
  };

  const deleteReview = async (id) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
    if (res.ok) fetchReviews();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-white flex items-center gap-4 tracking-tight">
          <ShieldCheck className="text-[#c8ff57]" size={40} />
          Admin Panel
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Review and verify community contributions</p>
      </div>

      <section>
        <h2 className="text-xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-widest text-sm">
          Pending Reviews ({reviews.length})
        </h2>
        
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#c8ff57]" size={40} />
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid gap-6">
            {reviews.map(review => (
              <div key={review.id} className="bg-[#111] rounded-[32px] p-8 border border-white/5 shadow-2xl">
                <div className="flex flex-col md:flex-row justify-between gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-sm font-black text-white">@{review.username}</span>
                      <span className="text-white/10">•</span>
                      <span className="text-[10px] font-black text-black uppercase tracking-[0.2em] bg-[#c8ff57] px-3 py-1 rounded-full">
                        {review.businessName}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < review.rating ? 'text-[#c8ff57] fill-[#c8ff57]' : 'text-slate-800'}
                        />
                      ))}
                    </div>

                    <p className="text-slate-400 text-lg mb-6 italic leading-relaxed">"{review.comment}"</p>
                    
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                      Submitted on {format(new Date(review.createdAt), 'MMM d, yyyy HH:mm')}
                    </span>
                  </div>

                  <div className="flex md:flex-col gap-3 justify-end min-w-[140px]">
                    <button
                      onClick={() => verifyReview(review.id)}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-[#c8ff57] text-black rounded-2xl text-xs font-black transition-all shadow-lg shadow-[#c8ff57]/10 hover:opacity-90"
                    >
                      <CheckCircle2 size={18} />
                      VERIFY
                    </button>
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 text-slate-400 rounded-2xl text-xs font-black transition-all border border-white/10 hover:bg-white/10"
                    >
                      <Trash2 size={18} />
                      DELETE
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#111] rounded-[40px] p-16 border border-white/5 text-center shadow-2xl">
            <p className="text-white font-black text-xl mb-2">No pending reviews to verify.</p>
            <p className="text-slate-500 font-medium">Great job keeping the loop clean!</p>
          </div>
        )}
      </section>
    </div>
  );
}
