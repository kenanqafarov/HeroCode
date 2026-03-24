import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/app/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import ProfilePage from "./pages/Profile";
import AdminPanel from "./pages/Admin";
import LiveMatch from "./pages/LiveMatch";
import LiveGame from "./pages/LiveGame";
import BlogDetails from "./pages/BlogDetails";

const queryClient = new QueryClient();

const hasValidToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return false;
    const payload = JSON.parse(atob(payloadBase64));
    const exp = typeof payload.exp === "number" ? payload.exp * 1000 : 0;
    return exp > Date.now();
  } catch {
    return false;
  }
};

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  if (!hasValidToken()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="codequest-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/live-match" element={<LiveMatch />} />
            <Route path="/live-match/game/:matchId" element={<LiveGame />} />
            <Route path="/blog/:id" element={<BlogDetails />} />


            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
