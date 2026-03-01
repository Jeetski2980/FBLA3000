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
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <ShieldCheck className="text-primary" size={32} />
          Admin Panel
        </h1>
        <p className="text-slate-500">Review and verify community contributions</p>
      </div>

      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-6">Pending Reviews ({reviews.length})</h2>
        
        {loading ? (
          <Loader2 className="animate-spin text-primary mx-auto" />
        ) : reviews.length > 0 ? (
          <div className="grid gap-4">
            {reviews.map(review => (
              <div key={review.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold text-slate-900">@{review.username}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-bold text-primary uppercase tracking-wider">{review.businessName}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}
                        />
                      ))}
                    </div>

                    <p className="text-slate-600 text-sm mb-4 italic">"{review.comment}"</p>
                    
                    <span className="text-[10px] text-slate-400">
                      Submitted on {format(new Date(review.createdAt), 'MMM d, yyyy HH:mm')}
                    </span>
                  </div>

                  <div className="flex md:flex-col gap-2 justify-end">
                    <button
                      onClick={() => verifyReview(review.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-bold transition-colors"
                    >
                      <CheckCircle2 size={18} />
                      Verify
                    </button>
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-bold transition-colors"
                    >
                      <Trash2 size={18} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 border border-slate-100 text-center">
            <p className="text-slate-500 font-medium">No pending reviews to verify.</p>
            <p className="text-slate-400 text-sm mt-1">Great job keeping the loop clean!</p>
          </div>
        )}
      </section>
    </div>
  );
}
