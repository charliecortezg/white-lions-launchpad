import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import logoWhiteLions from "@/assets/logo-white-lions.png";
import TrialClassModal from "./TrialClassModal";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { label: "Inicio", id: "hero" },
    { label: "Fútbol", id: "pricing" },
    { label: "Basketball", id: "pricing" },
    { label: "Ubicaciones", id: "ubicaciones" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-primary/95 backdrop-blur-md shadow-lg py-3"
            : "bg-transparent py-4"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button
              onClick={() => scrollToSection("hero")}
              className="flex items-center gap-2"
            >
              <img
                src={logoWhiteLions}
                alt="White Lions"
                className="h-10 md:h-12 w-auto"
              />
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.id + link.label}
                  onClick={() => scrollToSection(link.id)}
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm font-medium"
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden md:block">
              <Button
                variant="gold"
                size="lg"
                onClick={() => setIsModalOpen(true)}
                className="font-bold"
              >
                🦁 APLICAR AL RETO
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-primary-foreground p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-primary/95 backdrop-blur-md border-t border-primary-foreground/10">
              <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <button
                    key={link.id + link.label}
                    onClick={() => scrollToSection(link.id)}
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-left py-2 text-sm font-medium"
                  >
                    {link.label}
                  </button>
                ))}
                <Button
                  variant="gold"
                  size="lg"
                  onClick={() => {
                    setIsModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full font-bold mt-2"
                >
                  🦁 APLICAR AL RETO
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <TrialClassModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
};

export default Navbar;
