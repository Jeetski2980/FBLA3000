import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { Home, Compass, Tag, User, PlusCircle, MapPin, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { profile, updateProfile } = useProfile();
  const location = useLocation();

  const navItems = [
    { name: 'Feed', path: '/', icon: Home },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Deals', path: '/deals', icon: Tag },
    { name: 'Demo', path: '/button-demo', icon: Sparkles },
    { name: 'Business', path: '/submit', icon: PlusCircle },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Local Pulse
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  location.pathname === item.path ? 'text-primary' : 'text-slate-600 hover:text-primary'
                }`}
              >
                <item.icon size={18} />
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Username</label>
                <input
                  type="text"
                  placeholder="@your_username"
                  value={profile.username}
                  onChange={(e) => updateProfile({ username: e.target.value })}
                  className="bg-slate-100 border-none rounded-lg px-2 py-1 text-xs font-medium focus:ring-1 focus:ring-primary w-32"
                />
              </div>
              {profile.username && (
                <span className="text-[10px] font-bold text-[#c8ff57] mt-1">
                  Logged in as @{profile.username.replace(/^@/, '')}
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
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-xs font-medium text-slate-600 transition-colors"
            >
              <MapPin size={14} />
              {profile.zip || 'Set ZIP'}
            </button>

            <Link to="/profile" className="text-slate-600 hover:text-primary">
              <User size={20} />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
