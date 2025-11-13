import { Award, GraduationCap } from "lucide-react";
import coachImage from "@/assets/coach-portrait.jpg";

const Coaches = () => {
  const coaches = [
    {
      name: "Director Técnico",
      certifications: ["Barça Innovation Hub", "UEFA Pro License", "Coerver Advanced"],
      specialty: "Dirección Deportiva y Metodología"
    },
    {
      name: "Entrenador Principal",
      certifications: ["Barça Innovation Hub", "Coerver Coaching", "Licencia C"],
      specialty: "Desarrollo Técnico Juvenil"
    },
    {
      name: "Coordinador Formativo",
      certifications: ["Coerver Coaching", "Preparación Física", "Psicología Deportiva"],
      specialty: "Categorías Formativas"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block bg-gold/10 text-gold text-sm font-semibold px-4 py-2 rounded-full mb-4">
              Nuestro Equipo
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">
              Entrenadores
              <span className="block text-gold">Certificados</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Staff profesional con certificaciones internacionales y pasión por la formación deportiva
            </p>
          </div>

          {/* Hero Coach Image */}
          <div className="relative rounded-3xl overflow-hidden mb-12 shadow-premium max-w-4xl mx-auto">
            <img 
              src={coachImage} 
              alt="Entrenador certificado White Lions" 
              className="w-full h-[500px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/60 to-transparent flex items-end">
              <div className="p-8 w-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gold/20 backdrop-blur-sm rounded-full p-3">
                    <Award className="w-6 h-6 text-gold" />
                  </div>
                  <span className="text-primary-foreground/90 font-semibold">
                    Certificación Internacional
                  </span>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
                  Experiencia y Dedicación
                </h3>
                <p className="text-primary-foreground/90 text-lg">
                  Cada entrenador está comprometido con el desarrollo integral de nuestros jugadores
                </p>
              </div>
            </div>
          </div>

          {/* Coaches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {coaches.map((coach, index) => (
              <div 
                key={index}
                className="bg-card border border-border rounded-2xl p-6 hover:border-gold/50 transition-all duration-300 hover:shadow-gold"
              >
                <div className="bg-gold/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6 text-gold" />
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-3">{coach.name}</h3>
                
                <div className="space-y-2 mb-4">
                  {coach.certifications.map((cert, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold"></div>
                      <span className="text-sm text-muted-foreground">{cert}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-semibold text-gold">{coach.specialty}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Certifications Highlight */}
          <div className="bg-gradient-to-br from-primary to-primary/90 rounded-3xl p-8 md:p-12 shadow-premium">
            <div className="text-center">
              <Award className="w-16 h-16 text-gold mx-auto mb-6" />
              <h3 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Staff Altamente Calificado
              </h3>
              <p className="text-primary-foreground/90 text-lg max-w-3xl mx-auto mb-8">
                Todos nuestros entrenadores cuentan con certificaciones internacionales y actualizaciones 
                constantes en metodologías de formación deportiva
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4 border border-primary-foreground/20">
                  <div className="text-3xl font-bold text-gold mb-1">100%</div>
                  <div className="text-sm text-primary-foreground/80">Certificados</div>
                </div>
                <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4 border border-primary-foreground/20">
                  <div className="text-3xl font-bold text-gold mb-1">20+</div>
                  <div className="text-sm text-primary-foreground/80">Entrenadores</div>
                </div>
                <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4 border border-primary-foreground/20">
                  <div className="text-3xl font-bold text-gold mb-1">15+</div>
                  <div className="text-sm text-primary-foreground/80">Años Experiencia</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Coaches;
