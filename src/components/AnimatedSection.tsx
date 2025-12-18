import { ReactNode } from 'react';
import { useInView } from '@/hooks/useInView';
import { cn } from '@/lib/utils';

type AnimationType = 
  | 'fade-up' 
  | 'fade-down' 
  | 'fade-left' 
  | 'fade-right' 
  | 'scale' 
  | 'blur'
  | 'slide-up';

interface AnimatedSectionProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
  stagger?: boolean;
  staggerDelay?: number;
}

const animationClasses: Record<AnimationType, { initial: string; animate: string }> = {
  'fade-up': {
    initial: 'opacity-0 translate-y-12',
    animate: 'opacity-100 translate-y-0',
  },
  'fade-down': {
    initial: 'opacity-0 -translate-y-12',
    animate: 'opacity-100 translate-y-0',
  },
  'fade-left': {
    initial: 'opacity-0 translate-x-12',
    animate: 'opacity-100 translate-x-0',
  },
  'fade-right': {
    initial: 'opacity-0 -translate-x-12',
    animate: 'opacity-100 translate-x-0',
  },
  'scale': {
    initial: 'opacity-0 scale-90',
    animate: 'opacity-100 scale-100',
  },
  'blur': {
    initial: 'opacity-0 blur-sm',
    animate: 'opacity-100 blur-0',
  },
  'slide-up': {
    initial: 'opacity-0 translate-y-20',
    animate: 'opacity-100 translate-y-0',
  },
};

const AnimatedSection = ({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 700,
  className,
  threshold = 0.1,
}: AnimatedSectionProps) => {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold, triggerOnce: true });
  const { initial, animate } = animationClasses[animation];

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all ease-out',
        isInView ? animate : initial,
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;
