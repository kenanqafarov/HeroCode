import { useState } from "react";
import { motion } from "framer-motion";
import { Home, Compass, Trophy, User, Settings, Sun, Moon, Search } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const TopNav = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("home");

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "explore", label: "Explore", icon: Compass },
    { id: "battles", label: "Battles", icon: Trophy },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 w-full border-b border-border/40 dark:border-slate-800/40 bg-background/80 dark:bg-slate-950/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 dark:supports-[backdrop-filter]:bg-slate-950/75"
    >
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="flex-shrink-0"
          >
            <div className="text-2xl font-black bg-gradient-to-r from-primary via-cyan-500 to-purple-500 bg-clip-text text-transparent">
              CodeQuest
            </div>
          </motion.div>

          {/* Center Navigation */}
          <nav className="hidden sm:flex items-center gap-1 bg-muted/20 dark:bg-slate-900/20 rounded-full p-1 backdrop-blur-sm">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-2 group"
                >
                  {isActive && (
                    <motion.div
                      layoutId="navBg"
                      className="absolute inset-0 bg-primary/15 dark:bg-cyan-500/10 rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 40 }}
                    />
                  )}

                  <Icon
                    className={`w-4 h-4 transition-colors duration-200 ${
                      isActive
                        ? "text-primary dark:text-cyan-400"
                        : "text-muted-foreground dark:text-slate-400 group-hover:text-foreground dark:group-hover:text-slate-300"
                    }`}
                  />

                  <span
                    className={`transition-colors duration-200 ${
                      isActive
                        ? "text-foreground dark:text-slate-100"
                        : "text-muted-foreground dark:text-slate-400 group-hover:text-foreground dark:group-hover:text-slate-300"
                    }`}
                  >
                    {item.label}
                  </span>
                </motion.button>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Search (Hidden on mobile) */}
            <motion.div
              className="hidden md:flex items-center gap-2 bg-muted/20 dark:bg-slate-900/20 rounded-full px-4 py-2 border border-border/20 dark:border-slate-800/30"
              whileHover={{ scale: 1.02 }}
            >
              <Search className="w-4 h-4 text-muted-foreground dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search articles..."
                className="bg-transparent text-sm placeholder-muted-foreground dark:placeholder-slate-500 focus:outline-none text-foreground dark:text-slate-100 w-32"
              />
            </motion.div>

            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.1, rotate: 20 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg hover:bg-muted/30 dark:hover:bg-slate-900/40 transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </motion.button>

            {/* Mobile Menu (Hidden on desktop) */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="sm:hidden p-2 rounded-lg hover:bg-muted/30 dark:hover:bg-slate-900/40 transition-colors"
            >
              <User className="w-5 h-5 text-foreground dark:text-slate-100" />
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <motion.nav className="sm:hidden flex items-center gap-1 mt-3 pb-2 overflow-x-auto -mx-4 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors duration-200 flex-shrink-0 ${
                  isActive
                    ? "bg-primary/15 dark:bg-cyan-500/10 text-primary dark:text-cyan-400"
                    : "text-muted-foreground dark:text-slate-500 hover:text-foreground dark:hover:text-slate-300 hover:bg-muted/20 dark:hover:bg-slate-900/20"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-semibold">{item.label}</span>
              </motion.button>
            );
          })}
        </motion.nav>
      </div>
    </motion.header>
  );
};

export default TopNav;
