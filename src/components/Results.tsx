import { Trophy } from "lucide-react";

const Results = () => {
  const achievements = [
    {
      title: "Subcampeonato Estrellita",
      event: "Copa CETYS",
      icon: Trophy
    },
    {
      title: "Subcampeonato Estrellita",
      event: "Torneo Vicente Guerrero",
      icon: Trophy
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
              Nuestros
              <span className="block text-gold">Logros</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Celebrando el esfuerzo y dedicación de nuestros jugadores
            </p>
          </div>

          {/* Achievements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {achievements.map((achievement, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-primary to-primary/90 rounded-3xl p-8 text-center shadow-premium hover:scale-105 transition-transform duration-300"
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-gold/20 rounded-full flex items-center justify-center">
                  <achievement.icon className="w-10 h-10 text-gold" />
                </div>
                <h3 className="text-2xl font-bold text-primary-foreground mb-2">
                  {achievement.title}
                </h3>
                <p className="text-primary-foreground/80 text-lg">
                  {achievement.event}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom Message */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-3 bg-gold/10 rounded-full px-8 py-4 border border-gold/30">
              <Trophy className="w-6 h-6 text-gold" />
              <span className="text-lg font-semibold text-foreground">
                El verdadero logro es ver crecer a nuestros jugadores
              </span>
              <Trophy className="w-6 h-6 text-gold" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Results;