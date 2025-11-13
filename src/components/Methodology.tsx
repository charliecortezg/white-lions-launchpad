import { CheckCircle, Trophy, TrendingUp } from "lucide-react";

const Methodology = () => {
  const certifications = [
    {
      name: "Barça Innovation Hub",
      description: "Metodología de formación del FC Barcelona"
    },
    {
      name: "Coerver Coaching",
      description: "Sistema de desarrollo de habilidades técnicas"
    },
    {
      name: "White Lions Methodology",
      description: "Sistema propio de niveles formativos"
    }
  ];

  const levels = [
    {
      name: "Leoncito",
      age: "4-5 años",
      focus: "Introducción al deporte mediante el juego",
      icon: Trophy
    },
    {
      name: "Cazador",
      age: "6-8 años",
      focus: "Desarrollo de habilidades básicas",
      icon: CheckCircle
    },
    {
      name: "Guerrero",
      age: "9-11 años",
      focus: "Técnica individual y trabajo en equipo",
      icon: TrendingUp
    },
    {
      name: "Estratega",
      age: "12-14 años",
      focus: "Táctica avanzada y toma de decisiones",
      icon: Trophy
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block bg-gold/10 text-gold text-sm font-semibold px-4 py-2 rounded-full mb-4">
              Metodología Certificada
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">
              Metodología Europea
              <span className="block text-gold">Certificada</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Nuestra formación deportiva está respaldada por las mejores certificaciones internacionales
            </p>
          </div>

          {/* Certifications */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {certifications.map((cert, index) => (
              <div 
                key={index}
                className="bg-card rounded-2xl p-8 text-center border-2 border-gold/20 hover:border-gold/50 transition-all duration-300 shadow-lg hover:shadow-gold"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gold/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-gold" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{cert.name}</h3>
                <p className="text-muted-foreground">{cert.description}</p>
              </div>
            ))}
          </div>

          {/* Levels Section */}
          <div className="bg-gradient-to-br from-primary via-primary to-primary/90 rounded-3xl p-8 md:p-12 shadow-premium">
            <h3 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4 text-center">
              Niveles Formativos White Lions
            </h3>
            <p className="text-center text-primary-foreground/90 mb-12 max-w-2xl mx-auto">
              Progresión estructurada que garantiza el desarrollo óptimo de cada jugador
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {levels.map((level, index) => (
                <div 
                  key={index}
                  className="bg-primary-foreground rounded-2xl p-6 hover:scale-105 transition-transform duration-300"
                >
                  <div className="bg-gold/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <level.icon className="w-6 h-6 text-gold" />
                  </div>
                  <h4 className="text-2xl font-bold text-primary mb-1">{level.name}</h4>
                  <div className="text-gold font-semibold mb-3">{level.age}</div>
                  <p className="text-muted-foreground text-sm">{level.focus}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-primary-foreground/80 text-lg">
                Cada nivel está diseñado para maximizar el potencial de nuestros jugadores
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Methodology;
