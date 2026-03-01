import React, { createContext, useContext, useState, useCallback } from 'react';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [toast, setToast] = useState(null);
  const [activePanel, setActivePanel] = useState(null); // 'SUBMIT_BUSINESS', 'PUBLISH_DEAL', 'BOOKMARKS', 'RECOMMENDATIONS'

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const openPanel = useCallback((panel) => {
    setActivePanel(panel);
  }, []);

  const closePanel = useCallback(() => {
    setActivePanel(null);
  }, []);

  return (
    <UIContext.Provider value={{ toast, showToast, activePanel, openPanel, closePanel }}>
      {children}
    </UIContext.Provider>
  );
}

export const useUI = () => useContext(UIContext);
