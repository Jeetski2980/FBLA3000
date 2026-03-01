import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProfileProvider } from './context/ProfileContext';
import { UIProvider } from './context/UIContext';
import Navbar from './components/Navbar';
import GlobalUI from './components/GlobalUI';
import OnboardingModal from './components/OnboardingModal';

// Pages
import Feed from './pages/Feed';
import Explore from './pages/Explore';
import Deals from './pages/Deals';
import BusinessProfile from './pages/BusinessProfile';
import Profile from './pages/Profile';
import SubmitBusiness from './pages/SubmitBusiness';
import Admin from './pages/Admin';

export default function App() {
  return (
    <ProfileProvider>
      <UIProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Feed />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/deals" element={<Deals />} />
                <Route path="/business/:id" element={<BusinessProfile />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/submit" element={<SubmitBusiness />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<Explore />} />
              </Routes>
            </main>
            <footer className="bg-[#111] border-t border-white/5 py-12 mt-12">
              <div className="max-w-5xl mx-auto px-4 text-center">
                <p className="text-slate-500 text-sm font-medium">
                  © 2026 Local Pulse. Supporting local, one post at a time.
                </p>
              </div>
            </footer>
            <GlobalUI />
            <OnboardingModal />
          </div>
        </Router>
      </UIProvider>
    </ProfileProvider>
  );
}
