import React, { useEffect, useState } from 'react';
import { useProfile } from '../context/ProfileContext';
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

  const [bookmarks, setBookmarks] = useState(() => {
    const saved = localStorage.getItem('local_pulse_bookmarks');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('local_pulse_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const toggleBookmark = (id) => {
    setBookmarks(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };

  const handleDeleteBusiness = (id) => {
    setBusinesses(prev => prev.filter(b => b.id !== id));
  };

  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  const displayedBusinesses = showBookmarksOnly 
    ? businesses.filter(b => bookmarks.includes(b.id))
    : businesses;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Explore Local</h1>
          <p className="text-slate-500">Discover the best businesses in {zip}</p>
        </div>
        <button
          onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            showBookmarksOnly 
              ? 'bg-primary text-white shadow-lg shadow-primary/20' 
              : 'bg-white border border-slate-200 text-slate-600 hover:border-primary/30'
          }`}
        >
          {showBookmarksOnly ? 'Showing Bookmarks' : 'View Bookmarks'}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search businesses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-11"
          />
        </div>
        
        <div className="flex flex-wrap gap-4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="Highest Rated">Highest Rated</option>
            <option value="Lowest Rated">Lowest Rated</option>
            <option value="Most Reviewed">Most Reviewed</option>
            <option value="Alphabetical">Alphabetical</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary mb-4" size={40} />
          <p className="text-slate-500 font-medium">Searching for local gems...</p>
        </div>
      ) : displayedBusinesses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedBusinesses.map(business => (
            <BusinessCard 
              key={business.id} 
              business={business} 
              onDelete={handleDeleteBusiness}
              isBookmarked={bookmarks.includes(business.id)}
              onToggleBookmark={() => toggleBookmark(business.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
          <p className="text-slate-500 font-medium">
            {showBookmarksOnly ? "You haven't bookmarked any businesses yet." : "No businesses found matching your criteria."}
          </p>
          <p className="text-slate-400 text-sm mt-1">
            {showBookmarksOnly ? "Bookmark businesses you love to see them here!" : "Try adjusting your filters or search term."}
          </p>
        </div>
      )}
    </div>
  );
}
