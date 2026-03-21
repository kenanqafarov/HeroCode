import { motion } from "framer-motion";
import { LogOut, LogIn, Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const TopBar = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/login");
  };

  const handleSignIn = () => {
    navigate("/login");
  };

  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-4">
      {/* Theme Toggle */}
      <motion.button
        onClick={toggleTheme}
        whileHover={{ scale: 1.1, rotate: 20 }}
        whileTap={{ scale: 0.95 }}
        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors"
      >
        {theme === "dark" ? (
          <Sun className="w-5 h-5 text-amber-400" />
        ) : (
          <Moon className="w-5 h-5 text-slate-600" />
        )}
      </motion.button>

      {/* Logout / Sign In Button */}
      <motion.button
        onClick={isAuthenticated ? handleLogout : handleSignIn}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors font-medium text-sm ${
          isAuthenticated
            ? "text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-800"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        }`}
      >
        {isAuthenticated ? (
          <>
            <LogOut className="w-4 h-4" />
          </>
        ) : (
          <>
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </>
        )}
      </motion.button>
    </div>
  );
};

export default TopBar;
