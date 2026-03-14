import React, { useState, useEffect } from 'react';
import { PlusCircle, Building2, MapPin, Globe, Loader2, CheckCircle2, ArrowRight, Tag, Calendar, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useProfile } from '../context/ProfileContext';
import ImageUpload from '../components/ImageUpload';

export default function SubmitBusiness() {
  const { profile } = useProfile();
  const [formData, setFormData] = useState({
    name: '',
    category: 'Food',
    address: '',
    zip: profile.zip || '',
    phone: '',
    website: '',
    description: '',
    business_image: '',
    username: profile.username || ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const categories = ['Food', 'Retail', 'Services', 'Entertainment', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username.trim()) {
      setError('Please enter your username');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/businesses/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setSuccess(true);
      } else {
        setError('Failed to submit business. Please try again.');
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
          <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Business Submitted!</h2>
          <p className="text-white mb-10 font-medium">
            Thank you for submitting your business. It is now live on Local Pulse.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="w-full bg-primary text-white font-black py-5 rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all uppercase tracking-widest text-sm"
          >
            Submit Another
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <div className="w-20 h-20 bg-white/10 rounded-[32px] flex items-center justify-center mx-auto mb-6 border border-white/20">
          <Building2 className="text-white" size={40} />
        </div>
        <h1 tabIndex={0} className="text-4xl font-black text-white mb-3 tracking-tight">Submit Business</h1>
        <p className="text-white font-medium">List your business in our local directory.</p>
      </div>

      <div className="bg-white/10 rounded-[40px] p-10 border border-white/20 shadow-2xl backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[10px] font-black text-white uppercase tracking-[0.2em] mb-3">Business Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-white/20"
              placeholder="e.g. Sakura Sushi"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-white uppercase tracking-[0.2em] mb-3">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-bg">{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-white uppercase tracking-[0.2em] mb-3">Address</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-white/20"
              placeholder="123 Main St, City, State"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-white uppercase tracking-[0.2em] mb-3">ZIP Code</label>
            <input
              type="text"
              required
              value={formData.zip}
              onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-white/20"
              placeholder="e.g. 90210"
              maxLength={5}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-white uppercase tracking-[0.2em] mb-3">Phone Number</label>
            <input
              type="text"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-white/20"
              placeholder="(555) 000-0000"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-white uppercase tracking-[0.2em] mb-3">Website (Optional)</label>
            <input
              type="text"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-white/20"
              placeholder="example.com"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-white uppercase tracking-[0.2em] mb-3">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[140px] placeholder:text-white/20"
              placeholder="Tell the community about your business..."
            />
          </div>

          <div>
            <ImageUpload
              label="Business Image"
              value={formData.business_image}
              onChange={(url) => setFormData({ ...formData, business_image: url })}
            />
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
            className="w-full flex items-center justify-center gap-3 font-black py-5 rounded-2xl transition-all bg-primary text-white shadow-lg shadow-primary/20 hover:opacity-90 uppercase tracking-widest text-sm"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
            Submit Business
          </button>
        </form>
      </div>
    </div>
  );
}
