import { useState } from "react";
import { Plus, Swords, BookOpen, Home, User, Settings, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Sidebar = () => {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleIconClick = (action: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setShowLoginModal(true);
      return;
    }
    
    // Handle navigation based on action
    switch(action) {
      case 'home':
        navigate('/');
        break;
      case 'battle':
        navigate('/live-match');
        break;
      case 'modules':
        navigate('/lesson-modules');
        break;
      case 'profile':
        navigate('/profile');
        break;
      default:
        break;
    }
  };

  const handlePlusClick = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setShowLoginModal(true);
      return;
    }
    // Open blog editor
    if (typeof window !== "undefined" && (window as any).openBlogEditor) {
      (window as any).openBlogEditor();
    }
  };

  const handleLogin = () => {
    setShowLoginModal(false);
    navigate("/login");
  };

  const handleCancel = () => {
    setShowLoginModal(false);
  };

  return (
    <>
      {/* Modal Overlay */}
      {showLoginModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleCancel}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
        >
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-sm shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Authentication Required
            </h2>
            <p className="text-gray-600 dark:text-slate-400 mb-8">
              You need to login first to access this feature.
            </p>

            {/* Buttons */}
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancel}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors font-medium"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogin}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors font-medium"
              >
                Login
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Sidebar */}
      <div className="fixed left-0 top-1/2 -translate-y-1/2 flex flex-col items-center bg-white dark:bg-slate-900 rounded-r-3xl shadow-2xl py-8 px-4 gap-4 z-40">
        {/* Top 3 icons */}
        <button
          onClick={() => handleIconClick('home')}
          className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors group cursor-pointer"
          title="Home"
        >
          <Home className="w-5 h-5 text-gray-700 dark:text-slate-300" />
        </button>
        <button
          onClick={() => handleIconClick('battle')}
          className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors group cursor-pointer"
          title="Battle"
        >
          <Swords className="w-5 h-5 text-gray-700 dark:text-slate-300" />
        </button>
        <button
          onClick={() => handleIconClick('modules')}
          className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors group cursor-pointer"
          title="Modules"
        >
          <BookOpen className="w-5 h-5 text-gray-700 dark:text-slate-300" />
        </button>

        {/* Center Plus icon with black circle border */}
        <div className="my-4">
          <button
            onClick={handlePlusClick}
            className="p-5 rounded-full bg-black dark:bg-black hover:bg-gray-900 dark:hover:bg-gray-800 transition-all group shadow-lg cursor-pointer"
            title="Create"
          >
            <Plus className="w-7 h-7 text-white" />
          </button>
        </div>

        {/* Bottom 3 icons */}
        <button
          onClick={handleIconClick}
          className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors group cursor-pointer"
          title="Features"
        >
          <Sparkles className="w-5 h-5 text-gray-700 dark:text-slate-300" />
        </button>
        <button
          onClick={() => handleIconClick('profile')}
          className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors group cursor-pointer"
          title="Profile"
        >
          <User className="w-5 h-5 text-gray-700 dark:text-slate-300" />
        </button>
        <button
          onClick={handleIconClick}
          className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors group cursor-pointer"
          title="Settings"
        >
          <Settings className="w-5 h-5 text-gray-700 dark:text-slate-300" />
        </button>
      </div>
    </>
  );
};

export default Sidebar;
