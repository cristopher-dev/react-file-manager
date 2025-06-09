import React, { createContext, useContext, useState } from 'react';

const MobileNavigationContext = createContext();

export const MobileNavigationProvider = ({ children }) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const toggleMobileNav = () => {
    setIsMobileNavOpen(prev => !prev);
  };

  const closeMobileNav = () => {
    setIsMobileNavOpen(false);
  };

  const openMobileNav = () => {
    setIsMobileNavOpen(true);
  };

  const value = {
    isMobileNavOpen,
    toggleMobileNav,
    closeMobileNav,
    openMobileNav
  };

  return (
    <MobileNavigationContext.Provider value={value}>
      {children}
    </MobileNavigationContext.Provider>
  );
};

export const useMobileNavigation = () => {
  const context = useContext(MobileNavigationContext);
  if (!context) {
    throw new Error('useMobileNavigation must be used within a MobileNavigationProvider');
  }
  return context;
};
