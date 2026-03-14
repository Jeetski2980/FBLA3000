import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { Home, Compass, Tag, User, PlusCircle, MapPin, Building2, Megaphone } from 'lucide-react';

export default function Navbar() {
  const { profile, updateProfile } = useProfile();
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Deals', path: '/deals', icon: Tag },
    { name: 'Community Feed', path: '/feed', icon: PlusCircle },
    { name: 'Business', path: '/submit', icon: Building2 },
    { name: 'Post a Deal', path: '/post-deal', icon: Megaphone },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-bg/80 backdrop-blur-xl border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <div className="w-5 h-5 bg-white rounded-full" />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter">
              LocalPulse
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 font-black uppercase tracking-widest transition-all origin-left ${
                  location.pathname === item.path 
                    ? 'text-white text-[14px] scale-110' 
                    : 'text-white/40 hover:text-white text-[10px] scale-90'
                }`}
              >
                <item.icon size={14} />
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                const newZip = prompt('Enter your ZIP code:', profile.zip);
                if (newZip && /^\d{5}$/.test(newZip)) {
                  updateProfile({ zip: newZip });
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black text-white/40 transition-all border border-white/10 uppercase tracking-widest"
            >
              <MapPin size={12} className="text-white/30" />
              {profile.zip || 'Set ZIP'}
            </button>

            <Link to="/profile" className="p-2 bg-white/5 rounded-xl border border-white/10 text-white/40 hover:text-white transition-all">
              <User size={18} />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
