import Hero from "@/components/Hero";
import About from "@/components/About";
import Vision from "@/components/Vision";
import Methodology from "@/components/Methodology";
import Categories from "@/components/Categories";
import Testimonials from "@/components/Testimonials";
import Results from "@/components/Results";
import CTASection from "@/components/CTASection";
import Experience from "@/components/Experience";
import Coaches from "@/components/Coaches";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";

const Index = () => {
  return (
    <div className="min-h-screen">
      <ScrollProgress />
      <Hero />
      <About />
      <Methodology />
      <Categories />
      <Testimonials />
      <Coaches />
      <Results />
      <CTASection />
      <Vision />
      <Experience />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;
