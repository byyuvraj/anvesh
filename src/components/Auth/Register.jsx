import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import { UserPlus, Mail, Lock, User, Loader2, Compass, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    travelStyle: 'Backpacker'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const setCredentials = useAuthStore(state => state.setCredentials);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/register', formData);
      setCredentials(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const travelStyles = ["Backpacker", "Luxury", "Foodie", "Digital Nomad", "History Buff"];

  return (
    <div className="w-full max-w-md mx-auto mt-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 mb-6 border border-stone-200 dark:border-stone-700 shadow-sm">
          <UserPlus className="w-8 h-8 text-stone-800 dark:text-stone-200" />
        </div>
        <h1 className="text-4xl font-black text-stone-900 dark:text-white tracking-tighter mb-3">Join Anvesh</h1>
        <p className="text-stone-500 dark:text-stone-400 font-medium">Start contributing your travel data.</p>
      </div>

      <div className="apple-glass-solid p-8 sm:p-10 rounded-[2.5rem] shadow-xl border border-white dark:border-stone-800">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {error && <div className="text-red-600 text-sm font-bold bg-red-50 dark:bg-red-900/30 p-3 rounded-xl border border-red-200 dark:border-red-800 text-center">{error}</div>}
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-widest pl-1">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 dark:text-stone-500" />
              <input 
                type="text" 
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full bg-white/50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded-2xl pl-12 pr-4 py-3.5 text-stone-900 dark:text-white focus:outline-none focus:border-[#8ab836] dark:focus:border-[#c8ff00] focus:ring-4 focus:ring-[#8ab836]/10 dark:focus:ring-[#c8ff00]/10 transition-all font-medium placeholder-stone-400 dark:placeholder-stone-600"
                placeholder="traveler99"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-widest pl-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 dark:text-stone-500" />
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
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

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-widest pl-1">Travel Style</label>
            <div className="relative">
              <Compass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 dark:text-stone-500 z-10 pointer-events-none" />
              <select 
                value={formData.travelStyle}
                onChange={(e) => setFormData({...formData, travelStyle: e.target.value})}
                className="w-full bg-white/50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded-2xl pl-12 pr-4 py-3.5 text-stone-900 dark:text-white focus:outline-none focus:border-[#8ab836] dark:focus:border-[#c8ff00] focus:ring-4 focus:ring-[#8ab836]/10 dark:focus:ring-[#c8ff00]/10 transition-all font-medium appearance-none cursor-pointer"
              >
                {travelStyles.map(s => <option key={s} value={s} className="bg-white dark:bg-stone-900">{s}</option>)}
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-stone-900 dark:bg-white hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900 py-4 rounded-2xl font-bold shadow-md transition-all mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign Up'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-stone-500 dark:text-stone-400 text-sm font-medium">
            Already have an account? <Link to="/login" className="text-[#658925] dark:text-[#c8ff00] font-bold hover:underline underline-offset-4">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
