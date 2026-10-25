import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import { 
  Search, MapPin, Compass, MessageCircle, Navigation, Sparkles, 
  PenTool, Heart, Bookmark, TrendingUp, Clock, CloudSun, Gem, Flame, Layers
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import parse from 'html-react-parser';
import CoverImage from './CoverImage';
import WeatherAdvisor from '../WeatherAdvisor';

const LocationInsight = ({ locationId }) => {
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        const { data } = await api.get(`/locations/${locationId}/insights`);
        setInsight(data.summary);
      } catch (err) {
        console.error(err);
        setInsight('<p>Failed to load AI insights.</p>');
      } finally {
        setLoading(false);
      }
    };
    fetchInsight();
  }, [locationId]);

  return (
    <div className="mb-8 p-6 rounded-3xl bg-gradient-to-br from-stone-900 to-stone-800 dark:from-stone-800 dark:to-stone-900 border border-[#8ab836]/30 shadow-lg relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#c8ff00] opacity-5 rounded-full filter blur-2xl group-hover:opacity-10 transition-opacity"></div>
      
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-[#c8ff00]" />
        <h3 className="text-[#c8ff00] font-black tracking-widest uppercase text-sm">AI Community Summary</h3>
      </div>
      
      {loading ? (
        <div className="flex items-center gap-3 text-stone-400">
          <div className="w-4 h-4 border-2 border-[#c8ff00] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium animate-pulse">Gemini is analyzing community data...</span>
        </div>
      ) : (
        <div className="text-stone-200 prose prose-invert prose-p:leading-relaxed prose-a:text-[#c8ff00] prose-a:no-underline hover:prose-a:underline prose-h3:text-white prose-h3:text-xl prose-h3:font-black prose-h3:mb-3 prose-h4:text-[#c8ff00] prose-li:text-stone-300 max-w-none">
          {parse(insight)}
        </div>
      )}
    </div>
  );
};

