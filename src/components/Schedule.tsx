import { Clock, MapPin } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const Schedule = () => {
  return (
    <section id="horarios" className="py-20 bg-background-alt">
      <div className="container mx-auto px-4">
        <AnimatedSection animation="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4 font-display uppercase tracking-wide">
            Horarios de Entrenamiento
          </h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto font-body">
            Días y horarios fijos para cada categoría.
          </p>
        </AnimatedSection>

        <div className="max-w-3xl mx-auto space-y-6">

          <AnimatedSection animation="fade-up" className="w-full">
            <div className="bento-card overflow-hidden p-0">
              <div className="bg-primary/20 p-6 text-center border-b border-border">
                <span className="text-4xl mb-2 block">⚽</span>
                <h3 className="text-2xl font-bold text-foreground font-display uppercase">Fútbol</h3>
                <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm mt-2 font-body">
                  <MapPin className="w-4 h-4" />
                  Campo Hacienda del Bosque
                </div>
              </div>

              <div className="p-6 overflow-x-auto">
                <table className="w-full min-w-[520px]">
                  <thead>
                    <tr className="text-left text-sm text-muted-foreground font-body">
                      <th className="pb-3 font-medium">Categoría</th>
                      <th className="pb-3 font-medium">Días</th>
                      <th className="pb-3 font-medium">Horario</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border">
                      <td className="py-4">
                        <span className="font-medium text-foreground font-body">Biberón 🍼</span>
                        <span className="block text-xs text-muted-foreground mt-1 font-body">4–5 años</span>
                      </td>
                      <td className="py-4">
                        <span className="font-medium text-foreground font-body">Martes y Jueves</span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2 text-foreground font-body">
                          <Clock className="w-4 h-4 text-primary" />
                          7:30 – 9:00 PM
                        </div>
                      </td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="py-4">
                        <span className="font-medium text-foreground font-body">Escuelita, Estrellita, Infantil, Juvenil A</span>
                        <span className="block text-xs text-muted-foreground mt-1 font-body">6–13 años</span>
                      </td>
                      <td className="py-4">
                        <span className="font-medium text-foreground font-body">Lunes y Miércoles</span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2 text-foreground font-body">
                          <Clock className="w-4 h-4 text-primary" />
                          7:30 – 8:30 PM
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </AnimatedSection>

          <p className="text-center text-sm text-muted-foreground font-body">
            Nuevo ciclo deportivo: inicia la semana del <strong>3 de agosto de 2026</strong>.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Schedule;
