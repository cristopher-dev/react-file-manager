import { useState, useEffect } from 'react';

// Breakpoints definidos en variables.scss
const BREAKPOINTS = {
  xs: 320,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400
};

export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowSize({ width, height });
      setIsMobile(width < BREAKPOINTS.sm);
      setIsTablet(width >= BREAKPOINTS.sm && width < BREAKPOINTS.md);
      setIsDesktop(width >= BREAKPOINTS.md);
    };

    // Configurar el estado inicial
    handleResize();

    // Agregar listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
    isMobileOrTablet: isMobile || isTablet,
    breakpoint: {
      isXs: windowSize.width < BREAKPOINTS.xs,
      isSm: windowSize.width >= BREAKPOINTS.sm && windowSize.width < BREAKPOINTS.md,
      isMd: windowSize.width >= BREAKPOINTS.md && windowSize.width < BREAKPOINTS.lg,
      isLg: windowSize.width >= BREAKPOINTS.lg && windowSize.width < BREAKPOINTS.xl,
      isXl: windowSize.width >= BREAKPOINTS.xl && windowSize.width < BREAKPOINTS.xxl,
      isXxl: windowSize.width >= BREAKPOINTS.xxl
    }
  };
};

export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event) => setMatches(event.matches);
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
};

export const useTouchDevice = () => {
  return useMediaQuery('(hover: none) and (pointer: coarse)');
};

export const useOrientation = () => {
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  return { isLandscape, isPortrait: !isLandscape };
};
