import Navbar from "@/components/Navbar";
import HeroNew from "@/components/HeroNew";
import ProblemSection from "@/components/ProblemSection";
import ClientFilter from "@/components/ClientFilter";
import ValueProposition from "@/components/ValueProposition";
import ChallengeOffer from "@/components/ChallengeOffer";
import MonthlyPlansSection from "@/components/MonthlyPlansSection";
import Schedule from "@/components/Schedule";
import Director from "@/components/Director";
import Locations from "@/components/Locations";
import FAQNew from "@/components/FAQNew";
import FooterNew from "@/components/FooterNew";
import ScrollProgress from "@/components/ScrollProgress";

const Index = () => {
  return (
    <div className="min-h-screen">
      <ScrollProgress />
      <Navbar />
      <HeroNew />
      <ProblemSection />
      <ClientFilter />
      <ValueProposition />
      <ChallengeOffer />
      <MonthlyPlansSection />
      <Schedule />
      <Director />
      <Locations />
      <FAQNew />
      <FooterNew />
    </div>
  );
};

export default Index;
