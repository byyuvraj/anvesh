import React, { useState, useRef } from "react";
import { 
  MapPin, Sparkles, Star, Route, Globe, Users, ArrowRight,
  BookOpen, Utensils, Calendar, Compass, Leaf, Palette, Heart, CheckCircle2, Navigation, CloudLightning, ShieldAlert,
  Volume2
} from "lucide-react";
import { DESTINATIONS } from "../data/mockData";
import { generateCulturalDiscovery, hasApiKey } from "../services/geminiService";
import AnveshAudioVignette from "./AnveshAudioVignette";
import AnveshDynamicMap from "./AnveshDynamicMap";
import { useAuthStore } from "../store/authStore";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";

export default function ExploreView() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [selectedDest, setSelectedDest] = useState(null);
  const [activeResult, setActiveResult] = useState(null);
  const [loadingDiscovery, setLoadingDiscovery] = useState(false);
  const [discoveryError, setDiscoveryError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  
  const resultsRef = useRef(null);
  const searchInputRef = useRef(null);

  const stats = [
    { icon: Route, value: "10K+", label: "Destinations" },
    { icon: Compass, value: "50K+", label: "Experiences" },
    { icon: Globe, value: "120+", label: "Countries" },
    { icon: Users, value: "2M+", label: "Happy Travelers" }
  ];

  const categories = [
    {
      name: "Cultural Heritage",
      desc: "Temples, Forts, Museums & more",
      img: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=400&q=80",
      icon: BookOpen,
      tab: "culture"
    },
    {
      name: "Food Trails",
      desc: "Local Cuisines, Street Food & Cafés",
      img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80",
      icon: Utensils,
      tab: "culture"
    },
    {
      name: "Festivals & Events",
      desc: "Celebrate Traditions & Local Vibes",
      img: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80",
      icon: Calendar,
      tab: "events"
    },
    {
      name: "Hidden Gems",
      desc: "Undiscovered places loved by locals",
      img: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?auto=format&fit=crop&w=400&q=80",
      icon: Compass,
      tab: "destinations"
    },
    {
      name: "Nature Escapes",
      desc: "Beaches, Hills, Lakes & more",
      img: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&q=80",
      icon: Leaf,
      tab: "destinations"
    },
    {
      name: "Art & Crafts",
      desc: "Local Art, Handmade & Workshops",
      img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=400&q=80",
      icon: Palette,
      tab: "culture"
    }
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    triggerDestination(searchInput);
  };

  const triggerDestination = async (name) => {
    setDiscoveryError(null);
    setSelectedDest(name);
    
    // Scroll to placeholder results viewport immediately
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);

    if (hasApiKey()) {
      setLoadingDiscovery(true);
      try {
        const result = await generateCulturalDiscovery(name);
        setActiveResult(result);
      } catch (err) {
        console.error("Gemini API call failed:", err);
        setDiscoveryError(`Gemini API Call Failed: ${err.message || err}. Falling back to pre-cached demo data. Please verify that your VITE_GEMINI_API_KEY in .env is complete and valid.`);
        // Fallback to static mock data
        fallbackToMock(name);
      } finally {
        setLoadingDiscovery(false);
      }
    } else {
      fallbackToMock(name);
    }
  };

  const fallbackToMock = (name) => {
    let key = name.toLowerCase().trim();
    if (key.includes("kyoto")) key = "kyoto, japan";
    else if (key.includes("mumbai")) key = "mumbai, india";
    else key = "kyoto, japan"; // default fallback for clean demo

    setActiveResult(DESTINATIONS[key] || DESTINATIONS["kyoto, japan"]);
  };

  const handleSaveOffline = () => {
    setIsSaving(true);
    setTimeout(() => {
      try {
        localStorage.setItem(`anvesh_cache_${selectedDest}`, JSON.stringify(activeResult || {}));
        setToastMessage("Anvesh Route Saved Successfully! Available 100% Offline.");
      } catch (err) {
        console.error(err);
      } finally {
        setIsSaving(false);
        setTimeout(() => setToastMessage(null), 3500);
      }
    }, 800);
  };

  const handlePublish = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    setIsSaving(true);
    try {
      await api.post('/community/share', {
        destination: activeResult.name || selectedDest,
        data: JSON.stringify(activeResult)
      });
      setToastMessage("Trip published to Community Feed successfully!");
      navigate('/community');
    } catch (err) {
      console.error(err);
      setToastMessage("Failed to publish trip.");
    } finally {
      setIsSaving(false);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const isGenAIActive = hasApiKey() && !discoveryError;

  return (
    <div className="w-full flex flex-col gap-8 sm:gap-12 relative">
      
      {/* Toast Alert Box */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1c1917] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#8ab836]/40 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-[#a2d149] fill-stone-900" />
          <span className="text-xs font-bold tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* 1. Hero Section Container */}
      <div className="relative rounded-2xl overflow-hidden min-h-[580px] bg-stone-900 flex flex-col justify-between p-6 sm:p-8">
        
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80" 
            alt="Udaipur Palace sunrise view"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/85 via-stone-900/50 to-transparent" />
        </div>

        {/* Hand-written text centered in the hero */}
        <div className="absolute top-[8%] left-[52%] z-20 transform -rotate-12 hidden lg:block select-none pointer-events-none">
          <span className="font-handwritten text-xl text-stone-200 tracking-wide block">
            Not just trips, Real experiences!
          </span>
          <svg className="w-12 h-6 text-stone-300 ml-12 mt-1" viewBox="0 0 50 20" fill="none">
            <path d="M2,2 C15,10 35,8 45,18 M40,10 L45,18 L35,18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>





        {/* Hero split layout */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-6">
          <div className="lg:col-span-7 flex flex-col gap-5">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-sans leading-[1.05] text-white tracking-tight">
              Discover Places.<br />
              Experience Cultures.<br />
              <span className="relative inline-block text-[#a2d149]">
                Create Memories.
                <svg className="absolute -bottom-2.5 left-0 w-full h-2 text-[#a2d149]" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0,5 Q50,9 100,5" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </h2>
            
            <p className="text-xs sm:text-sm text-stone-300 max-w-lg font-medium leading-relaxed mt-2">
              Anvesh is your AI travel companion that helps you discover destinations, local culture, hidden gems, events and authentic experiences – tailored just for you.
            </p>

            {/* Input Box Card */}
            <form onSubmit={handleSearchSubmit} className="bg-white rounded-2xl p-4 shadow-xl border border-stone-200/80 mt-2 max-w-xl">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5">
                Where do you want to go?
              </label>
              <div className="flex items-center gap-2">
                <input 
                  ref={searchInputRef}
                  type="text" 
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Ask anything... (e.g. &quot;A 3-day cultural trip in Rajasthan&quot;)" 
                  className="w-full bg-stone-50 border border-stone-200/80 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#8ab836]/45 focus:bg-white focus:shadow-inner font-semibold transition-all duration-300"
                />
                <button 
                  type="submit"
                  className="bg-[#8ab836] hover:bg-[#729c29] hover:shadow-[0_0_12px_rgba(138,184,54,0.45)] text-white p-2.5 rounded-xl transition-all duration-300 cursor-pointer shadow-md shrink-0 hover:scale-105 active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Polaroids */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center min-h-[380px] w-full mt-8 lg:mt-0">

            <div className="relative w-full max-w-[280px] h-[300px]">
              <div className="absolute top-0 right-0 w-[140px] bg-stone-50 p-2 pb-4 rounded-xl shadow-lg border border-stone-200 transform rotate-12 hover:rotate-0 hover:scale-105 hover:z-30 transition-all duration-300 cursor-pointer">
                <div className="aspect-square rounded-lg overflow-hidden bg-stone-200 mb-2 relative">
                  <img src="https://images.unsplash.com/photo-1568849676085-51415703900f?auto=format&fit=crop&w=200&q=80" alt="Pushkar" className="w-full h-full object-cover" />
                  <span className="absolute top-1 left-1 bg-[#8ab836] text-white text-[7px] font-bold px-1.5 py-0.5 rounded">CULTURE</span>
                </div>
                <h5 className="text-[9px] font-bold text-stone-900 leading-none">Pushkar Camel Fair</h5>
              </div>

              <div className="absolute top-4 left-0 w-[130px] bg-stone-50 p-2 pb-4 rounded-xl shadow-lg border border-stone-200 transform -rotate-6 hover:rotate-0 hover:scale-105 hover:z-30 transition-all duration-300 cursor-pointer">
                <div className="aspect-square rounded-lg overflow-hidden bg-stone-200 mb-2 relative">
                  <img src="https://images.unsplash.com/photo-1524230699147-7e6f131d021e?auto=format&fit=crop&w=200&q=80" alt="Hawa Mahal" className="w-full h-full object-cover" />
                  <span className="absolute top-1 left-1 bg-amber-500 text-white text-[7px] font-bold px-1.5 py-0.5 rounded">HERITAGE</span>
                </div>
                <h5 className="text-[9px] font-bold text-stone-900 leading-none">Hawa Mahal</h5>
              </div>


              <div className="absolute top-24 left-24 w-[140px] bg-stone-50 p-2 pb-3 rounded-xl shadow-2xl border border-[#8ab836]/30 transform rotate-6 hover:rotate-0 hover:scale-105 hover:z-30 transition-all duration-300 cursor-pointer">
                <div className="aspect-square rounded-lg overflow-hidden bg-stone-200 mb-2 relative">
                  <img src="https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=200&q=80" alt="Udaipur" className="w-full h-full object-cover" />
                  <span className="absolute top-1 left-1 bg-[#8ab836] text-white text-[7px] font-bold px-1.5 py-0.5 rounded">AI RECOMMENDS</span>
                </div>
                <h5 className="text-[9px] font-extrabold text-[#8ab836] leading-none">Udaipur</h5>
                <button 
                  type="button"
                  onClick={() => triggerDestination("Udaipur")}
                  className="w-full text-center bg-[#8ab836] hover:bg-[#729c29] text-white py-1 rounded-lg text-[8px] font-bold mt-2 flex items-center justify-center gap-0.5 cursor-pointer"
                >
                  <span>Explore Now</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>


          </div>
        </div>
      </div>



      {/* 2.5. DYNAMIC AI CULTURAL DISCOVERY RESULTS PANEL */}
      {selectedDest && (
        <div ref={resultsRef} className="scroll-mt-20 border-2 border-[#8ab836]/30 bg-[#fdfbf7] p-5 sm:p-6 rounded-3xl flex flex-col gap-6 shadow-md transition-all animate-in fade-in zoom-in-95 duration-400">
          
          {loadingDiscovery ? (
            /* Loading Skeleton State while Gemini generates */
            <div className="flex flex-col gap-5 animate-pulse">
              <div className="flex justify-between items-center border-b border-stone-200 pb-4">
                <div className="flex flex-col gap-1.5">
                  <div className="h-5 w-48 bg-stone-300 rounded" />
                  <div className="h-3.5 w-64 bg-stone-200 rounded" />
                </div>
                <div className="h-8 w-32 bg-stone-300 rounded-xl" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 flex flex-col gap-4">
                  <div className="h-28 bg-white border border-stone-200 rounded-2xl p-4" />
                  <div className="h-28 bg-white border border-stone-200 rounded-2xl p-4" />
                </div>
                <div className="lg:col-span-5 h-[280px] bg-stone-200 rounded-2xl" />
              </div>
            </div>
          ) : activeResult ? (
            /* Loaded State */
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
                <div className="flex items-start gap-2.5">
                  <div className="bg-[#8ab836]/15 text-[#8ab836] p-2 rounded-xl">
                    <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: "6s" }} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-stone-900 leading-tight flex items-center gap-2">
                      <span>AI Discovery: {activeResult.name}</span>
                      <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full ${
                        isGenAIActive 
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200" 
                          : "bg-amber-100 text-amber-700 border border-amber-200"
                      }`}>
                        {isGenAIActive ? "Real-time GenAI Active" : "Demo Mode Fallback"}
                      </span>
                    </h3>
                    <span className="text-[10px] text-stone-400 font-bold block mt-0.5">
                      {activeResult.location} • {activeResult.coordinates}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3 mt-4 sm:mt-0">
                  <button 
                    onClick={handlePublish}
                    disabled={isSaving}
                    className="px-4 py-2 border border-blue-500/30 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <span>🌍</span>
                    <span>{isSaving ? "Publishing..." : "Publish"}</span>
                  </button>
                  <button 
                    onClick={handleSaveOffline}
                    disabled={isSaving}
                    className="px-4 py-2 border border-[#8ab836]/30 bg-white hover:bg-stone-50 text-[#8ab836] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <span>💾</span>
                    <span>Save</span>
                  </button>
                </div>
              </div>

              {discoveryError && (
                <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-800 font-bold">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{discoveryError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left side: 3 cards */}
                <div className="lg:col-span-7 flex flex-col gap-5">
                  
                  {/* Card 1: Community Echo */}
                  {activeResult.categories?.["History & Lore"] && (
                    <div className="bg-white border border-stone-200 p-4.5 rounded-2xl shadow-sm flex flex-col gap-2 text-left">
                      <span className="text-[9px] font-bold text-amber-500 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full w-fit uppercase">
                        Community Echo (Local Lore)
                      </span>
                      <h4 className="text-xs font-extrabold text-stone-900 leading-tight mt-1">
                        {activeResult.categories["History & Lore"].title}
                      </h4>
                      <p className="text-[10px] text-stone-600 font-medium leading-relaxed">
                        {activeResult.categories["History & Lore"].story}
                      </p>
                      <div className="border-t border-stone-100 pt-3 mt-1 text-[9px] text-stone-500 font-semibold leading-relaxed">
                        <strong>Witness:</strong> {activeResult.categories["History & Lore"].witness}<br />
                        <strong>Directions:</strong> {activeResult.categories["History & Lore"].directions}
                      </div>
                    </div>
                  )}

                  {/* Card 2: Living Canvas */}
                  {(activeResult.categories?.["Culinary Roots"] || activeResult.categories?.["Crafts & Art"]) && (
                    <div className="bg-white border border-stone-200 p-4.5 rounded-2xl shadow-sm flex flex-col gap-2 text-left">
                      <span className="text-[9px] font-bold text-orange-500 bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full w-fit uppercase">
                        Living Canvas (Tradition)
                      </span>
                      <h4 className="text-xs font-extrabold text-stone-900 leading-tight mt-1">
                        {activeResult.categories["Culinary Roots"]?.title || activeResult.categories["Crafts & Art"]?.title}
                      </h4>
                      <p className="text-[10px] text-stone-600 font-medium leading-relaxed">
                        {activeResult.categories["Culinary Roots"]?.story || activeResult.categories["Crafts & Art"]?.story}
                      </p>
                      <div className="border-t border-stone-100 pt-3 mt-1 text-[9px] text-stone-500 font-semibold leading-relaxed">
                        <strong>Cost Info:</strong> {activeResult.categories["Culinary Roots"]?.costLabel || activeResult.categories["Crafts & Art"]?.costLabel}
                      </div>
                    </div>
                  )}

                  {/* Card 3: Immersive Audio Vignette (Active TTS) */}
                  {activeResult.categories?.["History & Lore"] && (
                    <AnveshAudioVignette 
                      audioTitle={activeResult.categories["History & Lore"].audioTitle}
                      audioScript={activeResult.categories["History & Lore"].audioScript}
                    />
                  )}

                </div>

                {/* Right side: Dynamic Map Viewport */}
                <div className="lg:col-span-5">
                  <AnveshDynamicMap destinationName={activeResult.name} />
                </div>

              </div>
            </>
          ) : (
            <div className="text-center py-6 text-stone-400 font-semibold text-xs">
              Unable to generate discovery report. Please try again.
            </div>
          )}

        </div>
      )}

      {/* 3. Interest & AI Planner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900">Explore by Interest</h3>
              <p className="text-[10px] text-stone-400 font-bold leading-none mt-1">Fine-tuned categories for cultural discovery</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button 
                  key={cat.name} 
                  type="button"
                  onClick={() => {
                    const destName = activeResult ? activeResult.name : (selectedDest || "Kyoto, Japan");
                    setSearchInput(`${cat.name} in ${destName}`);
                    triggerDestination(`${cat.name} in ${destName}`);
                  }}
                  className="group text-left cursor-pointer bg-white border border-stone-200/60 rounded-2xl overflow-hidden hover:border-[#8ab836]/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-[#8ab836]/40"
                  aria-label={`Search for ${cat.name} in ${activeResult ? activeResult.name : (selectedDest || "Kyoto, Japan")}`}
                >
                  <div className="aspect-[4/3] w-full overflow-hidden relative">
                    <img 
                      src={cat.img} 
                      alt={cat.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-[#8ab836] text-white p-1.5 rounded-full border border-white/20 shadow flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="text-xs font-bold text-stone-900 leading-tight group-hover:text-[#8ab836] transition-colors">{cat.name}</h4>
                    <p className="text-[9px] text-stone-500 font-semibold mt-0.5 line-clamp-1">{cat.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col justify-between bg-[#8ab836]/10 border border-[#8ab836]/20 rounded-3xl p-5 shadow-sm">
          <div>
            <h3 className="text-sm font-extrabold text-stone-900">Let AI handle the plan,</h3>
            <h3 className="text-sm font-extrabold text-[#8ab836] mt-0.5">you enjoy the journey.</h3>
            
            <div className="flex flex-col gap-4 mt-6">
              <div className="flex gap-3 items-start">
                <div className="p-2 rounded-xl bg-white text-[#8ab836] border border-[#8ab836]/20 flex items-center justify-center shrink-0">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900 leading-none">Personalized Itineraries</h4>
                  <p className="text-[9px] text-stone-500 font-semibold mt-1">Made just for you</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="p-2 rounded-xl bg-white text-[#8ab836] border border-[#8ab836]/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900 leading-none">Smart Recommendations</h4>
                  <p className="text-[9px] text-stone-500 font-semibold mt-1">AI that understands you</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="p-2 rounded-xl bg-white text-[#8ab836] border border-[#8ab836]/20 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900 leading-none">Local Experiences</h4>
                  <p className="text-[9px] text-stone-500 font-semibold mt-1">Authentic & Unique</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="p-2 rounded-xl bg-white text-[#8ab836] border border-[#8ab836]/20 flex items-center justify-center shrink-0">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900 leading-none">Speech Narration (TTS)</h4>
                  <p className="text-[9px] text-stone-500 font-semibold mt-1">Listen to immersive local history audio guides</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="p-2 rounded-xl bg-white text-[#8ab836] border border-[#8ab836]/20 flex items-center justify-center shrink-0">
                  <Route className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900 leading-none">Comfort & Accessibility Paths</h4>
                  <p className="text-[9px] text-stone-500 font-semibold mt-1">Find custom routes mapped to comfort levels</p>
                </div>
              </div>
            </div>
          </div>

          <button 
            type="button"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setTimeout(() => {
                if (searchInputRef.current) {
                  searchInputRef.current.focus();
                }
              }, 400);
            }}
            className="w-full py-2.5 mt-6 bg-[#8ab836] hover:bg-[#729c29] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow cursor-pointer"
          >
            <span>Plan with AI</span>
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>



    </div>
  );
}
