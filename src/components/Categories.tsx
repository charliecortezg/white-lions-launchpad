import { useState } from "react";
import { Clock, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import CategoryDetailsModal from "./modals/CategoryDetailsModal";
import AnimatedSection from "./AnimatedSection";

const Categories = () => {
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  const location = "Campo Hacienda del Bosque";
  const mapLink = "https://share.google/JWKOVbkRTJ8bDJaMU";

  const footballCategories = [
    {
      name: "Biberón",
      age: "4-5 años (2021-2022)",
      sport: "Fútbol",
      schedule: "Martes y Jueves, 7:30–8:30 PM",
      location,
      mapLink,
      spots: "Disponibles",
    },
    {
      name: "Escuelita",
      age: "6-7 años (2019-2020)",
      sport: "Fútbol",
      schedule: "Lunes y Miércoles, 7:30–9:00 PM",
      location,
      mapLink,
      spots: "Disponibles",
    },
    {
      name: "Estrellita",
      age: "8-9 años (2017-2018)",
      sport: "Fútbol",
      schedule: "Lunes y Miércoles, 7:30–9:00 PM",
      location,
      mapLink,
      spots: "Disponibles",
    },
    {
      name: "Infantil",
      age: "10-11 años (2015-2016)",
      sport: "Fútbol",
      schedule: "Lunes y Miércoles, 7:30–9:00 PM",
      location,
      mapLink,
      spots: "Disponibles",
    },
    {
      name: "Juvenil A",
      age: "12-13 años (2013-2014)",
      sport: "Fútbol",
      schedule: "Lunes y Miércoles, 7:30–9:00 PM",
      location,
      mapLink,
      spots: "Disponibles",
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection animation="fade-up" className="text-center mb-16">
            <div className="inline-block bg-gold/10 text-gold text-sm font-semibold px-4 py-2 rounded-full mb-4">
              Nuestras Categorías
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">
              Categorías por
              <span className="block text-gold">Edades</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Programas diseñados específicamente para cada etapa de desarrollo
            </p>
          </AnimatedSection>

          <div className="mb-4">
            <AnimatedSection animation="fade-right" delay={100}>
              <h3 className="text-3xl font-bold text-navy mb-6 flex items-center gap-3">
                <span>⚽</span> Fútbol
              </h3>
            </AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {footballCategories.map((category, index) => (
                <AnimatedSection
                  key={index}
                  animation="fade-up"
                  delay={150 + index * 80}
                >
                  <div className="bg-card border-2 border-gold/20 rounded-2xl p-6 hover:border-gold/50 transition-all duration-300 hover:shadow-gold h-full">
                    <h3 className="text-2xl font-bold text-navy mb-2">{category.name}</h3>
                    <div className="text-gold font-semibold mb-4">{category.age}</div>
                    <div className="space-y-3 mb-4">
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{category.schedule}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{category.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gold flex-shrink-0" />
                        <span className="text-sm text-green-600 font-semibold">{category.spots}</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => setSelectedCategory(category)}>
                      Ver detalles
                    </Button>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedCategory && (
        <CategoryDetailsModal
          open={!!selectedCategory}
          onOpenChange={(open) => !open && setSelectedCategory(null)}
          category={selectedCategory}
        />
      )}
    </section>
  );
};

export default Categories;
