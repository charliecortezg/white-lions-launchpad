import { useState, useEffect, useRef, useCallback } from 'react';

interface ParallaxOptions {
  speed?: number;
  direction?: 'vertical' | 'horizontal';
  easing?: boolean;
}

export const useParallax = (options: ParallaxOptions = {}) => {
  const { speed = 0.5, direction = 'vertical', easing = true } = options;
  const [offset, setOffset] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number>();
  const currentOffset = useRef(0);
  const targetOffset = useRef(0);

  const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
  };

  const animate = useCallback(() => {
    if (easing) {
      currentOffset.current = lerp(currentOffset.current, targetOffset.current, 0.1);
      if (Math.abs(currentOffset.current - targetOffset.current) > 0.01) {
        setOffset(currentOffset.current);
        rafId.current = requestAnimationFrame(animate);
      } else {
        setOffset(targetOffset.current);
      }
    }
  }, [easing]);

  const handleScroll = useCallback(() => {
    if (!elementRef.current) return;

    const rect = elementRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate how far into the viewport the element is
    const elementCenter = rect.top + rect.height / 2;
    const viewportCenter = windowHeight / 2;
    const distanceFromCenter = elementCenter - viewportCenter;
    
    // Apply parallax based on distance from center
    const newOffset = distanceFromCenter * speed * -0.1;
    
    if (easing) {
      targetOffset.current = newOffset;
      if (!rafId.current) {
        rafId.current = requestAnimationFrame(animate);
      }
    } else {
      setOffset(newOffset);
    }
  }, [speed, easing, animate]);

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

  const style = {
    transform: direction === 'vertical' 
      ? `translateY(${offset}px)` 
      : `translateX(${offset}px)`,
    willChange: 'transform',
  };

  return { ref: elementRef, style, offset };
};

export default useParallax;
