import { Clock, MapPin } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const Schedule = () => {
  const schedules = [
    {
      sport: "Fútbol",
      emoji: "⚽",
      location: "Hacienda del Bosque",
      sessions: [
        { days: "Lunes y Miércoles", time: "6:00 PM – 7:30 PM", category: "Todas las categorías" },
      ],
    },
    {
      sport: "Basketball",
      emoji: "🏀",
      location: "Parque Quinta del Rey III",
      sessions: [
        { days: "Martes y Jueves", time: "6:30 PM – 8:00 PM", category: "Todas las categorías" },
      ],
    },
  ];

  return (
    <section id="horarios" className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <AnimatedSection animation="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
            Entrenamos cuando tú puedes.
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Horarios diseñados para familias con agenda ocupada.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {schedules.map((schedule, index) => (
            <AnimatedSection key={index} animation="fade-up" delay={index * 100}>
              <div className="bg-card rounded-2xl overflow-hidden shadow-lg border border-border">
                {/* Header */}
                <div className="bg-primary p-6 text-center">
                  <span className="text-4xl mb-2 block">{schedule.emoji}</span>
                  <h3 className="text-2xl font-bold text-primary-foreground">{schedule.sport}</h3>
                  <div className="flex items-center justify-center gap-1 text-primary-foreground/80 text-sm mt-2">
                    <MapPin className="w-4 h-4" />
                    {schedule.location}
                  </div>
                </div>

                {/* Schedule Table */}
                <div className="p-6">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-muted-foreground">
                        <th className="pb-3 font-medium">Días</th>
                        <th className="pb-3 font-medium">Horario</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedule.sessions.map((session, idx) => (
                        <tr key={idx} className="border-t border-border">
                          <td className="py-4">
                            <span className="font-medium text-foreground">{session.days}</span>
                            <span className="block text-xs text-muted-foreground mt-1">{session.category}</span>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2 text-foreground">
                              <Clock className="w-4 h-4 text-accent" />
                              {session.time}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Schedule;
