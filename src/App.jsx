import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProfileProvider } from './context/ProfileContext';
import Navbar from './components/Navbar';
import OnboardingModal from './components/OnboardingModal';

// Pages
import Feed from './pages/Feed';
import Explore from './pages/Explore';
import Deals from './pages/Deals';
import BusinessProfile from './pages/BusinessProfile';
import Profile from './pages/Profile';
import SubmitBusiness from './pages/SubmitBusiness';
import ButtonDemo from './pages/ButtonDemo';
import Admin from './pages/Admin';

export default function App() {
  return (
    <ProfileProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Feed />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/deals" element={<Deals />} />
              <Route path="/business/:id" element={<BusinessProfile />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/submit" element={<SubmitBusiness />} />
              <Route path="/button-demo" element={<ButtonDemo />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
          <footer className="bg-white border-t border-slate-200 py-8 mt-12">
            <div className="max-w-5xl mx-auto px-4 text-center">
              <p className="text-slate-400 text-sm font-medium">
                © 2026 Local Pulse. Supporting local, one post at a time.
              </p>
            </div>
          </footer>
          <OnboardingModal />
        </div>
      </Router>
    </ProfileProvider>
  );
}
