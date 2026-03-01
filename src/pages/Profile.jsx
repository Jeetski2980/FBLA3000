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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Info */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary/20 to-secondary/20" />
            
            <div className="relative">
              <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-md border-4 border-white">
                <User size={48} className="text-slate-300" />
              </div>
              
              <h1 className="text-2xl font-bold text-slate-900 mb-1">
                {profile.username ? `@${profile.username}` : 'Anonymous User'}
              </h1>
              
              <div className="flex items-center justify-center gap-1 text-slate-400 text-sm mb-6">
                <MapPin size={14} />
                {profile.zip || 'No ZIP set'}
              </div>

              {isEditing ? (
                <div className="space-y-4 text-left">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Username</label>
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      className="input text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bio</label>
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      className="input text-sm min-h-[80px]"
                      placeholder="Tell us about your local interests..."
                      maxLength={160}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">ZIP Code</label>
                    <input
                      type="text"
                      value={editZip}
                      onChange={(e) => setEditZip(e.target.value)}
                      className="input text-sm"
                      maxLength={5}
                    />
                  </div>
                  <button onClick={handleSave} className="btn-primary w-full flex items-center justify-center gap-2">
                    <Save size={18} />
                    Save Profile
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-slate-600 text-sm mb-6 leading-relaxed italic">
                    {profile.bio || "No bio yet. Add one to get better recommendations!"}
                  </p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 mx-auto text-xs font-bold text-primary hover:underline"
                  >
                    <Edit3 size={14} />
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
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Sparkles className="text-primary" size={24} />
              Your Local Pulse
            </h2>
            <AIRecommendations zip={profile.zip} bio={profile.bio} />
          </section>
        </div>
      </div>
    </div>
  );
}
