import { Heart, Users, Award, Target } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Alegría",
      description: "El deporte debe ser divertido y motivador"
    },
    {
      icon: Users,
      title: "Respeto",
      description: "Valores fundamentales dentro y fuera de la cancha"
    },
    {
      icon: Award,
      title: "Unidad",
      description: "Formamos una familia, no solo un equipo"
    },
    {
      icon: Target,
      title: "Disciplina",
      description: "La base del crecimiento personal y deportivo"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-block bg-gold/10 text-gold text-sm font-semibold px-4 py-2 rounded-full mb-4">
              Quiénes Somos
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">
              White Lions Academies
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Somos más que un club deportivo. Somos un ecosistema formativo que combina la pasión 
              por el fútbol y basketball con una metodología europea certificada.
            </p>
          </div>

          {/* Mission */}
          <div className="bg-gradient-to-br from-primary to-primary/90 rounded-3xl p-8 md:p-12 mb-12 text-center shadow-premium animate-slide-up">
            <h3 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
              Nuestra Misión
            </h3>
            <p className="text-lg text-primary-foreground/90 max-w-3xl mx-auto">
              Formar personas antes que jugadores. Desarrollamos habilidades deportivas de clase mundial 
              mientras inculcamos valores que trascienden el campo de juego.
            </p>
          </div>

          {/* Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div 
                key={index}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-gold transition-all duration-300 hover:-translate-y-1 animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-gold/10 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  <value.icon className="w-7 h-7 text-gold" />
                </div>
                <h4 className="text-xl font-bold text-foreground mb-2">{value.title}</h4>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>

          {/* Quote */}
          <div className="mt-16 text-center">
            <blockquote className="text-2xl md:text-3xl font-light text-primary italic">
              "Jugamos para formar personas"
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
