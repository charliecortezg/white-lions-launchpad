import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const ScrollProgress = () => {
  const { scrollProgress } = useScrollAnimation();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-navy/20">
      <div 
        className="h-full bg-gradient-to-r from-gold via-gold/80 to-gold transition-all duration-150 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
};

export default ScrollProgress;
