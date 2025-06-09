import { useState, useRef, useCallback, useEffect } from 'react';
import { useResponsive } from './useResponsive';

export const usePullToRefresh = (onRefresh, options = {}) => {
  const {
    threshold = 80,
    maxPullDistance = 120,
    refreshDelay = 1500,
    disabled = false,
  } = options;

  const { isMobile } = useResponsive();
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  
  const startTouchRef = useRef(null);
  const scrollElementRef = useRef(null);
  const isEnabledRef = useRef(false);

  const handleTouchStart = useCallback((e) => {
    if (!isMobile || disabled || !scrollElementRef.current) return;
    
    const scrollTop = scrollElementRef.current.scrollTop;
    if (scrollTop === 0) {
      startTouchRef.current = {
        clientY: e.touches[0].clientY,
        timestamp: Date.now(),
      };
      isEnabledRef.current = true;
    }
  }, [isMobile, disabled]);

  const handleTouchMove = useCallback((e) => {
    if (!isMobile || disabled || !startTouchRef.current || !isEnabledRef.current) return;
    
    const currentTouch = e.touches[0];
    const deltaY = currentTouch.clientY - startTouchRef.current.clientY;
    
    if (deltaY > 0) {
      // Pulling down
      e.preventDefault();
      const distance = Math.min(deltaY * 0.5, maxPullDistance);
      setPullDistance(distance);
      setIsPulling(distance > 20);
    } else {
      // Scrolling up, disable pull-to-refresh
      isEnabledRef.current = false;
      setPullDistance(0);
      setIsPulling(false);
    }
  }, [isMobile, disabled, maxPullDistance]);

  const handleTouchEnd = useCallback(async () => {
    if (!isMobile || disabled || !startTouchRef.current) return;
    
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
        setTimeout(() => {
          setIsRefreshing(false);
        }, refreshDelay);
      } catch (error) {
        console.error('Pull to refresh error:', error);
        setIsRefreshing(false);
      }
    }
    
    startTouchRef.current = null;
    isEnabledRef.current = false;
    setPullDistance(0);
    setIsPulling(false);
  }, [isMobile, disabled, pullDistance, threshold, isRefreshing, onRefresh, refreshDelay]);

  const setScrollElement = useCallback((element) => {
    scrollElementRef.current = element;
  }, []);

  const pullToRefreshHandlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };

  const pullIndicatorStyle = {
    transform: `translateY(${pullDistance}px)`,
    opacity: isPulling ? 1 : 0,
  };

  const shouldShowRefreshIndicator = isPulling || isRefreshing;
  const refreshProgress = Math.min(pullDistance / threshold, 1);

  return {
    pullToRefreshHandlers,
    setScrollElement,
    isPulling,
    isRefreshing,
    pullDistance,
    shouldShowRefreshIndicator,
    refreshProgress,
    pullIndicatorStyle,
  };
};

export default usePullToRefresh;
