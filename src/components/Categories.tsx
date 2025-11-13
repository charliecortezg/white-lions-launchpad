import { Clock, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const Categories = () => {
  const categories = [
    {
      name: "Biberón",
      age: "3-4 años",
      schedule: "Martes y Jueves 4:00 PM",
      location: "Cancha Principal",
      spots: "12 jugadores"
    },
    {
      name: "Escuelita",
      age: "5-6 años",
      schedule: "Lunes, Miércoles y Viernes 4:00 PM",
      location: "Cancha Principal",
      spots: "15 jugadores"
    },
    {
      name: "Estrellita",
      age: "7-8 años",
      schedule: "Lunes, Miércoles y Viernes 5:00 PM",
      location: "Cancha Principal",
      spots: "18 jugadores"
    },
    {
      name: "Infantil",
      age: "9-11 años",
      schedule: "Martes, Jueves y Sábado 5:00 PM",
      location: "Complejo Deportivo",
      spots: "20 jugadores"
    },
    {
      name: "Juvenil A",
      age: "12-13 años",
      schedule: "Martes, Jueves y Sábado 6:00 PM",
      location: "Complejo Deportivo",
      spots: "20 jugadores"
    },
    {
      name: "Juvenil B",
      age: "14-15 años",
      schedule: "Lunes, Miércoles y Viernes 6:00 PM",
      location: "Complejo Deportivo",
      spots: "20 jugadores"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block bg-gold/10 text-gold text-sm font-semibold px-4 py-2 rounded-full mb-4">
              Nuestras Categorías
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">
              Categorías por Edades
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Programas diseñados específicamente para cada etapa del desarrollo deportivo
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {categories.map((category, index) => (
              <div 
                key={index}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-gold transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-primary">{category.name}</h3>
                    <div className="inline-block bg-gold/10 text-gold text-sm font-semibold px-3 py-1 rounded-full mt-2">
                      {category.age}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">{category.schedule}</span>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">{category.location}</span>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">{category.spots}</span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full mt-6 border-gold/30 hover:bg-gold/10 hover:border-gold"
                >
                  Ver Horarios Completos
                </Button>
              </div>
            ))}
          </div>

          {/* Sports Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
            <div className="bg-gradient-to-br from-primary to-primary/90 rounded-3xl p-8 text-center shadow-premium">
              <div className="text-6xl mb-4">⚽</div>
              <h3 className="text-3xl font-bold text-primary-foreground mb-3">Fútbol</h3>
              <p className="text-primary-foreground/90">
                Formación integral con metodología Barça Innovation Hub y Coerver
              </p>
            </div>

            <div className="bg-gradient-to-br from-gold to-gold/90 rounded-3xl p-8 text-center shadow-gold">
              <div className="text-6xl mb-4">🏀</div>
              <h3 className="text-3xl font-bold text-navy mb-3">Basketball</h3>
              <p className="text-navy/90">
                Desarrollo técnico y táctico con entrenadores certificados
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Categories;
