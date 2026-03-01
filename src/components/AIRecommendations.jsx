import React, { useState } from 'react';
import { Sparkles, ArrowRight, Loader2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

export default function AIRecommendations({ zip, bio }) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const getRecs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zip, bio })
      });
      const data = await res.json();
      if (res.ok) {
        setResults(data);
      } else {
        setError(data.error || 'Failed to get recommendations');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {!results && !loading && (
        <div className="bg-[#111] rounded-[40px] p-12 border border-white/5 text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#c8ff57]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/5 rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-white/10 shadow-2xl backdrop-blur-xl">
              <Sparkles className="text-[#c8ff57]" size={40} />
            </div>
            <h3 className="text-2xl font-black text-white mb-4 tracking-tight">Personalized For You</h3>
            <p className="text-slate-500 text-sm mb-10 max-w-xs mx-auto font-medium leading-relaxed">
              Our AI analyzes your bio and local businesses to find the perfect spots just for you.
            </p>
            <button onClick={getRecs} className="w-full flex items-center justify-center gap-3 font-black py-5 rounded-2xl transition-all bg-[#c8ff57] text-black shadow-lg shadow-[#c8ff57]/20 hover:opacity-90 uppercase tracking-widest text-sm">
              Get Recommendations
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="py-20 text-center">
          <Loader2 className="animate-spin text-[#c8ff57] mx-auto mb-6" size={48} />
          <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs">Analyzing local favorites...</p>
        </div>
      )}

      {error && (
        <div className="p-6 bg-red-500/10 text-red-400 rounded-[32px] text-sm text-center border border-red-500/20 font-bold">
          {error}
        </div>
      )}

      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white flex items-center gap-3">
                <Sparkles className="text-[#c8ff57]" size={24} />
                AI Recommendations
              </h3>
              <button onClick={() => setResults(null)} className="text-[10px] font-black text-slate-600 hover:text-[#c8ff57] uppercase tracking-widest transition-colors">
                Clear
              </button>
            </div>

            <div className="grid gap-6">
              {results.recommendations.map((rec, i) => (
                <motion.div
                  key={rec.businessId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[#111] rounded-[32px] p-8 border border-white/5 shadow-2xl hover:border-[#c8ff57]/30 transition-all group"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <span className="text-[10px] font-black text-black uppercase tracking-[0.2em] bg-[#c8ff57] px-3 py-1 rounded-full mb-3 inline-block">
                        {rec.category}
                      </span>
                      <h4 className="text-xl font-black text-white group-hover:text-[#c8ff57] transition-colors tracking-tight">
                        {rec.name}
                      </h4>
                    </div>
                    <Link to={`/business/${rec.businessId}`} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-slate-400 hover:text-[#c8ff57] hover:border-[#c8ff57]/30 transition-all">
                      <ArrowRight size={20} />
                    </Link>
                  </div>
                  
                  <div className="flex gap-4 bg-white/5 rounded-2xl p-5 border border-white/5">
                    <MessageSquare size={20} className="text-[#c8ff57] shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-400 leading-relaxed italic font-medium">
                      "{rec.reason}"
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {results.suggestedCategories?.length > 0 && (
              <div className="pt-6">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Suggested Categories</p>
                <div className="flex flex-wrap gap-3">
                  {results.suggestedCategories.map(cat => (
                    <span key={cat} className="px-5 py-2 bg-white/5 rounded-full text-xs font-black text-slate-400 border border-white/10 uppercase tracking-widest">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {results.fallbackUsed && (
              <p className="text-[10px] font-black text-slate-600 text-center italic uppercase tracking-widest">
                Showing top-rated businesses in your area.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
