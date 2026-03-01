import React, { useState, useRef } from 'react';
import { Sparkles, MousePointer2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ButtonDemo() {
  const [ripples, setRipples] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const buttonRef = useRef(null);

  const createRipple = (e) => {
    const button = buttonRef.current;
    const rect = button.getBoundingClientRect();
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = {
      id: Date.now(),
      x,
      y
    };

    setRipples((prev) => [...prev, newRipple]);
    setShowToast(true);

    // Auto hide toast
    setTimeout(() => setShowToast(false), 3000);
    
    // Clean up ripple
    setTimeout(() => {
      setRipples((prev) => prev.filter(r => r.id !== newRipple.id));
    }, 600);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-900 mb-4">Interactive Button</h1>
        <p className="text-slate-500 max-w-md mx-auto">
          A modern, responsive button with hover scaling, ripple click effects, and instant feedback.
        </p>
      </div>

      <div className="relative">
        <button
          ref={buttonRef}
          onClick={createRipple}
          className="relative overflow-hidden px-10 py-5 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-bold text-xl rounded-2xl shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-300 hover:-translate-y-1 active:scale-95 group"
        >
          <span className="relative z-10 flex items-center gap-3">
            <MousePointer2 size={24} className="group-hover:rotate-12 transition-transform" />
            Launch Interaction
          </span>

          {/* Ripple Effects */}
          {ripples.map((ripple) => (
            <span
              key={ripple.id}
              className="absolute bg-white/40 rounded-full pointer-events-none animate-ripple"
              style={{
                left: ripple.x,
                top: ripple.y,
                width: '100px',
                height: '100px',
                marginLeft: '-50px',
                marginTop: '-50px',
              }}
            />
          ))}
        </button>
      </div>

      <div className="mt-12 flex items-center gap-2 text-slate-400 text-sm font-medium">
        <Sparkles size={16} className="text-indigo-400" />
        Click anywhere on the button to see the ripple effect
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-10 left-1/2 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 border border-white/10"
          >
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <span className="font-bold">Interaction Successful! 🚀</span>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes ripple {
          from {
            transform: scale(0);
            opacity: 1;
          }
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        .animate-ripple {
          animation: ripple 0.6s linear forwards;
        }
      `}</style>
    </div>
  );
}
