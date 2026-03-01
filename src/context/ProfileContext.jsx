import React, { createContext, useContext, useState, useEffect } from 'react';

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('local_pulse_profile');
    return saved ? JSON.parse(saved) : { zip: '', bio: '', username: '', bookmarks: [] };
  });

  useEffect(() => {
    localStorage.setItem('local_pulse_profile', JSON.stringify(profile));
  }, [profile]);

  const updateProfile = (updates) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const toggleBookmark = (id) => {
    setProfile(prev => {
      const bookmarks = prev.bookmarks || [];
      const updated = bookmarks.includes(id) 
        ? bookmarks.filter(b => b !== id) 
        : [...bookmarks, id];
      return { ...prev, bookmarks: updated };
    });
  };

  const isComplete = profile.zip && profile.bio;

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, toggleBookmark, isComplete }}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
