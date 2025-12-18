import { useState } from "react";
import { Clock, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import CategoryDetailsModal from "./modals/CategoryDetailsModal";
import AnimatedSection from "./AnimatedSection";

const Categories = () => {
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  const footballCategories = [
    {
      name: "Escuelita",
      age: "6-7 años (2018-2019)",
      sport: "Fútbol",
      schedule: "Lunes y miércoles, 6:00–8:00 pm",
      location: "Campo Hacienda del Bosque",
      mapLink: "https://maps.app.goo.gl/fxARNWmBn1RixYPZV",
      spots: "Disponibles"
    },
    {
      name: "Estrellita",
      age: "8-9 años (2016-2017)",
      sport: "Fútbol",
      schedule: "Lunes y miércoles, 6:00–8:00 pm",
      location: "Campo Hacienda del Bosque",
      mapLink: "https://maps.app.goo.gl/fxARNWmBn1RixYPZV",
      spots: "Disponibles"
    },
    {
      name: "Infantil",
      age: "10-11 años (2014-2015)",
      sport: "Fútbol",
      schedule: "Lunes y miércoles, 6:00–8:00 pm",
      location: "Campo Hacienda del Bosque",
      mapLink: "https://maps.app.goo.gl/fxARNWmBn1RixYPZV",
      spots: "Disponibles"
    },
    {
      name: "Juvenil A",
      age: "12-13 años (2012-2013)",
      sport: "Fútbol",
      schedule: "Lunes y miércoles, 6:00–8:00 pm",
      location: "Campo Hacienda del Bosque",
      mapLink: "https://maps.app.goo.gl/fxARNWmBn1RixYPZV",
      spots: "Disponibles"
    },
    {
      name: "Juvenil B",
      age: "14-15 años (2010-2011)",
      sport: "Fútbol",
      schedule: "Lunes y miércoles, 6:00–8:00 pm",
      location: "Campo Hacienda del Bosque",
      mapLink: "https://maps.app.goo.gl/fxARNWmBn1RixYPZV",
      spots: "Disponibles"
    }
  ];

  const basketballCategories = [
    {
      name: "Estrellita",
      age: "8-9 años (2016-2017)",
      sport: "Basketball",
      schedule: "Martes y jueves, 6:30–8:00 pm",
      location: "Parque Quinta del Rey III",
      mapLink: "https://maps.app.goo.gl/NRWYDi000BtXGXM8u",
      spots: "Disponibles"
    },
    {
      name: "Infantil",
      age: "10-11 años (2014-2015)",
      sport: "Basketball",
      schedule: "Martes y jueves, 6:30–8:00 pm",
      location: "Parque Quinta del Rey III",
      mapLink: "https://maps.app.goo.gl/NRWYDi000BtXGXM8u",
      spots: "Disponibles"
    }
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

          <div className="mb-12">
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
                      Ver Horarios Completos
                    </Button>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>

          <div>
            <AnimatedSection animation="fade-right" delay={100}>
              <h3 className="text-3xl font-bold text-navy mb-6 flex items-center gap-3">
                <span>🏀</span> Basketball
              </h3>
            </AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {basketballCategories.map((category, index) => (
                <AnimatedSection 
                  key={index}
                  animation="fade-up" 
                  delay={150 + index * 100}
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
                      Ver Horarios Completos
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
