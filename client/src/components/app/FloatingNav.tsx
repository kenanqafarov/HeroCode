import { motion } from "framer-motion";
import {
  Menu,
  Edit,
  Star,
  Zap,
  Trophy,
  Settings,
  Sun,
  Moon,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "./ThemeProvider";

interface NavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  action?: () => void;
}

const FloatingNav = () => {
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      id: "edit",
      icon: <Edit className="w-5 h-5" />,
      label: "Create",
      color: "from-pink-400 to-rose-500",
    },
    {
      id: "achievements",
      icon: <Star className="w-5 h-5" />,
      label: "Achievements",
      color: "from-yellow-400 to-orange-500",
    },
    {
      id: "battles",
      icon: <Trophy className="w-5 h-5" />,
      label: "Battles",
      color: "from-cyan-400 to-blue-500",
    },
    {
      id: "power",
      icon: <Zap className="w-5 h-5" />,
      label: "Power",
      color: "from-purple-400 to-pink-500",
    },
    {
      id: "settings",
      icon: <Settings className="w-5 h-5" />,
      label: "Settings",
      color: "from-slate-400 to-slate-600",
    },
  ];

  return (
    <motion.div
      className="fixed left-0 top-1/2 transform -translate-y-1/2 z-40"
      initial={{ x: -20 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Floating Nav Dock */}
      <div className="relative">
        {/* Background Glow */}
        <div className="absolute -inset-1 bg-gradient-to-b from-primary/20 via-purple-500/20 to-cyan-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Main Container - Semi-rounded (left flat, right rounded) */}
        <motion.div
          className="relative bg-background/80 dark:bg-slate-950/80 backdrop-blur-xl border border-border/50 dark:border-slate-800/50 shadow-2xl"
          style={{
            borderRadius: "0 32px 32px 0",
            padding: "20px 16px",
            width: "80px",
          }}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Menu Icon */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex justify-center mb-6 p-2.5 rounded-lg hover:bg-muted/50 dark:hover:bg-slate-900/50 transition-colors group"
          >
            <Menu className="w-6 h-6 text-foreground dark:text-slate-50 group-hover:text-primary" />
          </motion.button>

          {/* Divider */}
          <div className="w-full h-px bg-border/30 dark:bg-slate-800/30 mb-6" />

          {/* Navigation Items */}
          <div className="flex flex-col gap-4">
            {navItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="flex flex-col items-center gap-2"
              >
                {/* Icon Button */}
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all cursor-pointer relative group`}
                >
                  {/* Hover Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Icon */}
                  <span className="relative z-10">{item.icon}</span>
                </motion.button>

                {/* Label */}
                <span className="text-[10px] font-semibold text-muted-foreground dark:text-slate-400 text-center leading-tight max-w-[60px]">
                  {item.label}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-border/30 dark:bg-slate-800/30 my-6" />

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="w-full flex flex-col items-center gap-2 p-2.5 rounded-lg hover:bg-muted/50 dark:hover:bg-slate-900/50 transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all">
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground dark:text-slate-400 text-center leading-tight">
              {theme === "dark" ? "Light" : "Dark"}
            </span>
          </motion.button>
        </motion.div>

        {/* Floating Particles (decorative) */}
        <motion.div
          className="absolute -right-8 top-12 w-2 h-2 bg-primary rounded-full"
          animate={{
            y: [0, -10, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div
          className="absolute -right-6 bottom-20 w-1.5 h-1.5 bg-cyan-400 rounded-full"
          animate={{
            y: [0, 10, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
        />
      </div>
    </motion.div>
  );
};

export default FloatingNav;
