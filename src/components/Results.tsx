import trophyImage from "@/assets/trophy-celebration.jpg";
import { Trophy, Medal, Target } from "lucide-react";

const Results = () => {
  const achievements = [
    {
      icon: Trophy,
      title: "Subcampeonato – Copa CETYS",
      year: "2024",
      category: "Categoría Estrellita"
    },
    {
      icon: Medal,
      title: "Subcampeonato – Torneo Vicente Guerrero",
      year: "2024",
      category: "Categoría Estrellita"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block bg-gold/10 text-gold text-sm font-semibold px-4 py-2 rounded-full mb-4">
              Logros Deportivos
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">
              Resultados que
              <span className="block text-gold">Nos Enorgullecen</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Nuestro trabajo y dedicación se reflejan en cada victoria de nuestros jugadores
            </p>
          </div>

          {/* Main Image */}
          <div className="relative rounded-3xl overflow-hidden mb-12 shadow-premium">
            <img 
              src={trophyImage} 
              alt="Celebración de campeonato White Lions" 
              className="w-full h-[500px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/50 to-transparent flex items-end">
              <div className="p-8 text-center w-full">
                <h3 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
                  Formando Campeones
                </h3>
                <p className="text-primary-foreground/90 text-lg">
                  Cada trofeo representa horas de dedicación, esfuerzo y pasión
                </p>
              </div>
            </div>
          </div>

          {/* Achievements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {achievements.map((achievement, index) => (
              <div 
                key={index}
                className="bg-card border border-gold/20 rounded-2xl p-8 text-center hover:border-gold/50 transition-all duration-300 hover:shadow-gold"
              >
                <div className="bg-gold/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <achievement.icon className="w-8 h-8 text-gold" />
                </div>
                <div className="text-sm text-gold font-semibold mb-2">{achievement.year}</div>
                <h3 className="text-xl font-bold text-foreground mb-2">{achievement.title}</h3>
                <div className="text-muted-foreground">{achievement.category}</div>
              </div>
            ))}
          </div>

          {/* Quote */}
          <div className="mt-16 bg-gradient-to-br from-primary to-primary/90 rounded-3xl p-8 md:p-12 text-center shadow-premium">
            <blockquote className="text-2xl md:text-3xl font-light text-primary-foreground italic mb-4">
              "El éxito no se mide solo en trofeos, sino en el crecimiento personal de cada jugador"
            </blockquote>
            <p className="text-primary-foreground/80">- Filosofía White Lions</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Results;
