import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Search,
  Compass,
  Film,
  MessageCircle,
  Heart,
  PlusSquare,
  User,
  Settings,
  Menu,
  LogOut,
  ShieldAlert
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { CreatePostDialog } from "@/components/CreatePostDialog";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, profile: currentUser, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const navItems = [
    { icon: Home, label: "Home", path: "/feed" },
    { icon: Search, label: "Search", path: "/search" },
    { icon: Compass, label: "Explore", path: "/search" }, // Could be a separate route, mapped to search for now
    { icon: Film, label: "Reels", path: "/reels" },
    { icon: MessageCircle, label: "Messages", path: "/ai-chat" },
    { icon: ShieldAlert, label: "Moderation", path: "/moderation" },
    {
      icon: User,
      label: "Profile",
      path: currentUser ? `/profile/${currentUser.id}` : "/profile",
    },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Left Sidebar */}
      <nav className="fixed top-0 left-0 h-screen border-r border-border bg-background z-50 w-[72px] xl:w-[244px] transition-all duration-300 flex flex-col pt-8 pb-4 px-3 xl:px-4">
        <Link to="/feed" className="flex items-center gap-4 mb-8 px-2 xl:px-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center text-white shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
          </div>
          <span className="hidden xl:block font-bold text-xl font-['Space_Grotesk'] tracking-tight">
            SafeGram
          </span>
        </Link>

        <div className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path) && item.path !== "/" && item.path !== "/profile" || location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`group flex items-center gap-4 p-3 rounded-lg transition-all duration-200 hover:bg-muted ${
                  isActive ? "font-bold" : "font-medium"
                }`}
              >
                <div className="relative shrink-0 transition-transform group-hover:scale-105">
                  <item.icon
                    className={`w-6 h-6 ${isActive ? "stroke-[2.5px]" : "stroke-[2px]"}`}
                  />
                </div>
                <span className="hidden xl:block text-[15px]">{item.label}</span>
              </Link>
            );
          })}

          <div className="hidden xl:block w-full">
            <CreatePostDialog />
          </div>
          <div className="xl:hidden w-full flex justify-center">
            {/* Provide a smaller trigger for CreatePostDialog if needed or rely on its internal trigger. Since CreatePostDialog returns its own trigger button, we might need to modify it later to fit the sidebar. For now, it will render its default. */}
            <CreatePostDialog />
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-2">
          <Link
            to="/settings"
            className={`group flex items-center gap-4 p-3 rounded-lg transition-all duration-200 hover:bg-muted w-full ${
              location.pathname === "/settings" ? "font-bold" : "font-medium"
            }`}
          >
            <Settings
              className={`w-6 h-6 shrink-0 transition-transform group-hover:scale-105 ${location.pathname === "/settings" ? "stroke-[2.5px]" : "stroke-[2px]"}`}
            />
            <span className="hidden xl:block text-[15px]">Settings</span>
          </Link>
          <button
            onClick={handleLogout}
            className="group flex items-center gap-4 p-3 rounded-lg transition-all duration-200 hover:bg-muted font-medium w-full text-destructive hover:text-destructive"
          >
            <LogOut className="w-6 h-6 shrink-0 transition-transform group-hover:scale-105" />
            <span className="hidden xl:block text-[15px]">Log Out</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 ml-[72px] xl:ml-[244px] min-h-screen">
        {children}
      </main>
    </div>
  );
};
