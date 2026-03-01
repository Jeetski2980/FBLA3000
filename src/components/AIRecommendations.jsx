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
    <div className="space-y-6">
      {!results && !loading && (
        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl p-8 border border-primary/10 text-center">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Sparkles className="text-primary" size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Personalized For You</h3>
          <p className="text-slate-600 text-sm mb-6 max-w-xs mx-auto">
            Our AI analyzes your bio and local businesses to find the perfect spots just for you.
          </p>
          <button onClick={getRecs} className="btn-primary flex items-center gap-2 mx-auto">
            Get Recommendations
            <ArrowRight size={18} />
          </button>
        </div>
      )}

      {loading && (
        <div className="py-12 text-center">
          <Loader2 className="animate-spin text-primary mx-auto mb-4" size={40} />
          <p className="text-slate-500 font-medium">Analyzing local favorites...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm text-center border border-red-100">
          {error}
        </div>
      )}

      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="text-primary" size={20} />
                AI Recommendations
              </h3>
              <button onClick={() => setResults(null)} className="text-xs font-bold text-slate-400 hover:text-primary">
                Clear
              </button>
            </div>

            <div className="grid gap-4">
              {results.recommendations.map((rec, i) => (
                <motion.div
                  key={rec.businessId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 block">
                        {rec.category}
                      </span>
                      <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">
                        {rec.name}
                      </h4>
                    </div>
                    <Link to={`/business/${rec.businessId}`} className="text-slate-400 hover:text-primary">
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                  
                  <div className="flex gap-3 bg-slate-50 rounded-xl p-3">
                    <MessageSquare size={16} className="text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-600 leading-relaxed italic">
                      "{rec.reason}"
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {results.suggestedCategories?.length > 0 && (
              <div className="pt-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Suggested Categories</p>
                <div className="flex flex-wrap gap-2">
                  {results.suggestedCategories.map(cat => (
                    <span key={cat} className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {results.fallbackUsed && (
              <p className="text-[10px] text-slate-400 text-center italic">
                Showing top-rated businesses in your area.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
