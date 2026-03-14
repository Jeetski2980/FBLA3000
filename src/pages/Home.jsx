import React from 'react';
import { Building2, Target, Eye } from 'lucide-react';

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-20">
        <h1 tabIndex={0} className="text-6xl font-black text-white mb-6 tracking-tighter">
          LocalPulse
        </h1>
        <p className="text-xl text-white/70 font-medium max-w-2xl mx-auto leading-relaxed">
          Connecting you to the heart of your community. Discover local gems, 
          exclusive deals, and stay updated with what's happening around the corner.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-white/10 border border-white/20 rounded-[40px] p-10 shadow-2xl">
          <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mb-6">
            <Target size={24} />
          </div>
          <h2 className="text-2xl font-black text-white mb-4 tracking-tight uppercase tracking-widest text-sm text-white/50">Our Mission</h2>
          <p className="text-2xl leading-relaxed text-white italic font-serif">
            “LocalPulse keeps communities connected to the local businesses that define them”
          </p>
        </div>

        <div className="bg-white/10 border border-white/20 rounded-[40px] p-10 shadow-2xl">
          <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mb-6">
            <Eye size={24} />
          </div>
          <h2 className="text-2xl font-black text-white mb-4 tracking-tight uppercase tracking-widest text-sm text-white/50">Our Vision</h2>
          <p className="text-2xl leading-relaxed text-white italic font-serif">
            "A world where every neighborhood thrives because people discover and support the businesses around the corner."
          </p>
        </div>
      </div>

      <div className="mt-24 text-center">
        <div className="inline-block p-1 px-4 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
          Est. 2026 • Local First
        </div>
      </div>
    </div>
  );
}
