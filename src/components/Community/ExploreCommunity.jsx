import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import { Search, MapPin, Compass, MessageCircle, Navigation, Sparkles, PenTool } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import parse from 'html-react-parser';
import CoverImage from './CoverImage';

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

  // If not authenticated or not onboarded, redirect logic (App.jsx handles some, but good to be safe)
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    } else if (user && !user.onboardingComplete) {
      navigate('/onboarding');
    }
  }, [user, isAuthenticated, navigate]);

  // Load general feed on mount
  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const { data } = await api.get('/blogs');
        setGeneralFeed(data);
      } catch (err) {
        console.error("Failed to fetch feed", err);
      } finally {
        setLoadingFeed(false);
      }
    };
    fetchFeed();
  }, []);

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
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle Search (manual submit)
  const handleSearch = (e) => {
    e.preventDefault();
    // The debounce effect will handle the actual fetching, 
    // but this prevents the page from reloading on enter.
  };

  const renderBlogCard = (blog, isFeatured = false) => {
    const colSpan = isFeatured ? "md:col-span-12 lg:col-span-8" : "md:col-span-6 lg:col-span-4";
    const imageHeight = isFeatured ? "h-[400px]" : "h-64";

    return (
      <Link key={blog.id} to={`/blog/${blog.id}`} className={`group relative rounded-[2rem] overflow-hidden transition-all duration-500 flex flex-col ${colSpan} bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:shadow-xl hover:-translate-y-1`}>
        <div className={`${imageHeight} w-full overflow-hidden relative`}>
          <CoverImage 
            src={blog.coverImage} 
            alt={blog.title} 
            locationName={blog.location?.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out" 
          />
          {blog.location && (
            <div className="absolute top-4 right-4 bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-white/20 dark:border-stone-700">
              <MapPin className="w-3.5 h-3.5 text-[#8ab836]" />
              <span className="text-[10px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-widest">{blog.location.name}</span>
            </div>
          )}
        </div>
        <div className="p-6 flex flex-col flex-grow relative z-10">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded uppercase tracking-widest">
              @{blog.user.username}
            </span>
            <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500">{new Date(blog.createdAt).toLocaleDateString()}</span>
          </div>
          <h3 className="font-black text-2xl text-stone-900 dark:text-white leading-tight group-hover:text-[#8ab836] dark:group-hover:text-[#c8ff00] transition-colors font-serif line-clamp-2">
            {blog.title}
          </h3>
          <div className="mt-4 text-sm text-stone-500 dark:text-stone-400 line-clamp-2 font-serif flex-grow">
            {blog.richContent.replace(/<[^>]+>/g, '')}
          </div>
          <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center text-xs font-bold text-stone-400 dark:text-stone-500">
            <span className="flex items-center gap-1.5"><MessageCircle className="w-4 h-4" /> {blog._count?.comments || 0} Responses</span>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="w-full flex flex-col gap-12 pb-20 animate-in fade-in duration-500">
      
      {/* Search & Explorer Hero */}
      <div className="w-full py-16 px-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-[3rem] shadow-sm flex flex-col items-center text-center relative overflow-hidden mt-4 transition-colors">
        {/* Subtle background decoration */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#c8ff00] rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px] opacity-10 dark:opacity-5" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px] opacity-5 dark:opacity-[0.02]" />

        <div className="relative z-10 w-full max-w-2xl">
          <h1 className="text-4xl sm:text-6xl font-black text-stone-900 dark:text-white tracking-tighter mb-4 font-sans">
            Where to next, <span className="font-serif italic font-normal text-stone-500 dark:text-stone-400">Explorer?</span>
          </h1>
          <p className="text-stone-500 dark:text-stone-400 font-medium mb-10 text-lg">
            Search for a state or city. Our engine will surface the best hidden gems and stories mapped by the community.
          </p>

          <form onSubmit={handleSearch} className="relative w-full">
            <input 
              type="text" 
              placeholder="Search e.g. Rajasthan, Kerala, Spiti..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-full pl-14 pr-32 py-5 text-lg text-stone-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-[#c8ff00]/20 dark:focus:ring-[#c8ff00]/10 focus:border-[#8ab836] shadow-inner transition-all font-medium placeholder-stone-400 dark:placeholder-stone-600"
            />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-stone-400 dark:text-stone-600" />
            <button 
              type="submit" 
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-stone-900 dark:bg-stone-800 hover:bg-stone-800 dark:hover:bg-stone-700 text-white px-6 py-3 rounded-full font-bold shadow-md transition-all text-sm"
            >
              {isSearching ? 'Searching...' : 'Explore'}
            </button>
          </form>
        </div>
      </div>

      {/* Recommendations Results Area */}
      {searchQuery && (
        <div className="flex flex-col gap-8">
          <div className="flex items-end justify-between px-2">
            <div>
              <h2 className="text-3xl font-black text-stone-900 dark:text-white tracking-tighter flex items-center gap-2">
                <Navigation className="w-6 h-6 text-[#8ab836]" /> Data Map for "{searchQuery}"
              </h2>
              <p className="text-stone-500 dark:text-stone-400 font-medium text-sm mt-1">Based entirely on community data points.</p>
            </div>
            <button onClick={() => {setSearchQuery(''); setRecommendations([]);}} className="text-sm font-bold text-stone-400 dark:text-stone-500 hover:text-stone-900 dark:hover:text-stone-300 transition-colors">Clear Search</button>
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

                  {/* Child locations (e.g. Villages inside this State) */}
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
                                    <span className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-widest font-bold">By @{blog.user.username}</span>
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

      {/* General Community Feed (Shows when not searching) */}
      {!searchQuery && (
        <div className="flex flex-col gap-6">
          <div className="flex items-end justify-between px-2 mb-2">
            <h2 className="text-3xl font-black text-stone-900 dark:text-white tracking-tighter">Latest from the Community</h2>
            <Link to="/write" className="hidden sm:flex items-center gap-2 text-sm font-bold text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-4 py-2 rounded-full shadow-sm transition-colors">
              <PenTool className="w-4 h-4" /> Share a Story
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {loadingFeed ? (
              <div className="col-span-full py-20 text-center font-bold text-stone-400 dark:text-stone-500">Loading map data...</div>
            ) : generalFeed.length === 0 ? (
              <div className="col-span-full py-20 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-[2.5rem] text-center font-bold text-stone-400 dark:text-stone-500">
                The map is blank. Be the first to add a data point.
              </div>
            ) : (
              generalFeed.map((blog, idx) => renderBlogCard(blog, idx === 0))
            )}
          </div>
        </div>
      )}
      
    </div>
  );
}
