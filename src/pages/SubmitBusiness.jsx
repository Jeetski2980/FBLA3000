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
    description: '',
    zip: profile.zip || '',
    address: '',
    website: '',
    business_image: '',
    createdBy: profile.username || ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Deal form state
  const [dealData, setDealData] = useState({
    businessName: '',
    title: '',
    description: '',
    discount: '',
    expiresAt: '',
    zip_code: ''
  });
  const [dealLoading, setDealLoading] = useState(false);
  const [dealSuccess, setDealSuccess] = useState(false);

  const categories = ['Food', 'Cafe', 'Fitness', 'Services'];

  useEffect(() => {
    if (dealSuccess) {
      const timer = setTimeout(() => setDealSuccess(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [dealSuccess]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, createdBy: profile.username }));
  }, [profile.username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!profile.username.trim()) {
      setError('Set your username at the top of the page before listing a business');
      return;
    }

    setLoading(true);
    setError('');
    
    // Website logic: prepend https:// if missing
    let finalWebsite = formData.website.trim();
    if (finalWebsite && !finalWebsite.startsWith('http')) {
      finalWebsite = `https://${finalWebsite}`;
    }

    try {
      const res = await fetch('/api/businesses/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, website: finalWebsite, createdBy: profile.username })
      });
      const data = await res.json();
      
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to submit business');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDealSubmit = async (e) => {
    e.preventDefault();
    if (!dealData.businessName || !dealData.title) return;

    setDealLoading(true);
    try {
      const res = await fetch(`/api/deals/submit?zip=${profile.zip || '90210'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dealData)
      });
      if (res.ok) {
        setDealSuccess(true);
        setDealData({
          businessName: '',
          title: '',
          description: '',
          discount: '',
          expiresAt: '',
          zip_code: ''
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDealLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#111] rounded-[40px] p-10 shadow-2xl border border-white/5"
        >
          <div className="w-20 h-20 bg-[#c8ff57]/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="text-[#c8ff57]" size={40} />
          </div>
          <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Submission Received!</h2>
          <p className="text-slate-500 mb-10 font-medium">
            Thank you for submitting your business. It is now live on Local Pulse.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="w-full bg-[#c8ff57] text-black font-black py-5 rounded-2xl shadow-lg shadow-[#c8ff57]/20 hover:opacity-90 transition-all uppercase tracking-widest text-sm"
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
        <div className="w-20 h-20 bg-white/5 rounded-[32px] flex items-center justify-center mx-auto mb-6 border border-white/10">
          <Building2 className="text-[#c8ff57]" size={40} />
        </div>
        <h1 className="text-4xl font-black text-white mb-3 tracking-tight">Business Dashboard</h1>
        <p className="text-slate-500 font-medium">Manage your presence and connect with the community.</p>
      </div>

      {/* Section 1: Submit Business */}
      <section className="mb-20">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[#c8ff57] border border-white/10">
            <PlusCircle size={24} />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Submit Your Business</h2>
        </div>

        <div className="bg-[#111] rounded-[40px] p-10 shadow-2xl border border-white/5">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Your Username</label>
              <input
                type="text"
                required
                value={formData.createdBy}
                onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20"
                placeholder="e.g. @sarah_m"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Business Name</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20"
                    placeholder="e.g. Sakura Sushi"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="bg-[#111]">{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Description</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20 min-h-[140px]"
                placeholder="Tell the community what makes your business special..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">ZIP Code</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input
                    type="text"
                    required
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20"
                    placeholder="12345"
                    maxLength={5}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Website</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20"
                    placeholder="example.com"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Address (Optional)</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20"
                placeholder="123 Main St, City, State"
              />
            </div>

            <div>
              <ImageUpload
                label="Business Image"
                value={formData.business_image}
                onChange={(base64) => setFormData({ ...formData, business_image: base64 })}
                onRemove={() => setFormData({ ...formData, business_image: '' })}
              />
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 text-red-400 rounded-2xl text-xs font-bold border border-red-500/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 font-black py-5 rounded-2xl transition-all bg-[#c8ff57] text-black shadow-lg shadow-[#c8ff57]/20 hover:opacity-90 uppercase tracking-widest text-sm"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
              Submit Business
            </button>
          </form>
        </div>
      </section>

      <div className="h-px bg-white/5 mb-20" />

      {/* Section 2: Post a Deal */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[#c8ff57] border border-white/10">
            <Tag size={24} />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Post a Deal</h2>
        </div>

        <div className="bg-[#111] rounded-[40px] p-10 border border-white/5 shadow-2xl">
          <form onSubmit={handleDealSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Business Name</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input
                    type="text"
                    required
                    value={dealData.businessName}
                    onChange={(e) => setDealData({ ...dealData, businessName: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20"
                    placeholder="Your business name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Deal Title</label>
                <div className="relative">
                  <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input
                    type="text"
                    required
                    value={dealData.title}
                    onChange={(e) => setDealData({ ...dealData, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20"
                    placeholder="e.g. Spring Flash Sale"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Description</label>
              <textarea
                value={dealData.description}
                onChange={(e) => setDealData({ ...dealData, description: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20 min-h-[120px]"
                placeholder="Describe what's included..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Discount %</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={dealData.discount}
                    onChange={(e) => setDealData({ ...dealData, discount: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20"
                    placeholder="e.g. 25"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Expiry Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input
                    type="date"
                    value={dealData.expiresAt}
                    onChange={(e) => setDealData({ ...dealData, expiresAt: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Zip Code</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input
                    type="text"
                    value={dealData.zip_code}
                    onChange={(e) => setDealData({ ...dealData, zip_code: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20"
                    placeholder="e.g. 48335"
                  />
                </div>
              </div>
            </div>

            <AnimatePresence>
              {dealSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-2xl text-xs font-black flex items-center gap-3"
                >
                  <CheckCircle2 size={18} />
                  Your deal is now live on the Deals board!
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={dealLoading || !dealData.businessName || !dealData.title}
              className="w-full bg-[#c8ff57] text-black font-black py-5 rounded-2xl shadow-lg shadow-[#c8ff57]/20 hover:opacity-90 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {dealLoading ? <Loader2 className="animate-spin" size={20} /> : <Tag size={20} />}
              Publish Deal
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
