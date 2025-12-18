import { useState, useEffect, useCallback, useRef } from 'react';

interface ScrollState {
  scrollY: number;
  scrollProgress: number;
  direction: 'up' | 'down' | null;
  velocity: number;
}

export const useScrollAnimation = () => {
  const [scrollState, setScrollState] = useState<ScrollState>({
    scrollY: 0,
    scrollProgress: 0,
    direction: null,
    velocity: 0,
  });
  
  const lastScrollY = useRef(0);
  const lastTime = useRef(Date.now());
  const rafId = useRef<number>();

  const handleScroll = useCallback(() => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }

    rafId.current = requestAnimationFrame(() => {
      const currentScrollY = window.scrollY;
      const currentTime = Date.now();
      const timeDelta = currentTime - lastTime.current;
      
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = documentHeight > 0 ? (currentScrollY / documentHeight) * 100 : 0;
      
      const direction = currentScrollY > lastScrollY.current ? 'down' : 
                       currentScrollY < lastScrollY.current ? 'up' : null;
      
      const velocity = timeDelta > 0 ? Math.abs(currentScrollY - lastScrollY.current) / timeDelta : 0;

      setScrollState({
        scrollY: currentScrollY,
        scrollProgress: Math.min(100, Math.max(0, progress)),
        direction,
        velocity: Math.min(velocity, 5),
      });

      lastScrollY.current = currentScrollY;
      lastTime.current = currentTime;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [handleScroll]);

  return scrollState;
};

export default useScrollAnimation;
