import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "./pages/Login.tsx";
import Index from "./pages/Index.tsx";
import Moderation from "./pages/Moderation.tsx";
import Profile from "./pages/Profile.tsx";
import SearchPage from "./pages/SearchPage.tsx";
import AiChat from "./pages/AiChat.tsx";
import Reels from "./pages/Reels.tsx";
import SettingsPage from "./pages/Settings.tsx";
import NotFound from "./pages/NotFound.tsx";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/feed" element={<Layout><Index /></Layout>} />
          <Route path="/moderation" element={<Layout><Moderation /></Layout>} />
          <Route path="/profile/:id" element={<Layout><Profile /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
          <Route path="/search" element={<Layout><SearchPage /></Layout>} />
          <Route path="/ai-chat" element={<Layout><AiChat /></Layout>} />
          <Route path="/reels" element={<Layout><Reels /></Layout>} />
          <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
