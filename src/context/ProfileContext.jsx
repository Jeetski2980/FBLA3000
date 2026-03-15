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
        username: parsed.username || '',
        savedBusinesses: parsed.savedBusinesses || []
      };
    }
    return { zip: '', bio: '', username: '', savedBusinesses: [] };
  });

  useEffect(() => {
    localStorage.setItem('local_pulse_profile', JSON.stringify(profile));
  }, [profile]);

  const updateProfile = (updates) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const toggleSavedBusiness = (businessId) => {
    setProfile(prev => {
      const alreadySaved = prev.savedBusinesses.includes(businessId);

      return {
        ...prev,
        savedBusinesses: alreadySaved
          ? prev.savedBusinesses.filter(id => id !== businessId)
          : [...prev.savedBusinesses, businessId]
      };
    });
  };

  const isBusinessSaved = (businessId) => {
    return profile.savedBusinesses.includes(businessId);
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        updateProfile,
        toggleSavedBusiness,
        isBusinessSaved
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);