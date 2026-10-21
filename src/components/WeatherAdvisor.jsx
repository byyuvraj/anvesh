import React, { useState, useEffect } from 'react';
import { 
  CloudSun, Sun, Cloud, CloudRain, CloudLightning, Snowflake, Wind, 
  Droplets, Umbrella, CheckCircle2, Circle, Sparkles, Compass, AlertCircle, RefreshCw, Luggage
} from 'lucide-react';
import api from '../lib/api';

export default function WeatherAdvisor({ initialDestination = "Manali", onClose }) {
  const [destination, setDestination] = useState(initialDestination);
  const [query, setQuery] = useState(initialDestination);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [packedItems, setPackedItems] = useState({});

  const fetchWeather = async (dest) => {
    if (!dest?.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/weather?destination=${encodeURIComponent(dest.trim())}`);
      setWeather(data);
      setDestination(data.destination || dest);
    } catch (err) {
      console.error("Weather fetch failed", err);
      setError("Unable to retrieve real-time weather. Showing offline estimation.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(initialDestination);
  }, [initialDestination]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      fetchWeather(query);
    }
  };

  const togglePacked = (tip) => {
    setPackedItems(prev => ({
      ...prev,
      [tip]: !prev[tip]
    }));
  };

  const getWeatherIcon = (icon) => {
    const iconClass = "w-8 h-8 text-[#c8ff00]";
    switch (icon) {
      case 'sun': return <Sun className="w-8 h-8 text-amber-400 animate-spin-slow" />;
      case 'cloud-sun': return <CloudSun className={iconClass} />;
      case 'cloud': return <Cloud className="w-8 h-8 text-stone-300" />;
      case 'cloud-rain': return <CloudRain className="w-8 h-8 text-sky-400" />;
      case 'snowflake': return <Snowflake className="w-8 h-8 text-cyan-200" />;
      case 'cloud-lightning': return <CloudLightning className="w-8 h-8 text-purple-400" />;
      default: return <Wind className={iconClass} />;
    }
  };

  return (
    <div className="w-full bg-stone-900/90 dark:bg-stone-950/90 backdrop-blur-xl border border-stone-800 rounded-[2.5rem] p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#c8ff00]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#c8ff00]/20 border border-[#c8ff00]/40 flex items-center justify-center text-[#c8ff00]">
            <CloudSun className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#c8ff00] uppercase">Meteorological Intelligence</span>
            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              Trip Weather & Packing Forecaster
            </h3>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search destination (e.g. Goa, Ladakh)"
            className="bg-stone-800/80 border border-stone-700 rounded-full px-4 py-2 text-xs text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#c8ff00]"
          />
          <button 
            type="submit"
            disabled={loading}
            className="bg-[#c8ff00] hover:bg-[#b8f200] text-stone-900 px-4 py-2 rounded-full text-xs font-black transition-all flex items-center gap-1 shadow-md disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Check"}
          </button>
        </form>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-stone-400">
          <div className="w-6 h-6 border-2 border-[#c8ff00] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold tracking-wider uppercase animate-pulse">Syncing satellite meteorological forecast...</span>
        </div>
      ) : weather ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
          
          {/* Main Weather Card */}
          <div className="lg:col-span-5 bg-stone-800/60 border border-stone-700/60 rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-stone-400">Current Destination</span>
                  <h4 className="text-2xl font-black text-white tracking-tight mt-0.5">{weather.destination}</h4>
                  <p className="text-xs font-semibold text-[#c8ff00] mt-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> {weather.weatherCondition}
                  </p>
                </div>
                <div className="p-3 bg-stone-900/60 rounded-2xl border border-stone-700/50">
                  {getWeatherIcon(weather.conditionIcon)}
                </div>
              </div>

              <div className="mt-6 flex items-baseline gap-3">
                <span className="text-6xl font-black tracking-tighter text-white font-serif">{weather.temperature}°</span>
                <span className="text-stone-400 text-sm font-medium">Feels like {weather.apparentTemperature}°C</span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-stone-700/50">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-stone-400 flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-sky-400" /> Humidity
                </span>
                <span className="text-sm font-bold text-white mt-1">{weather.humidity}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-stone-400 flex items-center gap-1">
                  <Wind className="w-3 h-3 text-emerald-400" /> Wind
                </span>
                <span className="text-sm font-bold text-white mt-1">{weather.windSpeed} km/h</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-stone-400 flex items-center gap-1">
                  <Umbrella className="w-3 h-3 text-purple-400" /> Rain Risk
                </span>
                <span className="text-sm font-bold text-white mt-1">{weather.rainProbability}%</span>
              </div>
            </div>
          </div>

          {/* Forecast Days + Smart Packing List */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            
            {/* Multi-day Forecast strip */}
            {weather.forecast && weather.forecast.length > 0 && (
              <div className="bg-stone-800/40 border border-stone-700/40 rounded-3xl p-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-3 pl-1">Upcoming Outlook</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {weather.forecast.map((day, idx) => (
                    <div key={idx} className="bg-stone-900/60 border border-stone-800 rounded-2xl p-2.5 text-center flex flex-col items-center">
                      <span className="text-[10px] font-bold text-stone-400">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className="text-xs font-black text-white my-1">{day.maxTemp}° / {day.minTemp}°</span>
                      <span className="text-[9px] text-stone-400 truncate max-w-[80px]">{day.condition}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Smart Dynamic Packing Assistant */}
            <div className="bg-stone-800/40 border border-stone-700/40 rounded-3xl p-5 flex-grow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#c8ff00] flex items-center gap-1.5">
                  <Luggage className="w-3.5 h-3.5" /> AI Recommended Packing Essentials
                </span>
                <span className="text-[10px] text-stone-400">
                  {Object.values(packedItems).filter(Boolean).length} / {weather.packingTips.length} Packed
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {weather.packingTips.map((tip, idx) => {
                  const isChecked = !!packedItems[tip];
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => togglePacked(tip)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all border ${
                        isChecked 
                          ? 'bg-[#c8ff00]/15 border-[#c8ff00]/40 text-white' 
                          : 'bg-stone-900/50 border-stone-800 hover:border-stone-700 text-stone-300'
                      }`}
                    >
                      {isChecked ? (
                        <CheckCircle2 className="w-4 h-4 text-[#c8ff00] flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-stone-500 flex-shrink-0" />
                      )}
                      <span className={`text-xs font-medium ${isChecked ? 'line-through text-stone-300' : ''}`}>
                        {tip}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      ) : null}
    </div>
  );
}
