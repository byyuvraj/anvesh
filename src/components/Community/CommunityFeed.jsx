import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import { Heart, Navigation, MapPin, PenTool, Image as ImageIcon } from 'lucide-react';
import CreateExperienceModal from './CreateExperienceModal';
import { Link } from 'react-router-dom';

export default function CommunityFeed() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/community/feed');
      setFeed(data);
    } catch (err) {
      console.error("Failed to load community feed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  if (loading) return <div className="text-center py-20 font-bold text-stone-500">Loading Community...</div>;

  return (
    <div className="w-full bg-[#fafaf9] rounded-3xl p-4 sm:p-6 border border-stone-200 shadow-sm flex flex-col gap-8 relative min-h-[600px]">
      <div className="bg-stone-900 rounded-2xl p-8 relative overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 bg-gradient-to-r from-[#8ab836]/20 to-transparent pointer-events-none" />
        <h2 className="text-4xl font-black text-white z-10">Anvesh Community</h2>
        <p className="text-stone-300 mt-2 z-10 max-w-lg">Discover AI itineraries and real travel stories shared by global explorers.</p>
        
        <div className="mt-6 z-10">
          {isAuthenticated ? (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#8ab836] hover:bg-[#729c29] text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2"
            >
              <PenTool className="w-4 h-4" /> Share Your Experience
            </button>
          ) : (
            <Link to="/login" className="bg-white hover:bg-stone-50 text-stone-900 px-6 py-3 rounded-xl font-bold shadow-lg transition-all inline-block">
              Login to Share Experiences
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {feed.length === 0 ? (
          <div className="col-span-full text-center py-10 text-stone-500 font-bold">No posts yet. Be the first to share an experience!</div>
        ) : (
          feed.map(post => (
            <div key={post.id} className="bg-white rounded-2xl border border-stone-200 shadow hover:shadow-lg transition-all flex flex-col overflow-hidden">
              
              {/* If it's a real Experience */}
              {post.type === 'experience' && (
                <>
                  {post.imageUrl && (
                    <div className="h-40 w-full overflow-hidden bg-stone-100 border-b border-stone-100">
                      <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />
                    </div>
                  )}
                  <div className="p-5 flex flex-col gap-3 flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-[10px] font-black text-orange-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {post.location}
                        </div>
                        <h3 className="font-black text-lg text-stone-900 leading-tight">{post.title}</h3>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="bg-orange-500/10 text-orange-600 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                            {post.user.travelStyle || 'Traveler'}
                          </span>
                          <span className="text-xs text-stone-500 font-semibold">by @{post.user.username}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-stone-600 font-medium line-clamp-4 leading-relaxed mt-2">
                      {post.story}
                    </div>
                  </div>
                  <div className="border-t border-stone-100 p-4 bg-stone-50/50 flex justify-between items-center">
                    <span className="text-[10px] text-stone-400 font-bold">{new Date(post.createdAt).toLocaleDateString()}</span>
                    <span className="text-[10px] font-bold text-stone-400 bg-stone-200/50 px-2 py-0.5 rounded uppercase">Experience</span>
                  </div>
                </>
              )}

              {/* If it's an AI Itinerary */}
              {post.type === 'itinerary' && (
                <>
                  <div className="p-5 flex flex-col gap-4 flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-black text-lg text-stone-900 leading-tight">{post.destination}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="bg-[#8ab836]/10 text-[#8ab836] text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                            {post.user.travelStyle || 'Explorer'}
                          </span>
                          <span className="text-xs text-stone-500 font-semibold">by @{post.user.username}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-stone-50 rounded-xl p-3 text-xs text-stone-600 font-medium line-clamp-4 leading-relaxed border border-stone-100">
                      {(() => {
                        try {
                          const parsed = JSON.parse(post.data);
                          return parsed.cultural_context?.historical_significance || parsed.overview || "An amazing cultural journey awaits...";
                        } catch(e) {
                          return "An amazing cultural journey awaits...";
                        }
                      })()}
                    </div>
                  </div>
                  <div className="border-t border-stone-100 p-4 bg-stone-50/50 flex justify-between items-center">
                    <span className="text-[10px] text-stone-400 font-bold">{new Date(post.createdAt).toLocaleDateString()}</span>
                    <span className="text-[10px] font-bold text-[#8ab836] bg-[#8ab836]/10 px-2 py-0.5 rounded uppercase flex items-center gap-1">
                      <Navigation className="w-3 h-3" /> AI Route
                    </span>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <CreateExperienceModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchFeed}
        />
      )}
    </div>
  );
}
