import { useState } from "react";
import Logo from "../components/app/Logo";
import TopBar from "../components/app/TopBar";
import Sidebar from "../components/app/Sidebar";
import Feed from "../components/app/Feed";

const Index = () => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-slate-950 text-foreground">
      {/* Logo */}
      <Logo />

      {/* Top Bar */}
      <TopBar />

      {/* Sidebar */}
      <Sidebar />

      {/* Feed Content */}
      <Feed refreshing={refreshing} />
    </div>
  );
};

export default Index;
