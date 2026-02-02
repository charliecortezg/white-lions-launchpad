import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarCheck } from "lucide-react";
import trainingImage from "@/assets/training-facility.jpg";
import ChallengeRegistrationModal from "./ChallengeRegistrationModal";
import JoinFamilyModal from "./modals/JoinFamilyModal";
import AnimatedSection from "./AnimatedSection";

const CTASection = () => {
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        if (rect.top < windowHeight && rect.bottom > 0) {
          const progress = (windowHeight - rect.top) / (windowHeight + rect.height);
          setScrollY(progress * 50);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection animation="scale">
            <div className="relative rounded-3xl overflow-hidden shadow-premium">
              {/* Background Image with Parallax */}
              <div 
                className="absolute inset-0 z-0 will-change-transform"
                style={{
                  backgroundImage: `url(${trainingImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transform: `translateY(${scrollY}px)`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-navy/95 to-navy/80"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 p-8 md:p-16 text-center">
                <div className="max-w-3xl mx-auto space-y-8">
                  <AnimatedSection animation="fade-up" delay={100}>
                    <div className="inline-block bg-gold/10 backdrop-blur-sm text-gold text-sm font-semibold px-4 py-2 rounded-full">
                      Únete a Nosotros
                    </div>
                  </AnimatedSection>

                  <AnimatedSection animation="fade-up" delay={200}>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground">
                      Inicia Tu Historia
                      <span className="block text-gold">Con White Lions</span>
                    </h2>
                  </AnimatedSection>

                  <AnimatedSection animation="blur" delay={300}>
                    <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
                      Inscríbete al Reto White Lions de 30 días y descubre por qué somos la academia deportiva 
                      preferida de Mexicali. Kit de inicio incluido + garantía de satisfacción.
                    </p>
                  </AnimatedSection>

                  <AnimatedSection animation="fade-up" delay={400}>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                      <Button 
                        variant="gold" 
                        size="xl"
                        className="group"
                        onClick={() => setIsTrialModalOpen(true)}
                      >
                        <CalendarCheck className="w-5 h-5" />
                        🦁 Inscribirme al Reto
                        <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                      </Button>
                      
                      <Button 
                        variant="hero" 
                        size="xl"
                        onClick={() => setIsJoinModalOpen(true)}
                      >
                        Unirme a la Familia White Lions
                      </Button>
                    </div>
                  </AnimatedSection>

                  {/* Benefits */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
                    {[
                      { icon: '🎁', title: 'Kit Incluido', desc: 'Camiseta, calcetas, espinilleras y termo' },
                      { icon: '🛡️', title: 'Garantía Real', desc: 'Devolución si no ves resultados' },
                      { icon: '📈', title: '30 Días Completos', desc: 'Experiencia deportiva real' }
                    ].map((benefit, index) => (
                      <AnimatedSection key={index} animation="fade-up" delay={500 + index * 100}>
                        <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 border border-primary-foreground/20">
                          <div className="text-3xl mb-2">{benefit.icon}</div>
                          <h3 className="font-bold text-primary-foreground mb-2">{benefit.title}</h3>
                          <p className="text-primary-foreground/80 text-sm">{benefit.desc}</p>
                        </div>
                      </AnimatedSection>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>

      <ChallengeRegistrationModal open={isTrialModalOpen} onOpenChange={setIsTrialModalOpen} />
      <JoinFamilyModal open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen} />
    </section>
  );
};

export default CTASection;
