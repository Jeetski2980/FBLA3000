import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Tag, PlusCircle, Sparkles, Bookmark, Trash2, Search, Loader2, ArrowRight } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { useProfile } from '../context/ProfileContext';
import ImageUpload from './ImageUpload';

export default function GlobalUI() {
  const { toast, activePanel, closePanel, showToast } = useUI();
  const { profile, toggleBookmark } = useProfile();
  const bookmarks = profile.bookmarks || [];
  const [bookmarkedBusinesses, setBookmarkedBusinesses] = useState([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);

  useEffect(() => {
    if (activePanel === 'BOOKMARKS' && bookmarks.length > 0) {
      setLoadingBookmarks(true);
      Promise.all(bookmarks.map(id => fetch(`/api/businesses/${id}`).then(res => res.json())))
        .then(data => {
          setBookmarkedBusinesses(data.filter(b => b && !b.error));
          setLoadingBookmarks(false);
        })
        .catch(() => setLoadingBookmarks(false));
    } else if (activePanel === 'BOOKMARKS') {
      setBookmarkedBusinesses([]);
    }
  }, [activePanel, bookmarks]);

  const removeBookmark = (id) => {
    toggleBookmark(id);
    showToast('Bookmark removed');
  };

  return (
    <>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-10 left-1/2 bg-[#111] border border-white/10 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-[100] min-w-[320px] justify-center backdrop-blur-xl"
          >
            <div className="w-2 h-2 bg-[#c8ff57] rounded-full animate-pulse" />
            <span className="text-sm font-black uppercase tracking-widest">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-in Panels */}
      <AnimatePresence>
        {activePanel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePanel}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[80]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full max-w-lg bg-[#0a0a0a] text-white z-[90] shadow-2xl flex flex-col border-l border-white/5"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-[#111]/50 backdrop-blur-xl">
                <h2 className="text-2xl font-black flex items-center gap-4 tracking-tight uppercase tracking-[0.1em]">
                  {activePanel === 'SUBMIT_BUSINESS' && <><PlusCircle className="text-[#c8ff57]" size={28} /> Submit Business</>}
                  {activePanel === 'PUBLISH_DEAL' && <><Tag className="text-[#c8ff57]" size={28} /> Publish Deal</>}
                  {activePanel === 'BOOKMARKS' && <><Bookmark className="text-[#c8ff57]" size={28} /> Your Bookmarks</>}
                  {activePanel === 'RECOMMENDATIONS' && <><Sparkles className="text-[#c8ff57]" size={28} /> Recommendations</>}
                </h2>
                <button onClick={closePanel} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10 text-slate-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {activePanel === 'SUBMIT_BUSINESS' && <SubmitBusinessForm />}
                {activePanel === 'PUBLISH_DEAL' && <PublishDealForm />}
                {activePanel === 'BOOKMARKS' && (
                  <div className="space-y-6">
                    {loadingBookmarks ? (
                      <div className="flex flex-col items-center justify-center py-24">
                        <Loader2 className="animate-spin text-[#c8ff57] mb-6" size={48} />
                        <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Loading bookmarks...</p>
                      </div>
                    ) : bookmarkedBusinesses.length > 0 ? (
                      bookmarkedBusinesses.map(b => (
                        <div key={b.id} className="bg-[#111] border border-white/5 rounded-[32px] p-6 flex items-center justify-between group hover:border-[#c8ff57]/20 transition-all shadow-2xl">
                          <div>
                            <h3 className="text-lg font-black text-white group-hover:text-[#c8ff57] transition-colors tracking-tight">{b.name}</h3>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1 block">{b.category}</span>
                          </div>
                          <button 
                            onClick={() => removeBookmark(b.id)}
                            className="p-3 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-24 bg-[#111] rounded-[40px] border border-white/5 shadow-2xl">
                        <Bookmark size={64} className="mx-auto mb-6 text-slate-800" />
                        <p className="text-slate-500 font-black uppercase tracking-widest text-xs mb-2">No bookmarks yet</p>
                        <p className="text-slate-600 text-[10px] font-medium">Tap 🔖 on any business to save it here.</p>
                      </div>
                    )}
                  </div>
                )}
                {activePanel === 'RECOMMENDATIONS' && <RecommendationsPanel />}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function SubmitBusinessForm() {
  const { profile } = useProfile();
  const { closePanel, showToast } = useUI();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: 'Food',
    address: '',
    phone: '',
    website: '',
    description: '',
    createdBy: profile.username || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.address || !formData.phone || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/businesses/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, zip: profile.zip || '90210' })
      });
      if (res.ok) {
        showToast('Business submitted! 🎉');
        closePanel();
        window.location.reload();
      }
    } catch (err) {
      setError('Failed to submit business');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Business Name *</label>
        <input 
          type="text" 
          className={`w-full bg-white/5 border ${error && !formData.name ? 'border-red-500/50' : 'border-white/10'} rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20 transition-all`}
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
          placeholder="e.g. The Local Grind"
        />
      </div>
      <div>
        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Category *</label>
        <select 
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20 transition-all"
          value={formData.category}
          onChange={e => setFormData({...formData, category: e.target.value})}
        >
          <option value="Food" className="bg-[#111]">Food</option>
          <option value="Retail" className="bg-[#111]">Retail</option>
          <option value="Services" className="bg-[#111]">Services</option>
          <option value="Entertainment" className="bg-[#111]">Entertainment</option>
          <option value="Other" className="bg-[#111]">Other</option>
        </select>
      </div>
      <div>
        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Address *</label>
        <input 
          type="text" 
          className={`w-full bg-white/5 border ${error && !formData.address ? 'border-red-500/50' : 'border-white/10'} rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20 transition-all`}
          value={formData.address}
          onChange={e => setFormData({...formData, address: e.target.value})}
          placeholder="123 Main St"
        />
      </div>
      <div>
        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Phone Number *</label>
        <input 
          type="text" 
          className={`w-full bg-white/5 border ${error && !formData.phone ? 'border-red-500/50' : 'border-white/10'} rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20 transition-all`}
          value={formData.phone}
          onChange={e => setFormData({...formData, phone: e.target.value})}
          placeholder="(555) 000-0000"
        />
      </div>
      <div>
        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Website (Optional)</label>
        <input 
          type="text" 
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20 transition-all"
          value={formData.website}
          onChange={e => setFormData({...formData, website: e.target.value})}
          placeholder="www.example.com"
        />
      </div>
      <div>
        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Description *</label>
        <textarea 
          className={`w-full bg-white/5 border ${error && !formData.description ? 'border-red-500/50' : 'border-white/10'} rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20 transition-all min-h-[120px]`}
          value={formData.description}
          onChange={e => setFormData({...formData, description: e.target.value})}
          placeholder="Tell the community about your business..."
        />
      </div>
      <div>
        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Username</label>
        <input 
          type="text" 
          disabled
          className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-slate-600 cursor-not-allowed font-black"
          value={profile.username ? `@${profile.username}` : 'Not set'}
        />
      </div>

      {error && <p className="text-red-400 text-xs font-black uppercase tracking-widest text-center">{error}</p>}

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-[#c8ff57] text-black font-black py-5 rounded-2xl shadow-lg shadow-[#c8ff57]/20 hover:opacity-90 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : <PlusCircle size={20} />}
        Submit Business
      </button>
    </form>
  );
}

function PublishDealForm() {
  const { profile } = useProfile();
  const { closePanel, showToast } = useUI();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    businessName: '',
    title: '',
    description: '',
    discount: '',
    expiresAt: '',
    createdBy: profile.username || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.businessName || !formData.title || !formData.description || !formData.discount || !formData.expiresAt) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/deals/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, zip_code: profile.zip || '90210' })
      });
      if (res.ok) {
        showToast('Deal published! 🏷️');
        closePanel();
        window.location.reload();
      }
    } catch (err) {
      setError('Failed to publish deal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Business Name *</label>
        <input 
          type="text" 
          className={`w-full bg-white/5 border ${error && !formData.businessName ? 'border-red-500/50' : 'border-white/10'} rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20 transition-all`}
          value={formData.businessName}
          onChange={e => setFormData({...formData, businessName: e.target.value})}
          placeholder="Your business name"
        />
      </div>
      <div>
        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Deal Title *</label>
        <input 
          type="text" 
          className={`w-full bg-white/5 border ${error && !formData.title ? 'border-red-500/50' : 'border-white/10'} rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20 transition-all`}
          value={formData.title}
          onChange={e => setFormData({...formData, title: e.target.value})}
          placeholder="e.g. 2-for-1 Coffee"
        />
      </div>
      <div>
        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Description *</label>
        <textarea 
          className={`w-full bg-white/5 border ${error && !formData.description ? 'border-red-500/50' : 'border-white/10'} rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20 transition-all min-h-[100px]`}
          value={formData.description}
          onChange={e => setFormData({...formData, description: e.target.value})}
          placeholder="Describe the deal..."
        />
      </div>
      <div>
        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Discount *</label>
        <input 
          type="text" 
          className={`w-full bg-white/5 border ${error && !formData.discount ? 'border-red-500/50' : 'border-white/10'} rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20 transition-all`}
          value={formData.discount}
          onChange={e => setFormData({...formData, discount: e.target.value})}
          placeholder="e.g. 20% OFF"
        />
      </div>
      <div>
        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Expiry Date *</label>
        <input 
          type="date" 
          className={`w-full bg-white/5 border ${error && !formData.expiresAt ? 'border-red-500/50' : 'border-white/10'} rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20 transition-all`}
          value={formData.expiresAt}
          onChange={e => setFormData({...formData, expiresAt: e.target.value})}
        />
      </div>
      <div>
        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Username</label>
        <input 
          type="text" 
          disabled
          className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-slate-600 cursor-not-allowed font-black"
          value={profile.username ? `@${profile.username}` : 'Not set'}
        />
      </div>

      {error && <p className="text-red-400 text-xs font-black uppercase tracking-widest text-center">{error}</p>}

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-[#c8ff57] text-black font-black py-5 rounded-2xl shadow-lg shadow-[#c8ff57]/20 hover:opacity-90 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : <Tag size={20} />}
        Publish Deal
      </button>
    </form>
  );
}

function RecommendationsPanel() {
  const { profile } = useProfile();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/businesses?zip=${profile.zip || '90210'}`);
      const businesses = await res.json();
      
      const filtered = businesses.filter(b => 
        b.name.toLowerCase().includes(query.toLowerCase()) ||
        b.category.toLowerCase().includes(query.toLowerCase()) ||
        b.description.toLowerCase().includes(query.toLowerCase())
      );
      
      setResults(filtered.map(b => ({
        ...b,
        matchReason: `Matches your search for "${query}"`
      })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
        <input 
          type="text" 
          placeholder="What are you looking for today?"
          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-white focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20 transition-all text-sm font-medium"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </form>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="animate-spin text-[#c8ff57] mb-6" size={48} />
          <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Finding local gems...</p>
        </div>
      ) : searched ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
              {results.length} Matches Found
            </h3>
            <button onClick={clearResults} className="text-[10px] font-black text-[#c8ff57] hover:opacity-80 uppercase tracking-widest transition-opacity">Clear</button>
          </div>
          
          {results.length > 0 ? (
            results.map(b => (
              <div key={b.id} className="bg-[#111] border border-white/5 rounded-[32px] p-6 shadow-2xl group hover:border-[#c8ff57]/20 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-black text-white group-hover:text-[#c8ff57] transition-colors tracking-tight">{b.name}</h4>
                  <span className="text-[10px] font-black text-black uppercase tracking-[0.2em] bg-[#c8ff57] px-3 py-1 rounded-full">{b.category}</span>
                </div>
                <p className="text-xs text-slate-500 mb-6 italic font-medium leading-relaxed">"{b.matchReason}"</p>
                <a href={`/business/${b.id}`} className="text-[10px] font-black text-white flex items-center gap-2 hover:text-[#c8ff57] transition-colors uppercase tracking-widest">
                  View Profile <ArrowRight size={14} />
                </a>
              </div>
            ))
          ) : (
            <div className="text-center py-24 bg-[#111] rounded-[40px] border border-white/5 shadow-2xl">
              <p className="text-slate-500 font-black uppercase tracking-widest text-xs mb-2">No local matches found</p>
              <p className="text-slate-600 text-[10px] font-medium">Try a different search or browse all businesses</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-24 bg-[#111] rounded-[40px] border border-white/5 shadow-2xl">
          <p className="text-slate-500 text-xs font-medium leading-relaxed px-10">
            e.g. "best pizza for a family of 4", "affordable haircut near me", "gym with classes"...
          </p>
        </div>
      )}
    </div>
  );
}
