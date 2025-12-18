import { Award, Users, Trophy } from "lucide-react";
import coachImage from "@/assets/coach-portrait.jpg";
import AnimatedSection from "./AnimatedSection";
import { useInView } from "@/hooks/useInView";
import { useState, useEffect } from "react";

const CountUpNumber = ({ end, suffix = "", duration = 2000 }: { end: number; suffix?: string; duration?: number }) => {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.5, triggerOnce: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return <div ref={ref}>{count}{suffix}</div>;
};

const Coaches = () => {
  const coaches = [
    {
      name: "Carlos Cortez",
      role: "Director Deportivo / Coach Basketball",
      certifications: ["Introducción al Deporte – Barça Innovation Hub", "Certificado Profesional Dirección Deportiva – Barça Innovation Hub", "FIFA Coach Academy", "Barça Coach Academy Nivel I", "NBA Coach Academy"],
      specialty: "Coach de Estrellita e Infantil Basketball. Encargado de administración y gestión deportiva"
    },
    {
      name: "Jaime Estrella",
      role: "Entrenador",
      certifications: ["Lic. Actividad Física y Deporte", "White Lions Coach Academy", "FIFA Coach Academy", "Barça Coach Academy Nivel I"],
      specialty: "Entrenador de Fútbol Estrellita e Infantil"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection animation="fade-up" className="text-center mb-16">
            <div className="inline-block bg-gold/10 text-gold text-sm font-semibold px-4 py-2 rounded-full mb-4">Nuestro Equipo</div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">Staff de Élite<span className="block text-gold">Certificado</span></h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Staff altamente certificado con más de 10 años de experiencia combinada</p>
          </AnimatedSection>

          <AnimatedSection animation="scale" delay={100}>
            <div className="relative rounded-3xl overflow-hidden mb-12 shadow-premium">
              <img src={coachImage} alt="Entrenador White Lions" className="w-full h-[400px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/50 to-transparent flex items-end">
                <div className="p-8 w-full">
                  <h3 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">Liderazgo Profesional</h3>
                  <p className="text-primary-foreground/90 text-lg">Entrenadores certificados por las mejores instituciones deportivas del mundo</p>
                </div>
              </div>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {coaches.map((coach, index) => (
              <AnimatedSection key={index} animation={index === 0 ? "fade-right" : "fade-left"} delay={150 + index * 100}>
                <div className="bg-card border-2 border-gold/20 rounded-2xl p-8 hover:border-gold/50 transition-all duration-300 hover:shadow-gold h-full">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gold/10 w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"><Award className="w-8 h-8 text-gold" /></div>
                    <div>
                      <h3 className="text-2xl font-bold text-navy mb-1">{coach.name}</h3>
                      <p className="text-gold font-semibold">{coach.role}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-foreground mb-2 flex items-center gap-2"><Trophy className="w-4 h-4 text-gold" />Certificaciones</h4>
                      <ul className="space-y-1">
                        {coach.certifications.map((cert, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2"><span className="text-gold mt-1">•</span>{cert}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Especialidad: </span>{coach.specialty}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection animation="scale" delay={300}>
            <div className="bg-gradient-to-br from-primary to-primary/90 rounded-3xl p-8 md:p-12 shadow-premium">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="bg-primary-foreground/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Award className="w-8 h-8 text-gold" /></div>
                  <div className="text-4xl font-bold text-gold mb-2">
                    <CountUpNumber end={100} suffix="%" />
                  </div>
                  <div className="text-primary-foreground/80">Certificados Internacionalmente</div>
                </div>
                <div>
                  <div className="bg-primary-foreground/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Users className="w-8 h-8 text-gold" /></div>
                  <div className="text-4xl font-bold text-gold mb-2">
                    <CountUpNumber end={10} suffix="+" />
                  </div>
                  <div className="text-primary-foreground/80">Años de Experiencia Combinada</div>
                </div>
                <div>
                  <div className="bg-primary-foreground/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Trophy className="w-8 h-8 text-gold" /></div>
                  <div className="text-4xl font-bold text-gold mb-2">
                    <CountUpNumber end={500} suffix="+" />
                  </div>
                  <div className="text-primary-foreground/80">Jugadores Formados</div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default Coaches;
