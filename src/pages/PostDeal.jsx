import React, { useState } from 'react';
import { Tag, Building2, Type, Calendar, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useProfile } from '../context/ProfileContext';

export default function PostDeal() {
  const { profile } = useProfile();
  const [formData, setFormData] = useState({
    businessName: '',
    title: '',
    description: '',
    discount: '',
    expiresAt: '',
    username: profile.username || ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim()) {
      setError('Please enter your username');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/deals/submit?zip=${profile.zip || '90210'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setSuccess(true);
        setFormData({
          businessName: '',
          title: '',
          description: '',
          discount: '',
          expiresAt: '',
          username: profile.username || ''
        });
      } else {
        setError('Failed to post deal. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 rounded-[40px] p-10 shadow-2xl border border-white/20 backdrop-blur-xl"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/20">
            <CheckCircle2 className="text-white" size={40} />
          </div>
          <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Deal Published!</h2>
          <p className="text-white mb-10 font-medium">
            Your deal is now live on the Deals board for the community to see.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="w-full bg-primary text-white font-black py-5 rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all uppercase tracking-widest text-sm"
          >
            Post Another Deal
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <div className="w-20 h-20 bg-white/10 rounded-[32px] flex items-center justify-center mx-auto mb-6 border border-white/20">
          <Tag className="text-white" size={40} />
        </div>
        <h1 tabIndex={0} className="text-4xl font-black text-white mb-3 tracking-tight">Post a Deal</h1>
        <p className="text-white font-medium">Share exclusive offers with your local community.</p>
      </div>

      <div className="bg-white/10 rounded-[40px] p-10 border border-white/20 shadow-2xl backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[10px] font-black text-white uppercase tracking-[0.2em] mb-3">Business Name</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-white" size={18} />
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-white/20"
                placeholder="Your business name"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-white uppercase tracking-[0.2em] mb-3">Deal Title</label>
            <div className="relative">
              <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-white" size={18} />
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-white/20"
                placeholder="e.g. 2-for-1 Coffee"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-white uppercase tracking-[0.2em] mb-3">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[120px] placeholder:text-white/20"
              placeholder="Describe what's included in this deal..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-[10px] font-black text-white uppercase tracking-[0.2em] mb-3">Discount % or Amount</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-white" size={18} />
                <input
                  type="text"
                  required
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-white/20"
                  placeholder="e.g. 25% OFF or $10 OFF"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-white uppercase tracking-[0.2em] mb-3">Expiry Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white" size={18} />
                <input
                  type="date"
                  required
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-white uppercase tracking-[0.2em] mb-3">Username</label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-white/20"
              placeholder="Your username"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 text-white rounded-2xl text-xs font-bold border border-red-500/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-black py-5 rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
            Publish Deal
          </button>
        </form>
      </div>
    </div>
  );
}
