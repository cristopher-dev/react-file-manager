import { useState, useRef, useCallback } from 'react';

export const useTouchGestures = (options = {}) => {
  const {
    onTap = () => {},
    onDoubleTap = () => {},
    onLongPress = () => {},
    onSwipeLeft = () => {},
    onSwipeRight = () => {},
    onSwipeUp = () => {},
    onSwipeDown = () => {},
    longPressDelay = 500,
    doubleTapDelay = 300,
    swipeThreshold = 50,
  } = options;

  const [isPressed, setIsPressed] = useState(false);
  const touchStartRef = useRef(null);
  const touchEndRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const lastTapRef = useRef(null);
  const tapCountRef = useRef(0);

  const clearTimers = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const calculateDistance = useCallback((start, end) => {
    const deltaX = end.clientX - start.clientX;
    const deltaY = end.clientY - start.clientY;
    return {
      deltaX,
      deltaY,
      distance: Math.sqrt(deltaX * deltaX + deltaY * deltaY),
    };
  }, []);

  const handleTouchStart = useCallback((event) => {
    const touch = event.touches[0];
    touchStartRef.current = {
      clientX: touch.clientX,
      clientY: touch.clientY,
      timestamp: Date.now(),
    };
    touchEndRef.current = null;
    setIsPressed(true);

    // Start long press timer
    longPressTimerRef.current = setTimeout(() => {
      if (touchStartRef.current && !touchEndRef.current) {
        onLongPress(event);
        clearTimers();
      }
    }, longPressDelay);
  }, [onLongPress, longPressDelay, clearTimers]);

  const handleTouchMove = useCallback((event) => {
    if (!touchStartRef.current) return;

    const touch = event.touches[0];
    const { distance } = calculateDistance(touchStartRef.current, touch);

    // Cancel long press if moved too much
    if (distance > 10) {
      clearTimers();
    }
  }, [calculateDistance, clearTimers]);

  const handleTouchEnd = useCallback((event) => {
    if (!touchStartRef.current) return;

    const touch = event.changedTouches[0];
    touchEndRef.current = {
      clientX: touch.clientX,
      clientY: touch.clientY,
      timestamp: Date.now(),
    };

    const { deltaX, deltaY, distance } = calculateDistance(
      touchStartRef.current,
      touchEndRef.current
    );

    clearTimers();
    setIsPressed(false);

    // Check for swipe gestures
    if (distance > swipeThreshold) {
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0) {
          onSwipeRight(event);
        } else {
          onSwipeLeft(event);
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          onSwipeDown(event);
        } else {
          onSwipeUp(event);
        }
      }
      return;
    }

    // Handle tap gestures
    const now = Date.now();
    const timeSinceLastTap = lastTapRef.current ? now - lastTapRef.current : doubleTapDelay + 1;

    if (timeSinceLastTap < doubleTapDelay) {
      // Double tap detected
      tapCountRef.current = 0;
      lastTapRef.current = null;
      onDoubleTap(event);
    } else {
      // Single tap, but wait to see if there's a second tap
      tapCountRef.current = 1;
      lastTapRef.current = now;
      
      setTimeout(() => {
        if (tapCountRef.current === 1) {
          onTap(event);
          tapCountRef.current = 0;
        }
      }, doubleTapDelay);
    }
  }, [
    calculateDistance,
    clearTimers,
    swipeThreshold,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onDoubleTap,
    doubleTapDelay,
  ]);

  const handleTouchCancel = useCallback(() => {
    clearTimers();
    setIsPressed(false);
    touchStartRef.current = null;
    touchEndRef.current = null;
  }, [clearTimers]);

  const touchHandlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchCancel,
  };

  return {
    touchHandlers,
    isPressed,
  };
};

export default useTouchGestures;
