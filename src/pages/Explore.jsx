import React, { useEffect, useState } from 'react';
import { useProfile } from '../context/ProfileContext';
import { useUI } from '../context/UIContext';
import BusinessCard from '../components/BusinessCard';
import { Search, Loader2, SlidersHorizontal } from 'lucide-react';

export default function Explore() {
  const { profile } = useProfile();
  const { zip } = profile;
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('Highest Rated');

  useEffect(() => {
    if (!zip) return;
    setLoading(true);
    const params = new URLSearchParams({ zip, search, category, sort });
    fetch(`/api/businesses?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setBusinesses(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [zip, search, category, sort]);

  const categories = ['Food', 'Retail', 'Services', 'Entertainment', 'Other'];

  const handleDeleteBusiness = (id) => {
    setBusinesses(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-white mb-3 tracking-tight">Explore Local</h1>
        <p className="text-white/70 font-medium">Discover the best businesses in {zip}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-12">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40" size={20} />
          <input
            type="text"
            placeholder="Search businesses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-[24px] pl-14 pr-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-2xl placeholder:text-white/30"
          />
        </div>
        
        <div className="flex flex-wrap gap-4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-[20px] px-6 py-4 text-sm font-black text-white/70 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-2xl uppercase tracking-widest"
          >
            <option value="" className="bg-bg">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat} className="bg-bg">{cat}</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-[20px] px-6 py-4 text-sm font-black text-white/70 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-2xl uppercase tracking-widest"
          >
            <option value="Highest Rated" className="bg-bg">Highest Rated</option>
            <option value="Lowest Rated" className="bg-bg">Lowest Rated</option>
            <option value="Most Reviewed" className="bg-bg">Most Reviewed</option>
            <option value="Alphabetical" className="bg-bg">Alphabetical</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="animate-spin text-primary mb-6" size={48} />
          <p className="text-white/60 font-black uppercase tracking-[0.2em] text-xs">Searching for local gems...</p>
        </div>
      ) : businesses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {businesses.map(business => (
            <BusinessCard 
              key={business.id} 
              business={business} 
              onDelete={handleDeleteBusiness}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white/10 rounded-[40px] border border-white/20 shadow-2xl">
          <p className="text-white/70 font-black uppercase tracking-widest text-sm mb-2">No businesses found</p>
          <p className="text-white/50 text-xs font-medium">Try adjusting your filters or search term.</p>
        </div>
      )}
    </div>
  );
}
