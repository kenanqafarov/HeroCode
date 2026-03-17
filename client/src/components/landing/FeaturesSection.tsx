import { motion } from "framer-motion";
import { Code2, Brain, Sword, Target, Cpu, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Code2,
    title: "Real vaxt Kodlaşdırma Tapşırıqları",
    description: "Zindanlarda irəliləmək üçün tapmacaları real vaxtda kod yazaraq həll et və icra et.",
    color: "primary" as const,
  },
  {
    icon: Brain,
    title: "Süni İntellekt Mentor Dəstəyi",
    description: "Öyrənmə tərzinə və səviyyənə uyğunlaşan fərdi məsləhətlər alan AI mentor.",
    color: "secondary" as const,
  },
  {
    icon: Sword,
    title: "RPG Macəra Elementləri",
    description: "Proqramlaşdırmanı mənimsədikcə personajını yüksəlt, qabiliyyətlər aç və zindanları fəth et.",
    color: "accent" as const,
  },
  {
    icon: Target,
    title: "Məntiq və Problem Həlli",
    description: "Məntiqi düşüncəni gücləndirmək üçün xüsusi hazırlanmış tapşırıqlarla əsas proqramlaşdırma anlayışları.",
    color: "primary" as const,
  },
  {
    icon: Cpu,
    title: "OpenAI İnteqrasiyası",
    description: "Fərdi öyrənmə yolları və ağıllı rəy sistemləri üçün qabaqcıl süni intellektlə dəstəklənir.",
    color: "secondary" as const,
  },
  {
    icon: TrendingUp,
    title: "İrəliləyiş İzləmə",
    description: "Ətraflı analitika, nailiyyətlər və bacarıq inkişafı qrafikləri ilə böyüməni izlə.",
    color: "accent" as const,
  },
];

const colorClasses = {
  primary: {
    icon: "text-primary",
    border: "group-hover:border-primary/50",
    glow: "group-hover:shadow-[0_0_20px_hsl(152_100%_50%/0.3)]",
  },
  secondary: {
    icon: "text-secondary",
    border: "group-hover:border-secondary/50",
    glow: "group-hover:shadow-[0_0_20px_hsl(199_100%_50%/0.3)]",
  },
  accent: {
    icon: "text-accent",
    border: "group-hover:border-accent/50",
    glow: "group-hover:shadow-[0_0_20px_hsl(270_100%_65%/0.3)]",
  },
};

const FeaturesSection = () => {
  return (
    <section id="features" className="py-12 sm:py-16 md:py-24 relative bg-card/30 mt-[80px]">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <p className="text-secondary font-mono text-xs sm:text-sm mb-3 sm:mb-4 tracking-wider">
            {'>'} XÜSUSİYYƏT_AÇILDI_
          </p>
          <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-3 sm:mb-4">
            <span className="text-foreground">Kodlaşdırma Bacarıqlarını </span>
            <span className="gradient-text-green text-glow">Gücləndir</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4 sm:px-0">
            Kod öyrənməni macəraya çevirən unikal oyun və təhsil qarışığı ilə tanış ol.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group"
            >
              <div
                className={`dungeon-card h-full rounded-xl p-4 sm:p-6 border border-border transition-all duration-300 ${colorClasses[feature.color].border} ${colorClasses[feature.color].glow}`}
              >
                {/* Icon */}
                <div className="mb-3 sm:mb-4">
                  <div
                    className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-muted/50 ${colorClasses[feature.color].icon} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-display font-semibold text-lg sm:text-xl mb-2 sm:mb-3 text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Expand Effect */}
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  whileHover={{ height: "auto", opacity: 1 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 mt-4 border-t border-border/50">
                    <span className="text-xs text-primary font-mono">
                      {'>'} Ətraflı →
                    </span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;