export default function ExploreCommunity() {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [generalFeed, setGeneralFeed] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);

  // Personalized Recommendation Shelves
  const [shelves, setShelves] = useState({
    curatedForYou: [],
    hiddenGems: [],
    trending: [],
    basedOnActivity: []
  });
  const [loadingShelves, setLoadingShelves] = useState(true);

  // Active Collection Tab: 'curated' | 'gems' | 'trending' | 'all'
  const [activeCollection, setActiveCollection] = useState('curated');
  
  // Vibe & Sorting state for 'all' feed
  const [activeVibe, setActiveVibe] = useState('all');
  const [activeSort, setActiveSort] = useState('match'); // 'match' | 'popular' | 'recent'
  const [showWeatherDrawer, setShowWeatherDrawer] = useState(false);

  const vibeCategories = [
    { id: 'all', label: 'All Stories' },
    { id: 'adventure', label: '⛰️ Adventure & Treks' },
    { id: 'culture', label: '🏛️ Heritage & Lore' },
    { id: 'food', label: '🍜 Culinary Walks' },
    { id: 'nature', label: '🌿 Nature & Wildlife' },
    { id: 'relaxation', label: '🏖️ Chill & Scenic' },
    { id: 'budget', label: '🎒 Solo / Backpacker' }
  ];

  // If not authenticated or not onboarded, redirect logic
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    } else if (user && !user.onboardingComplete) {
      navigate('/onboarding');
    }
  }, [user, isAuthenticated, navigate]);

  // Fetch Personalized Shelves
  const fetchShelves = async () => {
    setLoadingShelves(true);
    try {
      const url = user?.id ? `/recommendations/personalized?userId=${user.id}` : '/recommendations/personalized';
      const { data } = await api.get(url);
      setShelves(data);
    } catch (err) {
      console.error("Failed to fetch recommendation shelves", err);
    } finally {
      setLoadingShelves(false);
    }
  };

  useEffect(() => {
    fetchShelves();
  }, [user]);

  // Load feed based on activeVibe and activeSort
  const fetchFeed = async () => {
    setLoadingFeed(true);
    try {
      const params = new URLSearchParams();
      if (user?.id) params.append('userId', user.id);
      if (activeVibe && activeVibe !== 'all') params.append('vibe', activeVibe);
      if (activeSort) params.append('sort', activeSort);

      const { data } = await api.get(`/blogs?${params.toString()}`);
      setGeneralFeed(data);
    } catch (err) {
      console.error("Failed to fetch feed", err);
    } finally {
      setLoadingFeed(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [activeVibe, activeSort, user]);

  // Debounced Search Effect
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setRecommendations([]);
        return;
      }
      setIsSearching(true);
      try {
        const { data } = await api.get(`/recommendations?query=${encodeURIComponent(searchQuery.trim())}`);
        setRecommendations(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  // Helper to update blog in both states
  const updateBlogInStates = (blogId, updateFn) => {
    setGeneralFeed(prev => prev.map(b => b.id === blogId ? updateFn(b) : b));
    setShelves(prev => ({
      curatedForYou: prev.curatedForYou?.map(b => b.id === blogId ? updateFn(b) : b) || [],
      hiddenGems: prev.hiddenGems?.map(b => b.id === blogId ? updateFn(b) : b) || [],
      trending: prev.trending?.map(b => b.id === blogId ? updateFn(b) : b) || [],
      basedOnActivity: prev.basedOnActivity?.map(b => b.id === blogId ? updateFn(b) : b) || []
    }));
  };

  // Like toggle on card
  const handleToggleLike = async (blogId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return navigate('/login');

    updateBlogInStates(blogId, b => {
      const isLiked = !b.isLiked;
      const likesCount = isLiked ? (b.likesCount || 0) + 1 : Math.max(0, (b.likesCount || 0) - 1);
      return { ...b, isLiked, likesCount };
    });

    try {
      const { data } = await api.post(`/blogs/${blogId}/like`);
      updateBlogInStates(blogId, b => ({ ...b, isLiked: data.liked, likesCount: data.likeCount }));
    } catch (err) {
      console.error(err);
    }
  };

  // Bookmark toggle on card
  const handleToggleBookmark = async (blogId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return navigate('/login');

    updateBlogInStates(blogId, b => ({ ...b, isBookmarked: !b.isBookmarked }));

    try {
      const { data } = await api.post(`/blogs/${blogId}/bookmark`);
      updateBlogInStates(blogId, b => ({ ...b, isBookmarked: data.bookmarked }));
    } catch (err) {
      console.error(err);
    }
  };

  // Determine which list to display in the main card grid
  const getActiveDisplayList = () => {
    if (activeCollection === 'curated') {
      return shelves.curatedForYou?.length > 0 ? shelves.curatedForYou : generalFeed;
    }
    if (activeCollection === 'gems') {
      return shelves.hiddenGems?.length > 0 ? shelves.hiddenGems : generalFeed;
    }
    if (activeCollection === 'trending') {
      return shelves.trending?.length > 0 ? shelves.trending : generalFeed;
    }
    return generalFeed;
  };

  const renderBlogCard = (blog, isFeatured = false) => {
    const colSpan = isFeatured ? "md:col-span-12 lg:col-span-8" : "md:col-span-6 lg:col-span-4";
    const imageHeight = isFeatured ? "h-[360px] sm:h-[420px]" : "h-60";

    return (
      <Link 
        key={blog.id} 
        to={`/blog/${blog.id}`} 
        className={`group relative rounded-[2rem] overflow-hidden transition-all duration-500 flex flex-col ${colSpan} bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:shadow-2xl hover:-translate-y-1.5`}
      >
        <div className={`${imageHeight} w-full overflow-hidden relative`}>
          <CoverImage 
            src={blog.coverImage} 
            alt={blog.title} 
            locationName={blog.location?.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out" 
          />
          
          {/* Top Badges (Location & AI Match) */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
            {blog.matchScore ? (
              <span className="pointer-events-auto bg-stone-900/95 backdrop-blur-md text-[#c8ff00] border border-[#c8ff00]/40 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
                <Sparkles className="w-3 h-3 text-[#c8ff00]" /> {blog.matchScore}% Match
              </span>
            ) : <span />}

            {blog.location && (
              <div className="pointer-events-auto bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-md border border-white/20 dark:border-stone-700">
                <MapPin className="w-3 h-3 text-[#8ab836]" />
                <span className="text-[10px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  {blog.location.name}
                </span>
              </div>
            )}
          </div>

          {/* Quick Bookmark Button on Image */}
          <button 
            type="button"
            onClick={(e) => handleToggleBookmark(blog.id, e)}
            className={`absolute bottom-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all shadow-md ${
              blog.isBookmarked 
                ? 'bg-[#c8ff00] text-stone-900 shadow-[#c8ff00]/30' 
                : 'bg-black/50 text-white hover:bg-black/80'
            }`}
            title={blog.isBookmarked ? "Saved in Bucket List" : "Add to Bucket List"}
          >
            <Bookmark className={`w-3.5 h-3.5 ${blog.isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="p-6 flex flex-col flex-grow relative z-10">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-full uppercase tracking-wider">
              @{blog.user?.username || 'traveler'}
            </span>
            <div className="flex items-center gap-2 text-[10px] text-stone-400 font-semibold">
              {blog.readingTime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {blog.readingTime}m
                </span>
              )}
              <span>•</span>
              <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Match Reason Banner if available */}
          {blog.matchReason && (
            <div className="mb-2.5 flex items-center gap-1.5 text-[11px] font-bold text-[#8ab836] dark:text-[#c8ff00] bg-[#8ab836]/10 dark:bg-[#c8ff00]/10 px-3 py-1 rounded-full w-fit max-w-full">
              <Sparkles className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{blog.matchReason}</span>
            </div>
          )}

          <h3 className="font-black text-xl sm:text-2xl text-stone-900 dark:text-white leading-tight group-hover:text-[#8ab836] dark:group-hover:text-[#c8ff00] transition-colors font-serif line-clamp-2">
            {blog.title}
          </h3>

          <div className="mt-3 text-xs sm:text-sm text-stone-600 dark:text-stone-400 line-clamp-2 font-serif flex-grow leading-relaxed">
            {blog.richContent.replace(/<[^>]+>/g, '')}
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {blog.tags.slice(0, 3).map((t, idx) => (
                <span key={idx} className="text-[10px] font-bold text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800/80 px-2 py-0.5 rounded-md">
                  {t.startsWith('#') ? t : `#${t}`}
                </span>
              ))}
            </div>
          )}

          {/* Card Footer: Likes & Comments */}
          <div className="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800/80 flex justify-between items-center text-xs font-bold text-stone-500 dark:text-stone-400">
            <button 
              type="button"
              onClick={(e) => handleToggleLike(blog.id, e)}
              className={`flex items-center gap-1.5 transition-colors p-1 rounded-lg ${
                blog.isLiked ? 'text-red-500' : 'hover:text-red-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${blog.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{blog.likesCount || 0}</span>
            </button>

            <span className="flex items-center gap-1.5 hover:text-stone-800 dark:hover:text-stone-200 transition-colors">
              <MessageCircle className="w-4 h-4" /> {blog.commentsCount || blog._count?.comments || 0} Responses
            </span>
          </div>
        </div>
      </Link>
    );
  };

  const currentDisplayList = getActiveDisplayList();

  return (
    <div className="w-full flex flex-col gap-10 pb-20 animate-in fade-in duration-500">
      
      {/* Search & Explorer Hero */}
      <div className="w-full py-14 px-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-[3rem] shadow-sm flex flex-col items-center text-center relative overflow-hidden mt-4 transition-colors">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#c8ff00] rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px] opacity-10 dark:opacity-5 pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px] opacity-5 dark:opacity-[0.02] pointer-events-none" />

        <div className="relative z-10 w-full max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-[#8ab836]/10 text-[#8ab836] dark:text-[#c8ff00] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <Compass className="w-3.5 h-3.5" /> Collective Human Knowledge Base
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-stone-900 dark:text-white tracking-tighter mb-4 font-sans leading-tight">
            Where to next, <span className="font-serif italic font-normal text-stone-500 dark:text-stone-400">Explorer?</span>
          </h1>
          <p className="text-stone-500 dark:text-stone-400 font-medium mb-8 text-base sm:text-lg">
            Search for any state, valley, or city. Our recommendation engine surfaces genuine travel stories, realistic budgets, and authentic routes.
          </p>

          <form onSubmit={handleSearch} className="relative w-full mb-4">
            <input 
              type="text" 
              placeholder="Search e.g. Spiti, Ladakh, Munnar, Goa, Jibhi, Pushkar..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-full pl-14 pr-32 py-4 sm:py-5 text-base sm:text-lg text-stone-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-[#c8ff00]/20 dark:focus:ring-[#c8ff00]/10 focus:border-[#8ab836] shadow-inner transition-all font-medium placeholder-stone-400"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <button 
              type="submit" 
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-stone-900 dark:bg-stone-800 hover:bg-stone-800 dark:hover:bg-stone-700 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-bold shadow-md transition-all text-xs sm:text-sm cursor-pointer"
            >
              {isSearching ? 'Searching...' : 'Explore'}
            </button>
          </form>

          {/* Quick Trigger for Weather & Packing Forecaster */}
          <div className="flex items-center justify-center gap-3">
            <button 
              type="button"
              onClick={() => setShowWeatherDrawer(!showWeatherDrawer)}
              className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white bg-stone-100 dark:bg-stone-800 px-4 py-2 rounded-full transition-all border border-stone-200 dark:border-stone-700 hover:scale-105 shadow-sm"
            >
              <CloudSun className="w-3.5 h-3.5 text-[#8ab836]" />
              <span>{showWeatherDrawer ? "Hide Live Meteorological Forecaster" : "Check Live Destination Weather & Real Packing Tips"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Weather Drawer if opened */}
      {showWeatherDrawer && (
        <div className="relative animate-in slide-in-from-top-4 duration-500">
          <WeatherAdvisor initialDestination={searchQuery.trim() || "Manali"} />
        </div>
      )}

      {/* Recommendations Results Area (When User is Searching) */}
      {searchQuery && (
        <div className="flex flex-col gap-8">
          <div className="flex items-end justify-between px-2">
            <div>
              <h2 className="text-3xl font-black text-stone-900 dark:text-white tracking-tighter flex items-center gap-2">
                <Navigation className="w-6 h-6 text-[#8ab836]" /> Data Map for "{searchQuery}"
              </h2>
              <p className="text-stone-500 dark:text-stone-400 font-medium text-sm mt-1">Surfaced directly from verified community records.</p>
            </div>
            <button onClick={() => {setSearchQuery(''); setRecommendations([]);}} className="text-sm font-bold text-stone-400 hover:text-stone-900 dark:hover:text-stone-300 transition-colors">
              Clear Search
            </button>
          </div>

          {recommendations.length === 0 && !isSearching ? (
            <div className="apple-glass p-16 rounded-[2.5rem] text-center border-dashed border-2 border-stone-300 dark:border-stone-700">
              <Compass className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
              <h3 className="text-2xl font-black text-stone-800 dark:text-stone-200 mb-2">Uncharted Territory</h3>
              <p className="text-stone-500 dark:text-stone-400 max-w-md mx-auto mb-8">We have no data on this location yet. The map is blank.</p>
              <Link to="/write" className="bg-[#c8ff00] hover:bg-[#b8f200] text-stone-900 px-8 py-3.5 rounded-full font-black shadow-md transition-all inline-block hover:scale-105">
                Be the first to chart it
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-12">
              {recommendations.map(location => (
                <div key={location.id} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-[2.5rem] p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="bg-stone-100 dark:bg-stone-950 text-stone-600 dark:text-stone-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md border border-stone-200 dark:border-stone-800">
                      {location.type}
                    </span>
                    <h2 className="text-4xl font-black text-stone-900 dark:text-white font-serif tracking-tighter">{location.name}</h2>
                  </div>
                  
                  {location.description && <p className="text-stone-600 dark:text-stone-400 mb-8 max-w-3xl">{location.description}</p>}

                  {/* AI INSIGHTS FEATURE */}
                  <LocationInsight locationId={location.id} />

                  {/* Stories for this specific location */}
                  {location.blogs?.length > 0 && (
                    <div className="mb-10">
                      <h4 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">Direct Stories</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {location.blogs.map(blog => renderBlogCard(blog))}
                      </div>
                    </div>
                  )}

                  {/* Child locations */}
                  {location.children?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Discovered Hidden Gems Nearby
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {location.children.map(child => (
                          <div key={child.id} className="bg-stone-50 dark:bg-stone-800/30 border border-stone-200 dark:border-stone-800 p-6 rounded-3xl">
                            <h5 className="font-black text-xl text-stone-800 dark:text-white mb-4">{child.name}</h5>
                            <div className="flex flex-col gap-4">
                              {child.blogs?.map(blog => (
                                <Link key={blog.id} to={`/blog/${blog.id}`} className="flex items-center gap-4 group">
                                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-stone-200 dark:bg-stone-700 flex-shrink-0">
                                    <CoverImage 
                                      src={blog.coverImage} 
                                      alt={blog.title} 
                                      locationName={blog.location?.name}
                                      className="w-full h-full object-cover" 
                                    />
                                  </div>
                                  <div>
                                    <h6 className="font-bold text-stone-900 dark:text-stone-200 text-sm group-hover:text-[#8ab836] line-clamp-1">{blog.title}</h6>
                                    <span className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-widest font-bold">By @{blog.user?.username}</span>
                                  </div>
                                </Link>
                              ))}
                              {(!child.blogs || child.blogs.length === 0) && (
                                <span className="text-sm text-stone-400 dark:text-stone-500 italic">No stories mapped here yet.</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Community Discovery Area (Shows when not searching) */}
      {!searchQuery && (
        <div className="flex flex-col gap-8">

          {/* SPOTLIGHT SHELF: Curated For Your Journey */}
          {shelves.curatedForYou?.length > 0 && (
            <div className="p-8 sm:p-10 rounded-[3rem] bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 border border-stone-800 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#c8ff00]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 bg-[#c8ff00]/20 text-[#c8ff00] border border-[#c8ff00]/30 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-3">
                    <Sparkles className="w-3.5 h-3.5" /> Multi-Vector Recommendation Engine
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-sans">
                    Curated For Your Journey
                  </h2>
                  <p className="text-stone-400 font-medium text-sm sm:text-base mt-1">
                    {user?.travelStyle ? (
                      <>Aligned with your <strong className="text-white">{user.travelStyle}</strong> style & <strong className="text-[#c8ff00]">{user.preferredVibe || 'Authentic'}</strong> vibe.</>
                    ) : (
                      <>Personalized recommendations based on community trust and terrain proximity.</>
                    )}
                  </p>
                </div>

                <div className="text-xs font-bold text-stone-400">
                  {shelves.curatedForYou.length} Top Matches
                </div>
              </div>

              {/* Spotlight Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
                {shelves.curatedForYou.slice(0, 4).map(blog => (
                  <Link 
                    key={blog.id} 
                    to={`/blog/${blog.id}`}
                    className="group bg-stone-900/80 border border-stone-800 hover:border-[#c8ff00]/50 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col hover:-translate-y-1 shadow-lg"
                  >
                    <div className="h-44 w-full relative overflow-hidden">
                      <CoverImage 
                        src={blog.coverImage} 
                        alt={blog.title} 
                        locationName={blog.location?.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                      <div className="absolute top-3 left-3 bg-stone-900/90 backdrop-blur-md text-[#c8ff00] border border-[#c8ff00]/40 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                        <Sparkles className="w-2.5 h-2.5" /> {blog.matchScore || 90}% Match
                      </div>
                      {blog.location && (
                        <div className="absolute bottom-3 left-3 bg-stone-900/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-stone-300 flex items-center gap-1 border border-stone-700">
                          <MapPin className="w-2.5 h-2.5 text-[#8ab836]" /> {blog.location.name}
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex flex-col flex-grow">
                      {blog.matchReason && (
                        <span className="text-[10px] font-bold text-[#c8ff00] mb-2 line-clamp-1">
                          {blog.matchReason}
                        </span>
                      )}
                      <h4 className="font-bold text-base text-white font-serif group-hover:text-[#c8ff00] transition-colors line-clamp-2 mb-2 leading-snug">
                        {blog.title}
                      </h4>
                      <p className="text-xs text-stone-400 line-clamp-2 font-serif flex-grow leading-relaxed">
                        {blog.richContent.replace(/<[^>]+>/g, '')}
                      </p>
                      
                      <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-500 font-semibold">
                        <span>@{blog.user?.username}</span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-red-500" /> {blog.likesCount || 0}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Collection Tabs & Feed Controls */}
          <div className="flex flex-col gap-6">
            
            {/* Primary Collection Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setActiveCollection('curated')}
                  className={`px-5 py-2.5 rounded-full text-xs font-black flex items-center gap-2 transition-all shadow-sm ${
                    activeCollection === 'curated'
                      ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 scale-105'
                      : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:border-stone-400'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#c8ff00]" />
                  <span>Curated For You</span>
                </button>

                <button
                  onClick={() => setActiveCollection('gems')}
                  className={`px-5 py-2.5 rounded-full text-xs font-black flex items-center gap-2 transition-all shadow-sm ${
                    activeCollection === 'gems'
                      ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 scale-105'
                      : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:border-stone-400'
                  }`}
                >
                  <Gem className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Hidden Gems & Offbeat</span>
                </button>

                <button
                  onClick={() => setActiveCollection('trending')}
                  className={`px-5 py-2.5 rounded-full text-xs font-black flex items-center gap-2 transition-all shadow-sm ${
                    activeCollection === 'trending'
                      ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 scale-105'
                      : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:border-stone-400'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Trending Right Now</span>
                </button>

                <button
                  onClick={() => setActiveCollection('all')}
                  className={`px-5 py-2.5 rounded-full text-xs font-black flex items-center gap-2 transition-all shadow-sm ${
                    activeCollection === 'all'
                      ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 scale-105'
                      : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:border-stone-400'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-stone-500" />
                  <span>All Stories</span>
                </button>
              </div>

              {/* Write Story Action */}
              <Link to="/write" className="self-start sm:self-auto flex items-center gap-2 text-xs font-black text-stone-900 bg-[#c8ff00] hover:bg-[#b8f200] px-5 py-2.5 rounded-full shadow-md transition-all hover:scale-105">
                <PenTool className="w-3.5 h-3.5" /> Write Story
              </Link>
            </div>

            {/* Vibe Category Pills & Sorting (When browsing all stories) */}
            {activeCollection === 'all' && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2 pt-2 border-t border-stone-200 dark:border-stone-800 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {vibeCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveVibe(cat.id)}
                      className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                        activeVibe === cat.id
                          ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 border-stone-900 dark:border-white shadow-md'
                          : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:border-stone-400'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Sort Toggle */}
                <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-full text-xs font-bold border border-stone-200 dark:border-stone-700 flex-shrink-0">
                  <button 
                    onClick={() => setActiveSort('match')}
                    className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
                      activeSort === 'match' 
                        ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-sm' 
                        : 'text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-[#c8ff00]" /> AI Match
                  </button>
                  <button 
                    onClick={() => setActiveSort('popular')}
                    className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
                      activeSort === 'popular' 
                        ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-sm' 
                        : 'text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <TrendingUp className="w-3 h-3" /> Popular
                  </button>
                  <button 
                    onClick={() => setActiveSort('recent')}
                    className={`px-3 py-1 rounded-full transition-all ${
                      activeSort === 'recent' 
                        ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-sm' 
                        : 'text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    Recent
                  </button>
                </div>
              </div>
            )}

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-2">
              {loadingFeed || loadingShelves ? (
                <div className="col-span-full py-24 flex flex-col items-center justify-center gap-3 text-stone-400">
                  <div className="w-6 h-6 border-2 border-[#c8ff00] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Syncing curated community discoveries...</span>
                </div>
              ) : currentDisplayList.length === 0 ? (
                <div className="col-span-full py-20 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-[2.5rem] text-center font-bold text-stone-400">
                  No stories found in this collection. Try another tab or be the first to write one!
                </div>
              ) : (
                currentDisplayList.map((blog, idx) => renderBlogCard(blog, idx === 0))
              )}
            </div>

          </div>

        </div>
      )}
      
    </div>
  );
}
