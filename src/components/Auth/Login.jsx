import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import { Compass, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const setCredentials = useAuthStore(state => state.setCredentials);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setCredentials(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 mb-6 border border-stone-200 dark:border-stone-700 shadow-sm">
            <Compass className="w-8 h-8 text-stone-800 dark:text-stone-200" />
          </div>
          <h1 className="text-4xl font-black text-stone-900 dark:text-white tracking-tighter mb-3">Welcome Back</h1>
          <p className="text-stone-500 dark:text-stone-400 font-medium">Continue your journey with the community.</p>
        </div>

        <div className="apple-glass-solid p-8 sm:p-10 rounded-[2.5rem] shadow-xl border border-white dark:border-stone-800">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {error && <div className="text-red-600 text-sm font-bold bg-red-50 dark:bg-red-900/30 p-3 rounded-xl border border-red-200 dark:border-red-800 text-center">{error}</div>}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-widest pl-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 dark:text-stone-500" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded-2xl pl-12 pr-4 py-3.5 text-stone-900 dark:text-white focus:outline-none focus:border-[#8ab836] dark:focus:border-[#c8ff00] focus:ring-4 focus:ring-[#8ab836]/10 dark:focus:ring-[#c8ff00]/10 transition-all font-medium placeholder-stone-400 dark:placeholder-stone-600"
                  placeholder="hello@explorer.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-widest pl-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 dark:text-stone-500" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded-2xl pl-12 pr-12 py-3.5 text-stone-900 dark:text-white focus:outline-none focus:border-[#8ab836] dark:focus:border-[#c8ff00] focus:ring-4 focus:ring-[#8ab836]/10 dark:focus:ring-[#c8ff00]/10 transition-all font-medium placeholder-stone-400 dark:placeholder-stone-600"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-stone-900 dark:bg-white hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900 py-4 rounded-2xl font-bold shadow-md transition-all mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-stone-500 dark:text-stone-400 text-sm font-medium">
              New to Anvesh? <Link to="/register" className="text-[#658925] dark:text-[#c8ff00] font-bold hover:underline underline-offset-4">Join the community</Link>
            </p>
          </div>
        </div>
      </div>
  );
}
