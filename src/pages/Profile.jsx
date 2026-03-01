import React, { useState } from 'react';
import { useProfile } from '../context/ProfileContext';
import { User, MapPin, Sparkles, Edit3, Save } from 'lucide-react';
import AIRecommendations from '../components/AIRecommendations';

export default function Profile() {
  const { profile, updateProfile } = useProfile();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState(profile.bio || '');
  const [editZip, setEditZip] = useState(profile.zip || '');
  const [editUsername, setEditUsername] = useState(profile.username || '');

  const handleSave = () => {
    updateProfile({ bio: editBio, zip: editZip, username: editUsername });
    setIsEditing(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Profile Info */}
        <div className="space-y-8">
          <div className="bg-[#111] rounded-[40px] p-10 border border-white/5 shadow-2xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#c8ff57]/10 to-transparent" />
            
            <div className="relative">
              <div className="w-28 h-28 bg-white/5 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/10 backdrop-blur-xl">
                <User size={56} className="text-slate-700" />
              </div>
              
              <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
                {profile.username ? `@${profile.username}` : 'Anonymous User'}
              </h1>
              
              <div className="flex items-center justify-center gap-2 text-slate-500 text-sm mb-8 font-bold uppercase tracking-widest">
                <MapPin size={16} className="text-[#c8ff57]" />
                {profile.zip || 'No ZIP set'}
              </div>

              {isEditing ? (
                <div className="space-y-6 text-left">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Username</label>
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Bio</label>
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20 min-h-[100px]"
                      placeholder="Tell us about your local interests..."
                      maxLength={160}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">ZIP Code</label>
                    <input
                      type="text"
                      value={editZip}
                      onChange={(e) => setEditZip(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20"
                      maxLength={5}
                    />
                  </div>
                  <button onClick={handleSave} className="w-full flex items-center justify-center gap-3 font-black py-5 rounded-2xl transition-all bg-[#c8ff57] text-black shadow-lg shadow-[#c8ff57]/20 hover:opacity-90">
                    <Save size={20} />
                    SAVE PROFILE
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-slate-400 text-lg mb-10 leading-relaxed italic">
                    {profile.bio || "No bio yet. Add one to get better recommendations!"}
                  </p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 mx-auto text-xs font-black text-[#c8ff57] hover:opacity-80 transition-opacity uppercase tracking-widest"
                  >
                    <Edit3 size={16} />
                    Edit Profile
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Recommendations */}
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
              <Sparkles className="text-[#c8ff57]" size={28} />
              Your Local Pulse
            </h2>
            <AIRecommendations zip={profile.zip} bio={profile.bio} />
          </section>
        </div>
      </div>
    </div>
  );
}
