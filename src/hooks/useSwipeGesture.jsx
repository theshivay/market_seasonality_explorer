import { useState, useEffect } from 'react';

/**
 * Custom hook to handle swipe gestures
 * @param {function} onSwipeLeft - Callback for left swipe
 * @param {function} onSwipeRight - Callback for right swipe
 * @param {number} threshold - Minimum swipe distance to trigger the action
 * @returns {object} ref - Ref to attach to the element
 */
const useSwipeGesture = (onSwipeLeft, onSwipeRight, threshold = 50) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  // Reset state when swipe is complete
  useEffect(() => {
    if (touchStart && touchEnd) {
      // Calculate the distance of the swipe
      const distance = touchStart - touchEnd;
      const isSwipe = Math.abs(distance) > threshold;
      
      if (isSwipe) {
        if (distance > 0 && onSwipeLeft) {
          onSwipeLeft();
        } else if (distance < 0 && onSwipeRight) {
          onSwipeRight();
        }
      }
      
      // Reset state
      setTouchEnd(null);
      setTouchStart(null);
    }
  }, [touchStart, touchEnd, onSwipeLeft, onSwipeRight, threshold]);
  
  // Event handlers
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    // If no movement detected, reset state
    if (!touchEnd) {
      setTouchStart(null);
    }
  };
  
  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
};

export default useSwipeGesture;
