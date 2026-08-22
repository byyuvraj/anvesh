import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { MapPin, Users, Database, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // If already authenticated, they can just go to community
  if (isAuthenticated) {
    navigate('/community');
    return null;
  }

  return (
    <div className="w-full flex flex-col items-center animate-in fade-in duration-700 pb-20">
      
      {/* Hero Section */}
      <div className="relative w-full max-w-[1200px] h-[650px] mt-4 rounded-[3rem] overflow-hidden flex flex-col items-center justify-center text-center shadow-2xl border border-white/50 group">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80')] bg-cover bg-center group-hover:scale-105 transition-transform duration-[3s] ease-out opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/30 via-stone-900/20 to-white/90 backdrop-blur-[2px]" />
        
        <div className="relative z-10 flex flex-col items-center px-4 max-w-4xl mt-20">
          <div className="apple-glass-solid px-4 py-1.5 rounded-full mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#c8ff00] animate-pulse" />
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300 tracking-wide">A Data-Driven Travel Community</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-black text-stone-900 dark:text-white tracking-tighter leading-[1.1] mb-6 drop-shadow-sm font-sans">
            Real Stories.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-stone-900 to-stone-500 dark:from-stone-400 dark:to-stone-200 font-serif italic font-normal">Real Data.</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-stone-700 dark:text-stone-300 font-medium max-w-2xl mb-10 leading-relaxed drop-shadow-md">
            Anvesh isn't powered by artificial intelligence. It's powered by human intelligence. We map authentic traveler stories to geographical data to help you discover the world's best hidden gems.
          </p>
          
          <div className="flex items-center gap-4">
            <Link to="/register" className="bg-stone-900 dark:bg-white hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900 px-8 py-4 rounded-full font-bold shadow-xl transition-all flex items-center gap-2 text-sm sm:text-base hover:scale-105 border border-stone-700 dark:border-white">
              Join the Community <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="apple-glass hover:bg-white dark:hover:bg-stone-800 text-stone-900 dark:text-white px-8 py-4 rounded-full font-bold shadow-lg transition-all text-sm sm:text-base hover:scale-105">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="max-w-[1200px] w-full mt-24 px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-stone-900 dark:text-white tracking-tighter mb-4">How Anvesh Works</h2>
          <p className="text-stone-500 dark:text-stone-400 font-medium">Transparency is our core principle. Here is how your data fuels the platform.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="apple-glass p-10 rounded-[2.5rem] flex flex-col items-start hover:-translate-y-2 transition-transform duration-500">
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-stone-900 shadow-sm border border-stone-100 dark:border-stone-800 flex items-center justify-center mb-6 text-stone-700 dark:text-stone-300">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-stone-900 dark:text-white mb-3">1. You Share Stories</h3>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-sm">
              Write about your trips, the small cafes you found, and the hidden trails you hiked. Every story you share enriches the community.
            </p>
          </div>

          {/* Card 2 */}
          <div className="apple-glass p-10 rounded-[2.5rem] flex flex-col items-start hover:-translate-y-2 transition-transform duration-500">
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-stone-900 shadow-sm border border-stone-100 dark:border-stone-800 flex items-center justify-center mb-6 text-stone-700 dark:text-stone-300">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-stone-900 dark:text-white mb-3">2. We Map the Data</h3>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-sm">
              We tie your stories to specific geographical locations—from states down to tiny remote villages—creating a massive relational database of human experiences.
            </p>
          </div>

          {/* Card 3 */}
          <div className="apple-glass p-10 rounded-[2.5rem] flex flex-col items-start hover:-translate-y-2 transition-transform duration-500">
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-stone-900 shadow-sm border border-stone-100 dark:border-stone-800 flex items-center justify-center mb-6 text-stone-700 dark:text-stone-300">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-stone-900 dark:text-white mb-3">3. Engine Recommends</h3>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-sm">
              When a user searches for a state, our engine surfaces the highest-rated villages and hidden gems based entirely on the number of real community stories.
            </p>
          </div>

        </div>
      </div>

      {/* Closed Community Banner */}
      <div className="max-w-[1000px] w-full mx-auto mt-24 px-4">
        <div className="bg-stone-900 rounded-[3rem] p-12 relative overflow-hidden flex flex-col items-center text-center shadow-2xl border border-stone-800">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-[#c8ff00] rounded-full mix-blend-screen filter blur-[100px] opacity-20" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-[100px] opacity-10" />
          
          <ShieldCheck className="w-12 h-12 text-[#c8ff00] mb-6" />
          <h2 className="text-4xl font-black text-white tracking-tighter mb-4">A Highly Compact Community</h2>
          <p className="text-stone-400 font-medium max-w-xl mx-auto mb-10 text-lg">
            To maintain the quality of data and ensure authentic recommendations, Anvesh features are exclusively available to registered members.
          </p>
          
          <Link to="/register" className="bg-[#c8ff00] hover:bg-[#b8f200] text-stone-900 px-10 py-4 rounded-full font-black shadow-lg transition-all flex items-center gap-2 hover:scale-105">
            Create Your Account
          </Link>
        </div>
      </div>

    </div>
  );
}
