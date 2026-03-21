import { Code2 } from "lucide-react";

const Logo = () => {
  return (
    <div className="fixed top-6 left-6 z-50">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary via-cyan-500 to-purple-500 flex items-center justify-center shadow-lg dark:shadow-lg hover:shadow-xl transition-shadow">
        <Code2 className="w-6 h-6 text-white" />
      </div>
    </div>
  );
};

export default Logo;
