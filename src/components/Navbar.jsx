import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { useUI } from '../context/UIContext';
import { Home, Compass, Tag, User, PlusCircle, MapPin, Bookmark } from 'lucide-react';

export default function Navbar() {
  const { profile, updateProfile } = useProfile();
  const { openPanel } = useUI();
  const location = useLocation();

  const navItems = [
    { name: 'Feed', path: '/', icon: Home },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Deals', path: '/deals', icon: Tag },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-[#c8ff57] rounded-xl flex items-center justify-center shadow-lg shadow-[#c8ff57]/20 group-hover:scale-105 transition-transform">
              <div className="w-5 h-5 bg-black rounded-full" />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter">
              LocalPulse
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${
                  location.pathname === item.path ? 'text-[#c8ff57]' : 'text-slate-500 hover:text-white'
                }`}
              >
                <item.icon size={18} />
                {item.name}
              </Link>
            ))}
            <button
              onClick={() => openPanel('BOOKMARKS')}
              className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all"
            >
              <Bookmark size={18} />
              Bookmarks
            </button>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <div className="flex items-center gap-3">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">User</label>
                <input
                  type="text"
                  placeholder="@username"
                  value={profile.username}
                  onChange={(e) => updateProfile({ username: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-black text-white focus:outline-none focus:ring-2 focus:ring-[#c8ff57]/20 w-36 transition-all"
                />
              </div>
              {profile.username && (
                <span className="text-[10px] font-black text-[#c8ff57] mt-1 uppercase tracking-widest opacity-80">
                  @{profile.username.replace(/^@/, '')}
                </span>
              )}
            </div>

            <button
              onClick={() => {
                const newZip = prompt('Enter your ZIP code:', profile.zip);
                if (newZip && /^\d{5}$/.test(newZip)) {
                  updateProfile({ zip: newZip });
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black text-slate-400 transition-all border border-white/10 uppercase tracking-widest"
            >
              <MapPin size={14} className="text-[#c8ff57]" />
              {profile.zip || 'Set ZIP'}
            </button>

            <Link to="/profile" className="p-2 bg-white/5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all">
              <User size={20} />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
