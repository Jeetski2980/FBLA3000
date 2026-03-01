import React, { createContext, useContext, useState, useEffect } from 'react';

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('local_pulse_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        zip: parsed.zip || '',
        bio: parsed.bio || '',
        username: parsed.username || ''
      };
    }
    return { zip: '', bio: '', username: '' };
  });

  useEffect(() => {
    localStorage.setItem('local_pulse_profile', JSON.stringify(profile));
  }, [profile]);

  const updateProfile = (updates) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
