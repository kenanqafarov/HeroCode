import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import AboutSection from "@/components/landing/AboutSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import AIMentorSection from "@/components/landing/AIMentorSection";
import WhyChooseSection from "@/components/landing/WhyChooseSection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection  />
        <FeaturesSection />
        <AIMentorSection />
        <WhyChooseSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
