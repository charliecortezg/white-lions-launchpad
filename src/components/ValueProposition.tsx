import { Activity, Shield, BadgeCheck } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const ValueProposition = () => {
  const cards = [
    {
      icon: Activity,
      title: "Tecnología Stryk",
      subtitle: "Transparencia",
      description: "No adivinamos. Medimos. Monitoreamos asistencia y actitud en cada sesión. Feedback real, no suposiciones.",
    },
    {
      icon: Shield,
      title: "Ambiente Formativo",
      subtitle: "Seguridad",
      description: "Disciplina sin gritos. Entrenadores que desarrollan carácter, no miedo.",
    },
    {
      icon: BadgeCheck,
      title: "Garantía",
      subtitle: "Cero Riesgo",
      description: "Reto de 30 Días. Si no ves organización, te devolvemos tu mensualidad.",
    },
  ];

  return (
    <section className="py-20 bg-background-alt">
      <div className="container mx-auto px-4">
        <AnimatedSection animation="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12 font-display uppercase tracking-wide">
            ¿Por qué elegir White Lions?
          </h2>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {cards.map((card, index) => (
            <AnimatedSection key={index} animation="fade-up" delay={index * 100}>
              <div className="bento-card h-full text-center">
                {/* Icon - Large and Gold */}
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <card.icon className="w-8 h-8 text-primary" />
                </div>
                
                {/* Subtitle */}
                <p className="text-sm font-medium text-primary uppercase tracking-widest mb-2 font-body">
                  {card.subtitle}
                </p>
                
                {/* Title - Oswald */}
                <h3 className="text-xl font-bold text-foreground mb-4 font-display uppercase">
                  {card.title}
                </h3>
                
                {/* Description */}
                <p className="text-muted-foreground leading-relaxed font-body">
                  {card.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;