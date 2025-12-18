import { Heart, Users, Sparkles, Target } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const Experience = () => {
  const pillars = [
    {
      icon: Heart,
      title: "Comunidad",
      description: "Creamos lazos que van más allá del deporte. Somos una familia donde cada miembro importa."
    },
    {
      icon: Users,
      title: "Familia",
      description: "Padres, jugadores y entrenadores trabajamos juntos en el desarrollo integral de cada niño."
    },
    {
      icon: Sparkles,
      title: "Crecimiento",
      description: "Acompañamos cada etapa del desarrollo deportivo y personal con dedicación y pasión."
    },
    {
      icon: Target,
      title: "Excelencia",
      description: "Buscamos siempre la mejor versión de cada jugador, dentro y fuera de la cancha."
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <AnimatedSection animation="fade-up" className="text-center mb-16">
            <div className="inline-block bg-gold/10 text-gold text-sm font-semibold px-4 py-2 rounded-full mb-4">
              White Lions Experience
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">
              Somos Más Que
              <span className="block text-gold">Un Equipo</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              White Lions Sports Experience es nuestra filosofía: crear experiencias deportivas 
              que transforman vidas y construyen una comunidad unida
            </p>
          </AnimatedSection>

          {/* Main Quote */}
          <AnimatedSection animation="scale" delay={100}>
            <div className="bg-gradient-to-br from-primary to-primary/90 rounded-3xl p-8 md:p-12 mb-12 shadow-premium">
              <blockquote className="text-2xl md:text-4xl font-light text-primary-foreground text-center italic leading-relaxed">
                "Aquí inicia tu mejor versión"
              </blockquote>
              <p className="text-center text-primary-foreground/80 mt-4 text-lg">
                No solo formamos jugadores excepcionales, formamos personas extraordinarias
              </p>
            </div>
          </AnimatedSection>

          {/* Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pillars.map((pillar, index) => (
              <AnimatedSection 
                key={index}
                animation={index % 2 === 0 ? "fade-right" : "fade-left"} 
                delay={150 + index * 100}
              >
                <div className="group bg-card border border-border rounded-2xl p-8 hover:border-gold/50 transition-all duration-300 hover:shadow-gold hover:-translate-y-1 h-full">
                  <div className="flex items-start gap-6">
                    <div className="bg-gold/10 w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <pillar.icon className="w-7 h-7 text-gold" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-3">{pillar.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{pillar.description}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Bottom Statement */}
          <AnimatedSection animation="fade-up" delay={500} className="mt-16 text-center">
            <div className="inline-flex items-center gap-3 bg-gold/10 rounded-full px-8 py-4 border border-gold/30">
              <Heart className="w-6 h-6 text-gold fill-gold" />
              <span className="text-lg font-semibold text-foreground">
                Somos más que un club, somos una familia
              </span>
              <Heart className="w-6 h-6 text-gold fill-gold" />
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default Experience;
