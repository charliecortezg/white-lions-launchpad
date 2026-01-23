import { MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedSection from "./AnimatedSection";

const Locations = () => {
  const locations = [
    {
      sport: "Fútbol",
      emoji: "⚽",
      name: "Hacienda del Bosque",
      address: "Campo Hacienda del Bosque, Mexicali, B.C.",
      mapUrl: "https://maps.google.com/?q=Hacienda+del+Bosque+Mexicali",
      embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3358.1234567890123!2d-115.4234567!3d32.6234567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzLCsDM3JzI0LjUiTiAxMTXCsDI1JzI0LjUiVw!5e0!3m2!1ses!2smx!4v1234567890123!5m2!1ses!2smx",
    },
    {
      sport: "Basketball",
      emoji: "🏀",
      name: "Parque Quinta del Rey III",
      address: "Parque Quinta del Rey III, Mexicali, B.C.",
      mapUrl: "https://maps.google.com/?q=Parque+Quinta+del+Rey+III+Mexicali",
      embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3358.1234567890123!2d-115.4234567!3d32.6234567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzLCsDM3JzI0LjUiTiAxMTXCsDI1JzI0LjUiVw!5e0!3m2!1ses!2smx!4v1234567890123!5m2!1ses!2smx",
    },
  ];

  return (
    <section id="ubicaciones" className="py-20 bg-background-alt">
      <div className="container mx-auto px-4">
        <AnimatedSection animation="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12 font-display uppercase tracking-wide">
            Nuestras Sedes
          </h2>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {locations.map((location, index) => (
            <AnimatedSection key={index} animation="fade-up" delay={index * 100}>
              <div className="bento-card overflow-hidden p-0">
                {/* Map Embed */}
                <div className="aspect-video bg-card relative">
                  <iframe
                    src={location.embedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Mapa ${location.name}`}
                    className="absolute inset-0"
                  />
                </div>

                {/* Info */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{location.emoji}</span>
                    <div>
                      <h3 className="text-xl font-bold text-foreground font-display uppercase">{location.sport}</h3>
                      <p className="text-muted-foreground text-sm font-body">{location.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-muted-foreground text-sm mb-4 font-body">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{location.address}</span>
                  </div>

                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full"
                    onClick={() => window.open(location.mapUrl, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Cómo llegar
                  </Button>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Locations;