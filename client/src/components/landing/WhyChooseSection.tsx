import { motion } from "framer-motion";
import { CheckCircle2, Trophy, GraduationCap, Zap } from "lucide-react";

const reasons = [
  "Təfəkkürü əvəz etməyən, öyrənməni təkmilləşdirən təbii AI inteqrasiyası",
  "İştirak və yadda saxlama dərəcəsini artıran sübut olunmuş oyunlaşdırma",
  "EdTech hakatonları və təhsil innovasiyaları üçün ideal",
  "SDG 4: Keyfiyyətli Təhsil məqsədləri ilə uyğunluq",
  "Məktəblər, bootcamplər və öz-özünə öyrənənlər üçün genişlənə bilən platforma",
];

const WhyChooseSection = () => {
  return (
    <section id="why-us" className="py-12 mb-[80px] sm:py-16 md:py-24 mt-[80px] relative">
      <div className="container mx-auto px-4 sm:px-6">
       <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
  {/* Sol Tərəf - Stats */}
  <motion.div
    initial={{ opacity: 0, x: -30 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="space-y-3"
  >
    {[
      { icon: Trophy, value: "50+", label: "Zindan", color: "primary" },
      { icon: GraduationCap, value: "1000+", label: "Tapşırıq", color: "secondary" },
      { icon: Zap, value: "100%", label: "İştirak", color: "accent" },
      { icon: CheckCircle2, value: "4.9★", label: "Reytinq", color: "primary" },
    ].map((stat, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1, duration: 0.4 }}
        className="flex items-center gap-4 dungeon-card rounded-xl p-4 border border-border/50 hover:border-primary/30 transition-all group bg-card/30"
      >
        <div className={`flex-shrink-0 p-2.5 rounded-lg bg-muted/20 ${
            stat.color === "primary" ? "text-primary" : 
            stat.color === "secondary" ? "text-secondary" : "text-accent"
          }`}>
          <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        
        <div className="flex flex-1 items-center justify-between">
          <p className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-tight">
            {stat.label}
          </p>
          <p className="font-display font-bold text-lg sm:text-xl text-foreground">
            {stat.value}
          </p>
        </div>
      </motion.div>
    ))}
  </motion.div>

  {/* Sağ Tərəf - Content */}
  <motion.div
    initial={{ opacity: 0, x: 30 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="flex flex-col justify-center"
  >
    <p className="text-primary font-mono text-[10px] sm:text-xs mb-3 tracking-[0.2em] font-bold">
      {'>'} BİZİ_NİYƏ_SEÇMƏLİ_
    </p>
    <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl mb-4 leading-tight">
      <span className="text-foreground">EdTech İnnovasiyaları üçün </span>
      <span className="gradient-text-green text-glow italic">İdeal</span>
    </h2>
    
    <p className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed">
      HeroCode olaraq biz təhsil mexanikalarını oyun dünyası ilə sintez edib, öyrənməni macəraya çeviririk.
    </p>

    <div className="space-y-3">
      {reasons.map((reason, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 + index * 0.1 }}
          className="flex items-center gap-3"
        >
          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="text-xs sm:text-sm text-muted-foreground">{reason}</p>
        </motion.div>
      ))}
    </div>

    
  </motion.div>
</div>
      </div>
    </section>
  );
};

export default WhyChooseSection;