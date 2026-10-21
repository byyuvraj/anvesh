import React, { useState, useEffect } from 'react';
import { 
  Loader2, Sparkles, MapPin, Calendar, Wallet, Users, Zap, Compass, 
  Clock, Map, Bookmark, CheckCircle2, Circle, Printer, Trash2, ArrowRight,
  CloudSun, DollarSign, Share2, Check, RefreshCw
} from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import WeatherAdvisor from '../WeatherAdvisor';

export default function SmartItinerary() {
  const { isAuthenticated, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('planner'); // 'planner' or 'saved'
  
  const [formData, setFormData] = useState({
    destination: '',
    days: 3,
    vibe: 'Adventure & Nature',
    budget: 'Mid-range',
    groupSize: 'Couples'
  });
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [activeItineraryId, setActiveItineraryId] = useState(null);
  const [error, setError] = useState('');
  const [savingTrip, setSavingTrip] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [checkedActivities, setCheckedActivities] = useState({});
  const [currency, setCurrency] = useState('INR'); // 'INR' | 'USD'
  
  // Saved Itineraries state
  const [savedTrips, setSavedTrips] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [showWeather, setShowWeather] = useState(false);

  // Quick destinations for inspiration
  const popularSpots = ["Spiti Valley", "Jaipur", "Goa", "Munnar", "Varanasi", "Manali"];

  // Fetch saved itineraries
  const fetchSavedItineraries = async () => {
    if (!isAuthenticated) return;
    setLoadingSaved(true);
    try {
      const { data } = await api.get('/itineraries');
      setSavedTrips(data);
    } catch (err) {
      console.error("Failed to load saved trips", err);
    } finally {
      setLoadingSaved(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedItineraries();
    }
  }, [isAuthenticated]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.destination) return;
    setLoading(true);
    setError('');
    setIsSaved(false);
    setActiveItineraryId(null);
    setCheckedActivities({});
    
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

  // Toggle checklist activity
  const toggleActivity = async (dayIndex, actIndex) => {
    const key = `${dayIndex}-${actIndex}`;
    const updated = {
      ...checkedActivities,
      [key]: !checkedActivities[key]
    };
    setCheckedActivities(updated);

    // If active itinerary is saved in DB, sync progress
    if (activeItineraryId) {
      try {
        await api.put(`/itineraries/${activeItineraryId}`, {
          data: {
            ...itinerary,
            checkedActivities: updated
          }
        });
      } catch (e) {
        console.warn("Failed to auto-save checklist progress", e);
      }
    }
  };

  // Save current itinerary to cloud
  const handleSaveItinerary = async () => {
    if (!isAuthenticated) {
      alert("Please login to save your trips to your profile.");
      return;
    }
    if (!itinerary) return;

    setSavingTrip(true);
    try {
      const payload = {
        destination: formData.destination,
        title: itinerary.title,
        days: formData.days,
        vibe: formData.vibe,
        budget: formData.budget,
        data: {
          ...itinerary,
          checkedActivities
        }
      };

      const { data } = await api.post('/itineraries', payload);
      setActiveItineraryId(data.id);
      setIsSaved(true);
      fetchSavedItineraries();
    } catch (err) {
      console.error("Save error:", err);
      alert("Could not save itinerary. Please try again.");
    } finally {
      setSavingTrip(false);
    }
  };

  // Delete saved trip
  const handleDeleteTrip = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this itinerary?")) return;
    try {
      await api.delete(`/itineraries/${id}`);
      setSavedTrips(prev => prev.filter(t => t.id !== id));
      if (activeItineraryId === id) {
        setActiveItineraryId(null);
        setIsSaved(false);
      }
    } catch (err) {
      console.error("Delete trip error", err);
    }
  };

  // Load a saved trip into active view
  const loadSavedTrip = (trip) => {
    const parsed = trip.parsedData || {};
    setItinerary(parsed);
    setActiveItineraryId(trip.id);
    setIsSaved(true);
    setFormData({
      destination: trip.destination,
      days: trip.days || 3,
      vibe: trip.vibe || 'Adventure',
      budget: trip.budget || 'Mid-range',
      groupSize: 'Solo'
    });
    setCheckedActivities(parsed.checkedActivities || {});
    setActiveTab('planner');
  };

  // Calculate total activities and completed count
  const allActivitiesCount = itinerary?.days?.reduce((sum, d) => sum + (d.activities?.length || 0), 0) || 0;
  const completedActivitiesCount = Object.values(checkedActivities).filter(Boolean).length;
  const progressPercent = allActivitiesCount > 0 ? Math.round((completedActivitiesCount / allActivitiesCount) * 100) : 0;

  // Estimated budget calculator
  const estimateTotalBudget = () => {
    const baseDaily = formData.budget === 'Luxury' ? 12000 : formData.budget === 'Mid-range' ? 5000 : 2200;
    const rateMultiplier = currency === 'USD' ? 0.012 : 1;
    const total = baseDaily * (formData.days || 3) * rateMultiplier;
    return Math.round(total);
  };

  const totalEst = estimateTotalBudget();
  const currencySymbol = currency === 'USD' ? '$' : '₹';

  return (
    <div className="w-full max-w-6xl mx-auto mt-4 px-4 sm:px-6 lg:px-8 pb-20 animate-in fade-in duration-700">
      
      {/* Header section */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-[#8ab836] to-[#c8ff00] mb-6 shadow-xl shadow-[#c8ff00]/20">
          <Sparkles className="w-10 h-10 text-stone-900" />
        </div>
        <h1 className="text-5xl font-black text-stone-900 dark:text-white tracking-tighter mb-4 font-serif">
          Smart Travel Planner
        </h1>
        <p className="text-lg text-stone-500 dark:text-stone-400 font-medium max-w-2xl mx-auto">
          AI-generated personalized day-by-day itineraries with live progress tracking, budget breakdown, and cloud trip saving.
        </p>

        {/* Tab Switcher */}
        <div className="inline-flex items-center bg-stone-100 dark:bg-stone-900 p-1.5 rounded-full border border-stone-200 dark:border-stone-800 mt-8 shadow-inner">
          <button 
            onClick={() => setActiveTab('planner')}
            className={`px-6 py-2.5 rounded-full text-xs font-black transition-all ${
              activeTab === 'planner'
                ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-md'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            AI Generator
          </button>
          <button 
            onClick={() => {
              setActiveTab('saved');
              fetchSavedItineraries();
            }}
            className={`px-6 py-2.5 rounded-full text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === 'saved'
                ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-md'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <span>My Saved Trips</span>
            {savedTrips.length > 0 && (
              <span className="bg-[#c8ff00] text-stone-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                {savedTrips.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'saved' ? (
        /* Saved Itineraries View */
        <div className="w-full">
          {!isAuthenticated ? (
            <div className="bg-stone-50 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800 rounded-3xl p-12 text-center max-w-lg mx-auto">
              <Compass className="w-12 h-12 text-stone-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-stone-800 dark:text-stone-200 mb-2">Sign in to sync your trips</h3>
              <p className="text-sm text-stone-500 mb-6">Create an account or login to save your custom itineraries and check off spots as you explore.</p>
              <a href="/login" className="bg-[#c8ff00] hover:bg-[#b8f200] text-stone-900 px-6 py-3 rounded-full font-bold text-xs inline-block shadow-md">
                Sign In
              </a>
            </div>
          ) : loadingSaved ? (
            <div className="py-20 flex flex-col items-center justify-center text-stone-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#c8ff00]" />
              <span className="text-sm font-semibold">Loading your saved itineraries...</span>
            </div>
          ) : savedTrips.length === 0 ? (
            <div className="bg-stone-50 dark:bg-stone-900/40 border border-dashed border-stone-300 dark:border-stone-800 rounded-3xl p-16 text-center max-w-md mx-auto">
              <Bookmark className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-stone-700 dark:text-stone-300 mb-1">No saved trips yet</h3>
              <p className="text-xs text-stone-500 mb-6">Generate an itinerary using the AI Generator and click "Save Trip to Cloud" to keep it here.</p>
              <button 
                onClick={() => setActiveTab('planner')}
                className="bg-stone-900 dark:bg-white text-white dark:text-stone-900 px-6 py-2.5 rounded-full text-xs font-bold shadow-md hover:scale-105 transition-all"
              >
                Plan a New Trip
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedTrips.map(trip => {
                const parsed = trip.parsedData || {};
                const totalActs = parsed.days?.reduce((sum, d) => sum + (d.activities?.length || 0), 0) || 0;
                const completedActs = Object.values(parsed.checkedActivities || {}).filter(Boolean).length;
                const pct = totalActs > 0 ? Math.round((completedActs / totalActs) * 100) : 0;

                return (
                  <div 
                    key={trip.id}
                    onClick={() => loadSavedTrip(trip)}
                    className="apple-glass-solid p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-[#c8ff00]/20 text-stone-900 dark:text-[#c8ff00] px-2.5 py-0.5 rounded-full">
                          <MapPin className="w-3 h-3" /> {trip.destination}
                        </span>
                        <button 
                          onClick={(e) => handleDeleteTrip(trip.id, e)}
                          className="text-stone-400 hover:text-red-500 p-1 rounded-full transition-colors"
                          title="Delete trip"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <h4 className="text-lg font-black text-stone-900 dark:text-white group-hover:text-[#8ab836] transition-colors leading-snug">
                        {trip.title}
                      </h4>

                      <div className="flex items-center gap-3 text-xs text-stone-500 mt-2 font-medium">
                        <span>{trip.days} Days</span>
                        <span>•</span>
                        <span>{trip.vibe || 'Balanced'}</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800">
                      <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                        <span className="text-stone-500">Trip Progress</span>
                        <span className="text-[#8ab836] dark:text-[#c8ff00]">{pct}% ({completedActs}/{totalActs})</span>
                      </div>
                      <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-[#8ab836] to-[#c8ff00] h-full rounded-full transition-all duration-500" 
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-bold text-stone-400 mt-4 group-hover:text-stone-900 dark:group-hover:text-white transition-colors">
                        <span>Resume trip details</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Planner Form + Results View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="apple-glass-solid p-6 sm:p-8 rounded-[2.5rem] shadow-xl border border-white dark:border-stone-800">
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
                      placeholder="e.g. Spiti Valley, Manali, Goa"
                      className="w-full bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded-2xl pl-12 pr-4 py-3.5 text-stone-900 dark:text-white font-medium focus:outline-none focus:ring-4 focus:ring-[#c8ff00]/20"
                      required
                    />
                  </div>

                  {/* Inspiration chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {popularSpots.map((spot) => (
                      <button
                        key={spot}
                        type="button"
                        onClick={() => setFormData({ ...formData, destination: spot })}
                        className="text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-[#c8ff00] hover:text-stone-900 px-2.5 py-1 rounded-full transition-colors border border-stone-200 dark:border-stone-700"
                      >
                        {spot}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-widest pl-1">Days</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                      <input 
                        type="number" 
                        min="1" max="14"
                        value={formData.days}
                        onChange={(e) => setFormData({...formData, days: parseInt(e.target.value) || 1})}
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
                      <option>Food & Culinary Walks</option>
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
                  className="w-full bg-stone-900 dark:bg-white hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900 py-4 rounded-2xl font-black shadow-lg shadow-stone-900/20 transition-all mt-2 disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                    <>Generate Itinerary <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform text-[#c8ff00] dark:text-[#8ab836]" /></>
                  )}
                </button>
              </form>
            </div>

            {/* Quick Weather Forecast toggle */}
            {formData.destination && (
              <button 
                type="button"
                onClick={() => setShowWeather(!showWeather)}
                className="apple-glass-solid p-4 rounded-2xl flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-300 hover:border-[#c8ff00] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <CloudSun className="w-4 h-4 text-[#8ab836]" /> {showWeather ? "Hide Weather Forecaster" : `Check ${formData.destination} Weather & Packing`}
                </span>
                <span className="text-[10px] text-stone-400">{showWeather ? '▲' : '▼'}</span>
              </button>
            )}

            {showWeather && formData.destination && (
              <WeatherAdvisor initialDestination={formData.destination} />
            )}
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8">
            {loading && !itinerary && (
              <div className="h-full min-h-[450px] flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/20">
                <div className="relative w-24 h-24 mb-6">
                  <div className="absolute inset-0 bg-[#c8ff00] rounded-full blur-xl opacity-30 animate-pulse"></div>
                  <div className="w-24 h-24 bg-white dark:bg-stone-800 rounded-full flex items-center justify-center shadow-lg border border-stone-100 dark:border-stone-700 z-10 relative">
                    <Compass className="w-10 h-10 text-stone-800 dark:text-white animate-spin-slow" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-stone-800 dark:text-white">Formulating Plan...</h3>
                <p className="text-stone-500 font-medium mt-2 text-center max-w-sm">Gemini is synthesizing geographic context, optimal daily routes, and authentic community recommendations.</p>
              </div>
            )}

            {!loading && !itinerary && (
              <div className="h-full min-h-[450px] flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/20 text-center px-6">
                <Map className="w-16 h-16 text-stone-300 dark:text-stone-700 mb-4" />
                <h3 className="text-xl font-bold text-stone-400">Your AI itinerary will appear here</h3>
                <p className="text-stone-400 text-sm mt-2 max-w-sm">Choose a destination, trip length, and vibe, then click Generate Itinerary.</p>
              </div>
            )}

            {itinerary && !loading && (
              <div className="animate-in slide-in-from-bottom-8 duration-700">
                
                {/* Header Banner */}
                <div className="bg-[#c8ff00] p-8 sm:p-10 rounded-t-[2.5rem] text-stone-900 relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-20 pointer-events-none">
                    <Sparkles className="w-64 h-64" />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 relative z-10">
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-stone-900 text-[#c8ff00] px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase shadow-sm">
                        {formData.days} Days
                      </span>
                      <span className="bg-stone-900/10 backdrop-blur-md text-stone-900 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase">
                        {formData.vibe}
                      </span>
                      <span className="bg-stone-900/10 backdrop-blur-md text-stone-900 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase">
                        {formData.budget}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleSaveItinerary}
                        disabled={savingTrip}
                        className={`px-4 py-2 rounded-full text-xs font-black transition-all flex items-center gap-1.5 shadow-md ${
                          isSaved 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-stone-900 hover:bg-stone-800 text-white'
                        }`}
                      >
                        {savingTrip ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : isSaved ? (
                          <><Check className="w-3.5 h-3.5" /> Saved to Trips</>
                        ) : (
                          <><Bookmark className="w-3.5 h-3.5" /> Save Trip</>
                        )}
                      </button>

                      <button 
                        onClick={() => window.print()}
                        className="bg-white/80 hover:bg-white text-stone-900 p-2 rounded-full text-xs font-bold shadow-sm transition-all"
                        title="Print / Save as PDF Pass"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h2 className="text-3xl sm:text-5xl font-black tracking-tighter relative z-10 font-serif leading-tight">
                    {itinerary.title}
                  </h2>

                  {/* Progress Indicator */}
                  <div className="mt-6 pt-4 border-t border-stone-900/15 relative z-10">
                    <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                      <span>Live Journey Checklist</span>
                      <span>{completedActivitiesCount} of {allActivitiesCount} spots visited ({progressPercent}%)</span>
                    </div>
                    <div className="w-full bg-stone-900/15 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-stone-900 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Body Content */}
                <div className="bg-white dark:bg-stone-900 p-8 sm:p-10 rounded-b-[2.5rem] shadow-xl border border-t-0 border-stone-200 dark:border-stone-800 space-y-10">
                  
                  {/* Budget & Cost Tracker Panel */}
                  <div className="bg-stone-50 dark:bg-stone-950 p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-[#8ab836]" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-stone-800 dark:text-stone-200">
                          Estimated Trip Budget Breakdown
                        </h4>
                      </div>
                      <div className="flex items-center gap-1 bg-stone-200 dark:bg-stone-800 p-1 rounded-full text-xs font-bold">
                        <button 
                          onClick={() => setCurrency('INR')}
                          className={`px-2.5 py-0.5 rounded-full ${currency === 'INR' ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm' : 'text-stone-500'}`}
                        >
                          INR (₹)
                        </button>
                        <button 
                          onClick={() => setCurrency('USD')}
                          className={`px-2.5 py-0.5 rounded-full ${currency === 'USD' ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm' : 'text-stone-500'}`}
                        >
                          USD ($)
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="bg-white dark:bg-stone-900 p-3 rounded-2xl border border-stone-200 dark:border-stone-800">
                        <span className="text-[10px] text-stone-400 font-bold uppercase block">Stay (35%)</span>
                        <span className="text-base font-black text-stone-800 dark:text-white mt-1 block">
                          {currencySymbol}{Math.round(totalEst * 0.35).toLocaleString()}
                        </span>
                      </div>
                      <div className="bg-white dark:bg-stone-900 p-3 rounded-2xl border border-stone-200 dark:border-stone-800">
                        <span className="text-[10px] text-stone-400 font-bold uppercase block">Food (25%)</span>
                        <span className="text-base font-black text-stone-800 dark:text-white mt-1 block">
                          {currencySymbol}{Math.round(totalEst * 0.25).toLocaleString()}
                        </span>
                      </div>
                      <div className="bg-white dark:bg-stone-900 p-3 rounded-2xl border border-stone-200 dark:border-stone-800">
                        <span className="text-[10px] text-stone-400 font-bold uppercase block">Activities (25%)</span>
                        <span className="text-base font-black text-stone-800 dark:text-white mt-1 block">
                          {currencySymbol}{Math.round(totalEst * 0.25).toLocaleString()}
                        </span>
                      </div>
                      <div className="bg-white dark:bg-stone-900 p-3 rounded-2xl border border-stone-200 dark:border-stone-800">
                        <span className="text-[10px] text-stone-400 font-bold uppercase block">Transit (15%)</span>
                        <span className="text-base font-black text-stone-800 dark:text-white mt-1 block">
                          {currencySymbol}{Math.round(totalEst * 0.15).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Day by Day Plan */}
                  <div className="relative border-l-2 border-stone-200 dark:border-stone-800 ml-4 space-y-12 pb-4">
                    
                    {itinerary.days.map((day, dIdx) => (
                      <div key={dIdx} className="relative pl-8 sm:pl-12">
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
                          {day.activities.map((act, aIdx) => {
                            const isChecked = !!checkedActivities[`${dIdx}-${aIdx}`];

                            return (
                              <div 
                                key={aIdx} 
                                onClick={() => toggleActivity(dIdx, aIdx)}
                                className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 p-4 rounded-2xl border transition-all cursor-pointer ${
                                  isChecked 
                                    ? 'bg-[#c8ff00]/10 border-[#c8ff00]/40' 
                                    : 'bg-stone-50 dark:bg-stone-800/50 border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-600'
                                }`}
                              >
                                <div className="flex items-center gap-3 shrink-0">
                                  {isChecked ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-stone-400 shrink-0" />
                                  )}
                                  <div className="flex items-center gap-2 text-stone-500 font-bold w-28 shrink-0 text-sm">
                                    <Clock className="w-3.5 h-3.5" /> {act.time}
                                  </div>
                                </div>

                                <div className={`flex-grow font-medium text-sm sm:text-base ${
                                  isChecked ? 'line-through text-stone-400' : 'text-stone-800 dark:text-stone-200'
                                }`}>
                                  {act.activity}
                                </div>

                                <div className="shrink-0 text-xs font-bold uppercase tracking-widest text-stone-400 bg-white dark:bg-stone-900 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 self-start sm:self-auto">
                                  Cost: {act.cost}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
