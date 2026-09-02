import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Onboarding from "./components/Auth/Onboarding";
import ExploreCommunity from "./components/Community/ExploreCommunity";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import WriteBlog from "./components/Community/WriteBlog";
import BlogDetail from "./components/Community/BlogDetail";
import UserProfile from "./components/Community/UserProfile";
import SmartItinerary from "./components/Community/SmartItinerary";
import { Map, LogOut, UserCircle, Sun, Moon, Sparkles } from "lucide-react";
import { useAuthStore } from "./store/authStore";
import { useThemeStore } from "./store/themeStore";
import { ReactLenis } from 'lenis/react';

function AppContent() {
  const { isAuthenticated, user, logout, checkAuth, isLoading } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-bold text-stone-500 dark:text-stone-400">Loading...</div>;

  const isLandingPage = location.pathname === '/';

  return (
    <ReactLenis root>
      <div className="min-h-screen bg-transparent text-stone-800 dark:text-stone-200 flex flex-col font-sans selection:bg-[#c8ff00] selection:text-stone-900 relative">
        
        {/* Floating Glass Navigation Bar */}
        <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
          <nav className="pointer-events-auto apple-glass-solid px-6 py-3 flex items-center justify-between rounded-full w-full max-w-[900px] transition-all">
            <Link to="/" className="flex items-center gap-2">
              {theme === 'dark' ? (
                <span className="font-black text-xl tracking-tighter text-white">ANVESH</span>
              ) : (
                <img src="/logo.png" alt="Anvesh Logo" className="h-7 object-contain drop-shadow-sm" />
              )}
            </Link>
            
            <div className="flex items-center gap-6">
              {isAuthenticated && (
                <>
                  <Link to="/community" className="text-sm font-bold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-colors flex items-center gap-1.5">
                    <Map className="w-3.5 h-3.5" /> Explorer
                  </Link>
                  <Link to="/planner" className="text-sm font-bold text-[#8ab836] hover:text-[#7a9d2c] transition-colors flex items-center gap-1.5 bg-[#8ab836]/10 px-3 py-1.5 rounded-full">
                    <Sparkles className="w-3.5 h-3.5" /> AI Planner
                  </Link>
                  <div className="h-4 w-px bg-stone-200 dark:bg-stone-700 mx-1"></div>
                  <div className="flex items-center gap-5">
                    <Link to="/profile" className="text-xs font-bold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 flex items-center gap-2 transition-colors">
                      {user?.profilePicture ? (
                        <img src={user.profilePicture} className="w-7 h-7 rounded-full object-cover border-2 border-white dark:border-stone-800 shadow-sm" />
                      ) : (
                        <UserCircle className="w-6 h-6 text-stone-400 dark:text-stone-500"/>
                      )}
                      <span className="hidden sm:inline">@{user?.username}</span>
                    </Link>
                    <button onClick={handleLogout} className="text-stone-400 dark:text-stone-500 hover:text-red-500 dark:hover:text-red-400 transition-colors bg-stone-50 dark:bg-stone-900/50 p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 border border-stone-200 dark:border-stone-800" title="Logout">
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
              
              {!isAuthenticated && (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="text-xs font-bold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-colors px-2">Login</Link>
                  <Link to="/register" className="bg-[#c8ff00] hover:bg-[#b8f200] text-stone-900 text-xs font-black px-5 py-2.5 rounded-full transition-all shadow-sm">Join Now</Link>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Main Layout Area */}
        <main className={`w-full mx-auto flex-grow ${!isLandingPage ? 'max-w-[1200px] px-4 sm:px-6 lg:px-8 pt-32 pb-12' : 'pt-0'}`}>
          <div className="w-full transition-all animate-in fade-in duration-500">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/community" element={<ExploreCommunity />} />
              <Route path="/planner" element={<SmartItinerary />} />
              <Route path="/write" element={<WriteBlog />} />
              <Route path="/blog/:id" element={<BlogDetail />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </div>
        </main>

        {/* Minimal Footer with Mode Switcher */}
        <footer className="border-t border-stone-200/50 dark:border-stone-800/50 bg-white/50 dark:bg-stone-950/50 backdrop-blur-md py-6 mt-auto">
          <div className="max-w-[1200px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="flex items-center gap-1.5 justify-center sm:justify-start font-medium text-stone-700 dark:text-stone-400 text-xs">
              A Data-Driven Travel Community.
            </p>
            <div className="flex items-center gap-4">
              
              {/* Cute Travel Style Mode Switcher */}
              <button 
                onClick={toggleTheme}
                className="relative flex items-center bg-stone-100 dark:bg-stone-800 rounded-full p-1 border border-stone-200 dark:border-stone-700 w-14 h-8 transition-colors shadow-inner"
                aria-label="Toggle Theme"
              >
                <div 
                  className={`absolute left-1 bg-white dark:bg-stone-900 w-6 h-6 rounded-full shadow-md border border-stone-200/50 dark:border-stone-700/50 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} 
                />
                
                <div className={`relative z-10 flex-1 flex items-center justify-center transition-colors ${theme === 'light' ? 'text-stone-800' : 'text-stone-400'}`}>
                  <Sun className="w-3.5 h-3.5" />
                </div>
                <div className={`relative z-10 flex-1 flex items-center justify-center transition-colors ${theme === 'dark' ? 'text-white' : 'text-stone-500'}`}>
                  <Moon className="w-3 h-3" />
                </div>
              </button>
              
            </div>
          </div>
        </footer>
      </div>
    </ReactLenis>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
