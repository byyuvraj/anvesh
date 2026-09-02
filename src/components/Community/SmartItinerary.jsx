import React, { useState } from 'react';
import { Loader2, Sparkles, MapPin, Calendar, Wallet, Users, Zap, Compass, Clock, Map } from 'lucide-react';
import api from '../../lib/api';

export default function SmartItinerary() {
  const [formData, setFormData] = useState({
    destination: '',
    days: 3,
    vibe: 'Adventure & Nature',
    budget: 'Mid-range',
    groupSize: 'Couples'
  });
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.destination) return;
    setLoading(true);
    setError('');
    
    try {
      const { data } = await api.post('/ai/itinerary', formData);
      setItinerary(data);
    } catch (err) {
      console.error(err);
      setError('Failed to generate itinerary. Our AI might be taking a nap.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-4 px-4 sm:px-6 lg:px-8 pb-20 animate-in fade-in duration-700">
      
      {/* Header section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-[#8ab836] to-[#c8ff00] mb-6 shadow-xl shadow-[#c8ff00]/20">
          <Sparkles className="w-10 h-10 text-stone-900" />
        </div>
        <h1 className="text-5xl font-black text-stone-900 dark:text-white tracking-tighter mb-4 font-serif">
          Smart Travel Planner
        </h1>
        <p className="text-lg text-stone-500 dark:text-stone-400 font-medium max-w-2xl mx-auto">
          Let our advanced Generative AI build the perfect, highly-detailed itinerary for your next journey based on your unique travel style.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-4">
          <div className="apple-glass-solid p-6 sm:p-8 rounded-[2.5rem] shadow-xl border border-white dark:border-stone-800 sticky top-32">
            <h2 className="text-2xl font-black text-stone-900 dark:text-white mb-6">Trip Details</h2>
            
            <form onSubmit={handleGenerate} className="flex flex-col gap-5">
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-widest pl-1">Destination</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input 
                    type="text" 
                    value={formData.destination}
                    onChange={(e) => setFormData({...formData, destination: e.target.value})}
                    placeholder="e.g. Spiti Valley, Manali"
                    className="w-full bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded-2xl pl-12 pr-4 py-3.5 text-stone-900 dark:text-white font-medium focus:outline-none focus:ring-4 focus:ring-[#c8ff00]/20"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-widest pl-1">Duration (Days)</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input 
                      type="number" 
                      min="1" max="14"
                      value={formData.days}
                      onChange={(e) => setFormData({...formData, days: parseInt(e.target.value)})}
                      className="w-full bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded-2xl pl-12 pr-4 py-3.5 text-stone-900 dark:text-white font-medium focus:outline-none focus:ring-4 focus:ring-[#c8ff00]/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-widest pl-1">Budget</label>
                  <div className="relative">
                    <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <select 
                      value={formData.budget}
                      onChange={(e) => setFormData({...formData, budget: e.target.value})}
                      className="w-full bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded-2xl pl-12 pr-4 py-3.5 text-stone-900 dark:text-white font-medium appearance-none focus:outline-none focus:ring-4 focus:ring-[#c8ff00]/20"
                    >
                      <option>Backpacker / Budget</option>
                      <option>Mid-range</option>
                      <option>Luxury</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-widest pl-1">Preferred Vibe</label>
                <div className="relative">
                  <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <select 
                    value={formData.vibe}
                    onChange={(e) => setFormData({...formData, vibe: e.target.value})}
                    className="w-full bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded-2xl pl-12 pr-4 py-3.5 text-stone-900 dark:text-white font-medium appearance-none focus:outline-none focus:ring-4 focus:ring-[#c8ff00]/20"
                  >
                    <option>Adventure & Nature</option>
                    <option>History & Culture</option>
                    <option>Relaxation & Chill</option>
                    <option>Nightlife & Party</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-widest pl-1">Group Size</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <select 
                    value={formData.groupSize}
                    onChange={(e) => setFormData({...formData, groupSize: e.target.value})}
                    className="w-full bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded-2xl pl-12 pr-4 py-3.5 text-stone-900 dark:text-white font-medium appearance-none focus:outline-none focus:ring-4 focus:ring-[#c8ff00]/20"
                  >
                    <option>Solo Traveler</option>
                    <option>Couples</option>
                    <option>Family</option>
                    <option>Friends Group</option>
                  </select>
                </div>
              </div>

              {error && <p className="text-red-500 font-bold text-sm text-center bg-red-50 p-3 rounded-xl">{error}</p>}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-stone-900 dark:bg-white hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900 py-4 rounded-2xl font-black shadow-lg shadow-stone-900/20 transition-all mt-4 disabled:opacity-50 flex items-center justify-center gap-2 group"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>Generate Itinerary <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform text-[#c8ff00] dark:text-[#8ab836]" /></>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-8">
          {loading && !itinerary && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/20">
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 bg-[#c8ff00] rounded-full blur-xl opacity-30 animate-pulse"></div>
                <div className="w-24 h-24 bg-white dark:bg-stone-800 rounded-full flex items-center justify-center shadow-lg border border-stone-100 dark:border-stone-700 z-10 relative">
                  <Compass className="w-10 h-10 text-stone-800 dark:text-white animate-spin-slow" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-stone-800 dark:text-white">Formulating Plan...</h3>
              <p className="text-stone-500 font-medium mt-2 text-center max-w-sm">Our AI is analyzing millions of data points to craft your perfect journey.</p>
            </div>
          )}

          {!loading && !itinerary && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/20 text-center px-6">
              <Map className="w-16 h-16 text-stone-300 dark:text-stone-700 mb-4" />
              <h3 className="text-xl font-bold text-stone-400">Your AI itinerary will appear here</h3>
              <p className="text-stone-400 text-sm mt-2 max-w-sm">Fill out the parameters on the left and hit generate.</p>
            </div>
          )}

          {itinerary && !loading && (
            <div className="animate-in slide-in-from-bottom-8 duration-700">
              <div className="bg-[#c8ff00] p-8 sm:p-10 rounded-t-[2.5rem] text-stone-900 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-20">
                  <Sparkles className="w-64 h-64" />
                </div>
                <h2 className="text-3xl sm:text-5xl font-black tracking-tighter relative z-10 font-serif leading-tight">
                  {itinerary.title}
                </h2>
                <div className="flex gap-4 mt-6 relative z-10">
                  <span className="bg-stone-900 text-[#c8ff00] px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase">
                    {formData.days} Days
                  </span>
                  <span className="bg-white/40 backdrop-blur-md text-stone-900 px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase">
                    {formData.vibe}
                  </span>
                </div>
              </div>
              
              <div className="bg-white dark:bg-stone-900 p-8 sm:p-10 rounded-b-[2.5rem] shadow-xl border border-t-0 border-stone-200 dark:border-stone-800">
                <div className="relative border-l-2 border-stone-100 dark:border-stone-800 ml-4 space-y-12 pb-4">
                  
                  {itinerary.days.map((day, idx) => (
                    <div key={idx} className="relative pl-8 sm:pl-12">
                      <div className="absolute -left-5 top-0 w-10 h-10 bg-stone-900 dark:bg-white text-[#c8ff00] dark:text-stone-900 rounded-full flex items-center justify-center font-black text-lg border-4 border-white dark:border-stone-900 shadow-sm">
                        {day.day}
                      </div>
                      
                      <div className="mb-6">
                        <h3 className="text-2xl font-black text-stone-900 dark:text-white font-serif">{day.theme}</h3>
                        <p className="text-[#8ab836] font-bold text-sm mt-1 bg-[#8ab836]/10 w-fit px-3 py-1 rounded-md border border-[#8ab836]/20">
                          💡 Daily Tip: {day.dailyTip}
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        {day.activities.map((act, i) => (
                          <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 transition-colors">
                            <div className="flex items-center gap-2 text-stone-500 font-bold w-32 shrink-0">
                              <Clock className="w-4 h-4" /> {act.time}
                            </div>
                            <div className="flex-grow text-stone-800 dark:text-stone-200 font-medium">
                              {act.activity}
                            </div>
                            <div className="shrink-0 text-xs font-bold uppercase tracking-widest text-stone-400 bg-white dark:bg-stone-900 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700">
                              Cost: {act.cost}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
