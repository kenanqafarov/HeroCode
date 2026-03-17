import { motion } from "framer-motion";
import { Bot, MessageCircle, Lightbulb, Route } from "lucide-react";

const AIMentorSection = () => {
  return (
    <section id="ai-mentor" className="py-12 sm:py-16 md:py-24 relative overflow-hidden mt-[80px]">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* AI Demo Animation */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <div className="dungeon-card rounded-xl border border-border overflow-hidden">
              {/* Chat Header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 border-b border-border">
                <div className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">AI Mentor</p>
                  <p className="text-xs text-primary">Onlayn</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 min-h-[250px] sm:min-h-[300px]">
                {/* User Message */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-end"
                >
                  <div className="bg-primary/20 border border-primary/30 rounded-lg rounded-br-none px-3 sm:px-4 py-2 max-w-[85%] sm:max-w-[80%]">
                    <p className="text-xs sm:text-sm text-foreground">
                      Bu dövrədə ilişdim. Sonsuza qədər işləyir! 😫
                    </p>
                  </div>
                </motion.div>

                {/* AI Response */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                  className="flex gap-2"
                >
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-accent/30 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-accent" />
                  </div>
                  <div className="bg-muted/50 border border-border rounded-lg rounded-bl-none px-3 sm:px-4 py-2 sm:py-3 max-w-[85%] sm:max-w-[80%]">
                    <p className="text-xs sm:text-sm text-foreground mb-1.5 sm:mb-2">
                      Əla sual! 🧙‍♂️ Gəl birlikdə düşünək...
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                      Dövrə şərtini yoxla. Özünə sual ver: <span className="text-secondary">"Bu dövrə nə vaxt dayanmalıdır?"</span>
                    </p>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-primary font-mono bg-card/50 rounded px-1.5 sm:px-2 py-1">
                      <Lightbulb className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <span>Məsləhət: 7-ci sətrə bax</span>
                    </div>
                  </div>
                </motion.div>

                {/* User Follow-up */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.9 }}
                  className="flex justify-end"
                >
                  <div className="bg-primary/20 border border-primary/30 rounded-lg rounded-br-none px-3 sm:px-4 py-2 max-w-[85%] sm:max-w-[80%]">
                    <p className="text-xs sm:text-sm text-foreground">
                      Aha! Sayğacı artırmaqı unutmuşam! 🎉
                    </p>
                  </div>
                </motion.div>

                {/* AI Celebration */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.2 }}
                  className="flex gap-2"
                >
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-accent/30 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-accent" />
                  </div>
                  <div className="bg-primary/10 border border-primary/30 rounded-lg rounded-bl-none px-3 sm:px-4 py-2">
                    <p className="text-xs sm:text-sm text-primary font-semibold">
                      🏆 +50 XP! Özün tapdın!
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-1 lg:order-2"
          >
            <p className="text-accent font-mono text-xs sm:text-sm mb-3 sm:mb-4 tracking-wider">
              {'>'} SÜNI_INTELLEKT_DƏSTƏKLI_ÖYRƏNMƏ_
            </p>
            <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl lg:text-4xl mb-4 sm:mb-6">
              <span className="text-foreground">Tanış ol </span>
              <span className="gradient-text-purple text-glow-purple">AI Mentorunla</span>
            </h2>
            
            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              ilişdin? Koduna əsaslanan ağıllı məsləhətlərlə sənə yol göstərən AI 
              <span className="text-accent font-semibold"> fərdi öyrənmə yolu</span> yaradır.
            </p>

            <div className="space-y-4 sm:space-y-6">
              {[
                {
                  icon: MessageCircle,
                  title: "Kontekstə Uyğun Məsləhətlər",
                  description: "Ümumi cavablar yox, sənin real koduna əsaslanan məsləhətlər.",
                },
                {
                  icon: Route,
                  title: "Fərdi Öyrənmə Yolu",
                  description: "İrəliləyişinə görə çətinlik və təkliflər avtomatik uyğunlaşır.",
                },
                {
                  icon: Lightbulb,
                  title: "Kəşf edərək Öyrən",
                  description: "Həll yollarını özün tapmağa yönəldilir, möhkəm anlayış qazanılır.",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.15 }}
                  className="flex gap-3 sm:gap-4"
                >
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center">
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base text-foreground mb-0.5 sm:mb-1">{item.title}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AIMentorSection;