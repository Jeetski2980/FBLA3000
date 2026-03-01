import React, { createContext, useContext, useState, useEffect } from 'react';

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('local_pulse_profile');
    return saved ? JSON.parse(saved) : { zip: '', bio: '', username: '' };
  });

  useEffect(() => {
    localStorage.setItem('local_pulse_profile', JSON.stringify(profile));
  }, [profile]);

  const updateProfile = (updates) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const isComplete = profile.zip && profile.bio;

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, isComplete }}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
