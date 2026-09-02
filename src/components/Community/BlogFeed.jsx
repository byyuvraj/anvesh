import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import { Navigation, MessageCircle, ArrowRight, PenTool } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BlogFeed() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const url = isAuthenticated && user ? `/blogs?userId=${user.id}` : '/blogs';
        const { data } = await api.get(url);
        setBlogs(data);
      } catch (err) {
        console.error("Failed to fetch blogs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  if (loading) return <div className="text-center py-40 font-black text-stone-400 text-3xl tracking-tighter">Loading...</div>;

  return (
    <div className="w-full flex flex-col gap-12 pb-10">
      
      {/* Immersive Hero */}
      <div className="w-full h-[600px] rounded-[2.5rem] relative overflow-hidden flex flex-col items-center justify-center text-center shadow-2xl group">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80')] bg-cover bg-center group-hover:scale-105 transition-transform duration-[2s] ease-out" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        <div className="relative z-10 flex flex-col items-center mt-20 pointer-events-none">
          <h2 className="text-white/90 font-medium tracking-[0.2em] text-sm sm:text-lg uppercase mb-2 font-serif drop-shadow-md">
            The Call of the
          </h2>
          {/* Overlapping massive typography */}
          <h1 className="text-7xl sm:text-[9rem] font-black text-white tracking-tighter leading-[0.8] drop-shadow-2xl">
            Mountains
          </h1>
          
          <div className="mt-20 pointer-events-auto">
            {isAuthenticated ? (
              <Link to="/write" className="bg-white hover:bg-stone-100 text-stone-900 px-8 py-4 rounded-full font-bold transition-all flex items-center gap-2 text-sm sm:text-base hover:scale-105 shadow-lg">
                <PenTool className="w-5 h-5" /> Craft a Story
              </Link>
            ) : (
              <Link to="/login" className="bg-white/90 backdrop-blur-sm hover:bg-white text-stone-900 px-8 py-4 rounded-full font-bold transition-all flex items-center gap-2 text-sm sm:text-base hover:scale-105 shadow-lg">
                Join the Circle
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between px-2 mb-2 mt-10">
        <h2 className="text-4xl font-black text-stone-900 tracking-tighter">Latest Stories</h2>
        <span className="text-stone-400 font-bold text-sm uppercase tracking-widest hidden sm:block">Curated for you</span>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {blogs.length === 0 ? (
          <div className="col-span-full text-center py-24 text-stone-400 font-serif text-2xl">The pages are blank. Be the first to write.</div>
        ) : (
          blogs.map((blog, idx) => {
            const isFeatured = idx === 0;
            const colSpan = isFeatured ? "md:col-span-12 lg:col-span-8" : "md:col-span-6 lg:col-span-4";
            const imageHeight = isFeatured ? "h-[400px] sm:h-[500px]" : "h-64";

            return (
              <Link key={blog.id} to={`/blog/${blog.id}`} className={`group relative rounded-[2rem] overflow-hidden transition-all duration-500 flex flex-col ${colSpan} bg-white border border-stone-200 hover:shadow-xl hover:border-stone-300`}>
                
                <div className={`${imageHeight} w-full overflow-hidden relative`}>
                  {blog.coverImage ? (
                    <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-300">
                      <Navigation className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                  
                  {/* Floating Author Pill */}
                  <div className="absolute top-5 left-5 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                    <div className="w-6 h-6 rounded-full bg-stone-200 overflow-hidden border border-stone-300">
                      {blog.user.profilePicture ? (
                        <img src={blog.user.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#8ab836]" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-stone-700">@{blog.user.username}</span>
                  </div>

                  {/* Text on Image for Featured */}
                  {isFeatured && (
                    <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 z-10 flex flex-col">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="text-white font-bold text-xs uppercase tracking-widest bg-[#8ab836] px-3 py-1 rounded-full">Featured Story</span>
                        {blog.matchScore && (
                          <span className="text-stone-900 font-bold text-xs uppercase tracking-widest bg-[#c8ff00] px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                            ✨ {blog.matchScore}% Match
                          </span>
                        )}
                        {blog.readingTime && (
                          <span className="text-white font-bold text-xs bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                            {blog.readingTime} min read
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-black text-4xl sm:text-5xl text-white leading-tight font-serif drop-shadow-lg">{blog.title}</h3>
                      
                      {blog.tags && blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {blog.tags.map(tag => (
                            <span key={tag} className="text-xs font-bold text-white/90 bg-white/10 px-2 py-0.5 rounded-md border border-white/20">{tag}</span>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 flex items-center gap-4 text-white/80 text-sm font-bold">
                        <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                        <span className="flex items-center gap-1.5"><MessageCircle className="w-4 h-4" /> {blog._count?.comments || 0} Comments</span>
                      </div>
                    </div>
                  )}
                </div>

                {!isFeatured && (
                  <div className="p-6 sm:p-8 flex flex-col flex-grow z-10 relative">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-2 items-center">
                        <span className="text-[10px] font-bold text-stone-600 bg-stone-100 border border-stone-200 px-2 py-1 rounded uppercase tracking-widest">
                          {blog.user.travelStyle || 'Traveler'}
                        </span>
                        {blog.matchScore && (
                          <span className="text-[10px] font-bold text-stone-900 bg-[#c8ff00] px-2 py-1 rounded uppercase tracking-widest flex items-center gap-1 shadow-sm">
                            ✨ {blog.matchScore}% Match
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-stone-400">{new Date(blog.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <h3 className="font-black text-2xl text-stone-900 leading-tight group-hover:text-[#8ab836] transition-colors font-serif line-clamp-3">
                      {blog.title}
                    </h3>

                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {blog.tags.map(tag => (
                          <span key={tag} className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">{tag}</span>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-3 text-sm text-stone-500 line-clamp-2 leading-relaxed flex-grow font-serif">
                       {blog.aiSummary || blog.richContent.replace(/<[^>]+>/g, '')}
                    </div>

                    <div className="mt-5 pt-4 border-t border-stone-100 flex justify-between items-center text-xs font-bold text-stone-400 group-hover:text-[#8ab836] transition-colors">
                      <span className="flex items-center gap-2">
                        {blog.readingTime ? `${blog.readingTime} min read` : 'Read Article'} 
                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                      </span>
                      <span className="flex items-center gap-1.5"><MessageCircle className="w-4 h-4" /> {blog._count?.comments || 0}</span>
                    </div>
                  </div>
                )}
              </Link>
            )
          })
        )}
      </div>

    </div>
  );
}
