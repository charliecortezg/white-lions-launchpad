import { Facebook, Instagram, Mail, MapPin, Phone, Video } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="space-y-4">
              <h3 className="text-3xl font-bold">
                White Lions
                <span className="block text-gold text-2xl">Academies</span>
              </h3>
              <p className="text-primary-foreground/80">
                Tu mejor versión inicia aquí. Formando personas antes que jugadores.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-4 text-gold">Enlaces Rápidos</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#metodologia" className="text-primary-foreground/80 hover:text-gold transition-colors">
                    Metodología
                  </a>
                </li>
                <li>
                  <a href="#categorias" className="text-primary-foreground/80 hover:text-gold transition-colors">
                    Categorías
                  </a>
                </li>
                <li>
                  <a href="#entrenadores" className="text-primary-foreground/80 hover:text-gold transition-colors">
                    Entrenadores
                  </a>
                </li>
                <li>
                  <a href="#testimonios" className="text-primary-foreground/80 hover:text-gold transition-colors">
                    Testimonios
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-bold mb-4 text-gold">Contacto</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                  <span className="text-primary-foreground/80 text-sm">
                    Mexicali, Baja California
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                  <a href="tel:+526867221036" className="text-primary-foreground/80 text-sm hover:text-gold transition-colors">
                    +52 686 722 1036
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                  <a href="mailto:whitelions.admn@gmail.com" className="text-primary-foreground/80 text-sm hover:text-gold transition-colors">
                    whitelions.admn@gmail.com
                  </a>
                </li>
              </ul>
            </div>

            {/* Social & Hours */}
            <div>
              <h4 className="text-lg font-bold mb-4 text-gold">Síguenos</h4>
              <div className="flex gap-4 mb-6">
                <a 
                  href="https://www.facebook.com/profile.php?id=61569959826644" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-primary-foreground/10 hover:bg-gold/20 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.instagram.com/whitelions.fc/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-primary-foreground/10 hover:bg-gold/20 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.tiktok.com/@whitelionsfc" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-primary-foreground/10 hover:bg-gold/20 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                >
                  <Video className="w-5 h-5" />
                </a>
              </div>
              <div>
                <h5 className="font-semibold mb-2">Horarios</h5>
                <p className="text-primary-foreground/80 text-sm">
                  Lun - Vie: 3:00 PM - 8:00 PM
                  <br />
                  Sábado: 8:00 AM - 2:00 PM
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-primary-foreground/60 text-sm">
              © {new Date().getFullYear()} White Lions Academies. Todos los derechos reservados.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="/privacidad" className="text-primary-foreground/60 hover:text-gold transition-colors">
                Privacidad
              </a>
              <a href="/terminos" className="text-primary-foreground/60 hover:text-gold transition-colors">
                Términos
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
