import { useState, useEffect, useRef } from "react";
import { CheckCircle, Trophy, TrendingUp, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CertificationModal } from "./modals/CertificationModals";
import MethodologyModal from "./modals/MethodologyModal";
import AnimatedSection from "./AnimatedSection";

const Methodology = () => {
  const [selectedCertification, setSelectedCertification] = useState<'barca' | 'coerver' | 'whitelions' | 'fifa' | null>(null);
  const [isMethodologyModalOpen, setIsMethodologyModalOpen] = useState(false);

  const levels = [
    {
      name: "Leoncito",
      focus: "Introducción al deporte mediante el juego",
      icon: Trophy
    },
    {
      name: "Cazador",
      focus: "Desarrollo de habilidades básicas",
      icon: CheckCircle
    },
    {
      name: "Guerrero",
      focus: "Técnica individual y trabajo en equipo",
      icon: TrendingUp
    },
    {
      name: "Estratega",
      focus: "Táctica avanzada y toma de decisiones",
      icon: Award
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <AnimatedSection animation="fade-up" className="text-center mb-16">
            <div className="inline-block bg-gold/10 text-gold text-sm font-semibold px-4 py-2 rounded-full mb-4">
              Metodología Europea Certificada
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">
              Formación de
              <span className="block text-gold">Clase Mundial</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Nuestra formación deportiva está respaldada por las mejores certificaciones internacionales
            </p>
          </AnimatedSection>

          {/* Certification Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { key: 'barca', title: 'Barça Innovation Hub', desc: 'Metodología del FC Barcelona' },
              { key: 'coerver', title: 'Coerver Coaching', desc: 'Desarrollo de habilidades técnicas' },
              { key: 'whitelions', title: 'White Lions Methodology', desc: 'Sistema propio de niveles formativos' },
              { key: 'fifa', title: 'FIFA Grassroots', desc: 'Programa oficial de desarrollo de base' }
            ].map((cert, index) => (
              <AnimatedSection key={cert.key} animation="scale" delay={100 + index * 100}>
                <div 
                  className="bg-card rounded-2xl p-8 text-center border-2 border-gold/20 hover:border-gold/50 transition-all duration-300 shadow-lg hover:shadow-gold cursor-pointer h-full"
                  onClick={() => setSelectedCertification(cert.key as any)}
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gold/10 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-gold" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{cert.title}</h3>
                  <p className="text-sm text-muted-foreground">{cert.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Levels Section */}
          <AnimatedSection animation="fade-up" delay={200}>
            <div className="bg-gradient-to-br from-primary via-primary to-primary/90 rounded-3xl p-8 md:p-12 shadow-premium">
              <h3 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4 text-center">
                Sistema de Niveles White Lions
              </h3>
              <p className="text-center text-primary-foreground/90 mb-12 max-w-2xl mx-auto">
                Progresión estructurada que garantiza el desarrollo óptimo de cada jugador
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {levels.map((level, index) => (
                  <AnimatedSection key={index} animation="fade-up" delay={300 + index * 100}>
                    <div className="bg-primary-foreground rounded-2xl p-6 hover:scale-105 transition-transform duration-300 h-full">
                      <div className="bg-gold/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                        <level.icon className="w-6 h-6 text-gold" />
                      </div>
                      <h4 className="text-2xl font-bold text-primary mb-3">{level.name}</h4>
                      <p className="text-muted-foreground text-sm mb-4">{level.focus}</p>
                    </div>
                  </AnimatedSection>
                ))}
              </div>

              <div className="mt-12 text-center">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="bg-primary-foreground text-navy hover:bg-primary-foreground/90"
                  onClick={() => setIsMethodologyModalOpen(true)}
                >
                  Ver Sistema Completo de Niveles
                </Button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>

      {selectedCertification && (
        <CertificationModal 
          open={!!selectedCertification}
          onOpenChange={(open) => !open && setSelectedCertification(null)}
          type={selectedCertification}
        />
      )}

      <MethodologyModal open={isMethodologyModalOpen} onOpenChange={setIsMethodologyModalOpen} />
    </section>
  );
};

export default Methodology;
