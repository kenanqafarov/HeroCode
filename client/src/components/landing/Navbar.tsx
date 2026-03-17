import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Code2, Menu, X } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { checkAndNavigate } from '@/utils/authCheck';
import { Link } from "react-router-dom";
const navLinks = [
  { label: "Haqqımızda", href: "#about" },
  { label: "Xüsusiyyətlər", href: "#features" },
  { label: "AI Mentor", href: "#ai-mentor" },
  { label: "Niyə Biz", href: "#why-us" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md border-b border-border/50" />
      
      <div className="container mx-auto px-4 relative">
        <div className="flex items-center justify-between h-20">
          <a href="#" className="flex items-center gap-2 group">
            <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-all">
              <Code2 className="w-6 h-6 text-primary" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-foreground">
              HeroCode
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="navLinkNavigators text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Button
              className="
                bg-primary 
                hover:bg-primary/90 
                text-primary-foreground 
                font-bold 
                px-6 
                rounded-xl 
                shadow-lg shadow-primary/20 
                hover:shadow-primary/40 
                transition-all 
                active:scale-95
              "
              onClick={() => checkAndNavigate(navigate, '/play')}
            >
              İndi Oyna
            </Button>

            <Button
              variant="ghost"
              className="
                text-primary 
                font-bold 
                hover:bg-primary/5 
                border-2 border-transparent 
                hover:border-primary/20 
                rounded-xl 
                px-6
                transition-all
                active:scale-95
              "
              onClick={() => navigate('/login')}
            >
              Giriş et
            </Button>
            
            {/* PROFİL ŞƏKLİ
            <Link to="/profile" className="ml-2 group">
              <div className="w-11 h-11 rounded-xl border-2 border-primary/20 group-hover:border-primary transition-all overflow-hidden bg-muted p-0.5 shadow-md active:scale-90">
                <img
                  src="https://api.dicebear.com/7.x/pixel-art/svg?seed=Hero"
                  alt="Profile"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </Link> */}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-muted/50 hover:bg-muted transition-colors"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border shadow-xl"
            >
              <div className="p-6 space-y-4">
                <div className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-3 text-base font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
                
                <hr className="border-border/50" />
                
                <div className="flex flex-col gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="w-full py-6 rounded-xl border-primary/20 text-primary font-bold"
                    onClick={() => navigate('/login')}
                  >
                    Giriş et
                  </Button>

                  <Button
                    className="w-full py-6 rounded-xl bg-primary font-bold shadow-lg shadow-primary/20"
                    onClick={() => checkAndNavigate(navigate, '/play')}
                  >
                    İndi Oyna
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;