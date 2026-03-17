import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, BookOpen, Award } from "lucide-react";
import heroBg from "@/assets/hero-dungeon.jpg";
import { useNavigate } from 'react-router-dom';
import { checkAndNavigate } from '@/utils/authCheck';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen mt-[80px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt="Zindan fonu"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-background/50" />
      </div>

      {/* Floating Code Particles */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-primary/30 font-mono text-sm"
            initial={{ opacity: 0, y: 100 }}
            animate={{
              opacity: [0.2, 0.5, 0.2],
              y: [-20, -100],
              x: [0, (i % 2 === 0 ? 20 : -20)],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              delay: i * 1.5,
            }}
            style={{
              left: `${15 + i * 15}%`,
              top: `${60 + (i % 3) * 10}%`,
            }}
          >
            {["{ }", "( )", "< />", "=>", "[ ]", "//"][i]}
          </motion.div>
        ))}
      </div>

      {/* SDG 4 Badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute top-20 sm:top-6 right-3 sm:right-6 z-20 flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-card/80 backdrop-blur-sm border border-border"
      >
        <Award className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
        <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">SDG 4: Keyfiyyətli Təhsil</span>
      </motion.div>

      {/* Hero Content */}
      <div className="relative z-20 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
   

          <h1 className="font-display font-black text-3xl xs:text-4xl sm:text-5xl md:text-7xl lg:text-8xl mb-4 sm:mb-6 leading-tight mt-[-60px]">
            <span className="text-foreground ">HeroCode:</span>
            <br />
            <span className="gradient-text-green text-glow sm:text-[90px]">Məntiqi </span>
            <span className="gradient-text-purple text-glow-purple sm:text-[90px]">Zindan</span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-4 sm:px-0"
          >
            Proqramlaşdırma məntiqini{" "}
            <span className="text-secondary font-semibold">Epik RPG macərasında</span> öyrən
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="hidden sm:inline-block mb-8 sm:mb-10 px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-card/80 backdrop-blur-sm border border-border font-mono text-xs sm:text-sm"
          >
            <span className="text-muted-foreground">const</span>{" "}
            <span className="text-secondary">qəhrəman</span>{" "}
            <span className="text-muted-foreground">=</span>{" "}
            <span className="text-primary">await</span>{" "}
            <span className="text-accent">questəBaşla</span>
            <span className="text-foreground">()</span>
            <span className="text-primary animate-blink">|</span>
          </motion.div>

        <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.9, duration: 0.6 }}
  className="flex flex-col mt-[16px] sm:flex-row gap-2 sm:gap-4 justify-center items-center px-2 sm:px-0"
>
  <Button
    size="lg"
    className="group relative w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground animate-glow-pulse"
    onClick={() => checkAndNavigate(navigate, '/play')}
  >
    <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:scale-110 transition-transform" />
    İndi Oyna
  </Button>

  <Button
    size="lg"
    variant="outline"
    onClick={() => {
      const aboutSection = document.getElementById('about');
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
      }
    }}
    className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg font-semibold border-secondary text-secondary hover:bg-secondary/10 hover:border-secondary"
  >
    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
    Ətraflı Öyrən
  </Button>
</motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;