import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProfileProvider } from './context/ProfileContext';
import { UIProvider } from './context/UIContext';
import Navbar from './components/Navbar';
import GlobalUI from './components/GlobalUI';

// Pages
import Home from './pages/Home';
import LocalPulseAI from './pages/LocalPulseAI';
import Explore from './pages/Explore';
import Deals from './pages/Deals';
import BusinessProfile from './pages/BusinessProfile';
import Profile from './pages/Profile';
import SubmitBusiness from './pages/SubmitBusiness';
import PostDeal from './pages/PostDeal';
import Admin from './pages/Admin';

export default function App() {
  return (
    <ProfileProvider>
      <UIProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-bg">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/feed" element={<LocalPulseAI />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/deals" element={<Deals />} />
                <Route path="/business/:id" element={<BusinessProfile />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/submit" element={<SubmitBusiness />} />
                <Route path="/post-deal" element={<PostDeal />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<Home />} />
              </Routes>
            </main>
            <footer
              className="border-t border-white/10 py-7 mt-0"
              style={{ backgroundColor: '#2BB691' }}
            >
              <div className="max-w-5xl mx-auto px-4 text-center">
                <p className="text-white/40 text-[8px] font-medium normal-case tracking-normal scale-75 inline-block">
                  © 2026 Local Pulse • Community First
                </p>
              </div>
            </footer>
            <GlobalUI />
          </div>
        </Router>
      </UIProvider>
    </ProfileProvider>
  );
}