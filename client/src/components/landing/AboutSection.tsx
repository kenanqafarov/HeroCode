import { motion } from "framer-motion";
import { Code, Swords, Bug, Sparkles } from "lucide-react";

const AboutSection = () => {
  return (
    <section id="about" className="py-12 sm:py-16 md:py-24 mt-[80px] relative">
      <div  className="container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 sm:mb-6">
              <span className="text-foreground">Kodlaşdırma </span>
              <span className="gradient-text-blue text-glow-blue">Macəralarına Başla</span>
            </h2>
            
            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              Maneələri <span className="text-primary font-semibold">kod yazaraq aşdığın</span>, məntiq səhvlərini düzəltdiyin və proqramlaşdırma bacarıqlarını artırdığın bir dünyaya dal.
            </p>

            <div className="space-y-3 sm:space-y-4">
              {[
                { icon: Code, text: "Düşmənləri məğlub etmək və tapmacaları həll etmək üçün real kod yaz" },
                { icon: Bug, text: "Gizli keçidləri açmaq üçün məntiq səhvlərini tap və düzəlt" },
                { icon: Swords, text: "Epik boss döyüşlərində kodlaşdırma tapşırıqları ilə vuruş" },
                { icon: Sparkles, text: "İrəlilədikcə XP qazan və yeni qabiliyyətlər aç" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                  className="flex items-start sm:items-center gap-3 sm:gap-4 group"
                >
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-card border border-border flex items-center justify-center group-hover:border-primary/50 transition-colors">
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground group-hover:text-foreground transition-colors">
                    {item.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Game Interface Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="dungeon-card rounded-xl p-1 border-glow">
              {/* Terminal Header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-primary/80" />
                </div>
                <span className="text-[10px] sm:text-xs text-muted-foreground font-mono ml-2 truncate">
                  zindan_tapmacasi.py
                </span>
              </div>

              {/* Code Editor */}
              <div className="p-3 sm:p-4 font-mono text-xs sm:text-sm space-y-1.5 sm:space-y-2">
                <div>
                  <span className="text-accent">def</span>{" "}
                  <span className="text-secondary">qapi_ac</span>
                  <span className="text-foreground">(parol):</span>
                </div>
                <div className="pl-4">
                  <span className="text-accent">if</span>{" "}
                  <span className="text-foreground">parol ==</span>{" "}
                  <span className="text-primary">"mentiq_ustasi"</span>
                  <span className="text-foreground">:</span>
                </div>
                <div className="pl-8">
                  <span className="text-accent">return</span>{" "}
                  <span className="text-primary">True</span>
                </div>
                <div className="pl-4">
                  <span className="text-muted-foreground"># Kodun buraya...</span>
                </div>
                <div className="pl-4 flex items-center">
                  <span className="text-foreground">█</span>
                  <span className="animate-blink text-primary">|</span>
                </div>
              </div>

              {/* Challenge Info */}
              <div className="border-t border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Səviyyə 3: Məntiq Qapısı</span>
                  <span className="text-xs text-primary font-semibold">+150 XP</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "65%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Floating decorative elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-accent/20 border border-accent/50 flex items-center justify-center"
            >
              <span className="text-base sm:text-xl">🗝️</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;