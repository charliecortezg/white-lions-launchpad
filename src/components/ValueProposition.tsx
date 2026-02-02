import { Activity, Shield, Heart, Clock } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const ValueProposition = () => {
  const cards = [
    {
      icon: Clock,
      title: "Hábito en 30 Días",
      subtitle: "Compromiso",
      description: "No buscamos curiosos. Buscamos familias que entienden que el cambio requiere constancia. 30 días es el tiempo mínimo para crear un hábito.",
    },
    {
      icon: Activity,
      title: "Sistema Stryk",
      subtitle: "Transparencia",
      description: "Monitoreamos asistencia, actitud y progreso en cada sesión. Recibirás reportes reales, no suposiciones.",
    },
    {
      icon: Shield,
      title: "Garantía Real",
      subtitle: "Confianza",
      description: "Si no ves organización, te devolvemos tu inversión menos el kit. Así de seguros estamos de lo que ofrecemos.",
    },
    {
      icon: Heart,
      title: "Pertenencia",
      subtitle: "Comunidad",
      description: "Desde el día 1, tu hijo tiene su kit, su lugar en el grupo y su identidad como White Lion. No es un visitante, es parte de la familia.",
    },
  ];

  return (
    <section className="py-20 bg-background-alt">
      <div className="container mx-auto px-4">
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-display uppercase tracking-wide">
              ¿Por qué el Reto de 30 Días?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-body">
              Porque no creemos en "probar" el deporte. Creemos en vivirlo.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
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
                <p className="text-muted-foreground leading-relaxed font-body text-sm">
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
