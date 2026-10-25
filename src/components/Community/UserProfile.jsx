import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import { 
  Camera, Edit3, Settings, BarChart2, BookOpen, Bookmark, 
  MapPin, Calendar, Clock, Trash2, ArrowRight, CheckCircle2, Compass
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import India from '@react-map/india';
import CoverImage from './CoverImage';

export default function UserProfile() {
  const { user, checkAuth } = useAuthStore();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [savedTrips, setSavedTrips] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('data'); // 'data' | 'trips' | 'bookmarks' | 'analytics'
  const [visitedStates, setVisitedStates] = useState({});
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // ML Analytics Data based on user preference or blogs
  const personaData = [
    { subject: 'Adventure', A: user?.travelStyle?.includes('Adventure') ? 95 : 75, fullMark: 100 },
    { subject: 'Culture', A: user?.preferredVibe?.includes('Heritage') ? 90 : 65, fullMark: 100 },
    { subject: 'Relaxation', A: 55, fullMark: 100 },
    { subject: 'Nature', A: 85, fullMark: 100 },
    { subject: 'Culinary', A: 70, fullMark: 100 },
  ];

  const activityData = [
    { name: 'Jan', blogs: 1 },
    { name: 'Feb', blogs: 0 },
    { name: 'Mar', blogs: 3 },
    { name: 'Apr', blogs: 2 },
    { name: 'May', blogs: 5 },
    { name: 'Jun', blogs: 4 },
  ];

  // Helper to compress image
  const compressImage = (file, maxWidth, maxHeight) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const fetchProfileData = async () => {
    try {
      const [blogsRes, tripsRes, bookmarksRes] = await Promise.all([
        api.get('/blogs'),
        api.get('/itineraries').catch(() => ({ data: [] })),
        api.get('/user/bookmarks').catch(() => ({ data: [] }))
      ]);

      if (user) {
        const myBlogs = blogsRes.data.filter(b => b.userId === user.id);
        setBlogs(myBlogs);
        setSavedTrips(tripsRes.data || []);
        setBookmarks(bookmarksRes.data || []);
        
        // Calculate visited states for the map
        const stateColors = {};
        myBlogs.forEach(blog => {
          const stateName = blog.location?.parent?.name || blog.location?.name;
          if (stateName) {
            stateColors[stateName] = '#8ab836';
          }
        });
        setVisitedStates(stateColors);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchProfileData();
  }, [user]);

  if (!user) return <div className="text-center py-32 font-black text-3xl text-stone-400 tracking-tighter">Please login to view your profile.</div>;

  const handleUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'cover') {
      setIsUploadingCover(true);
    } else {
      setIsUploadingAvatar(true);
    }
    
    try {
      const maxW = type === 'cover' ? 800 : 300;
      const maxH = type === 'cover' ? 400 : 300;
      const compressedBase64 = await compressImage(file, maxW, maxH);
      
      const payload = type === 'cover' 
        ? { coverPhoto: compressedBase64 } 
        : { profilePicture: compressedBase64 };

      await api.put('/auth/profile', payload);
      await checkAuth();
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to update profile picture.");
    } finally {
      if (type === 'cover') {
        setIsUploadingCover(false);
      } else {
        setIsUploadingAvatar(false);
      }
    }
  };

  const handleDeleteTrip = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to remove this trip?")) return;
    try {
      await api.delete(`/itineraries/${id}`);
      setSavedTrips(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error("Delete trip error", err);
    }
  };

  return (
    <div className="w-full max-w-[1050px] mx-auto flex flex-col gap-10 animate-in fade-in duration-500 pb-20 pt-4">
      
      {/* Cover & Avatar Header */}
      <div className="apple-glass-solid rounded-[3rem] overflow-hidden relative pb-10 shadow-xl border border-white dark:border-stone-800">
        
        {/* Cover Photo */}
        <div className="h-[280px] sm:h-[380px] w-full bg-stone-100 dark:bg-stone-900 relative group">
          {user.coverPhoto ? (
            <img src={user.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-900 dark:to-stone-950 flex items-center justify-center">
              <span className="text-stone-300 dark:text-stone-700 font-black text-6xl tracking-tighter select-none">ANVESH</span>
            </div>
          )}
          <label className="absolute top-6 right-6 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md hover:bg-white dark:hover:bg-stone-800 px-4 py-2 rounded-full text-xs font-bold text-stone-700 dark:text-stone-300 cursor-pointer transition-all shadow-sm border border-stone-200 dark:border-stone-700">
            <Camera className="w-3.5 h-3.5 inline-block mr-1" /> {isUploadingCover ? 'Uploading...' : 'Change Cover'}
            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'cover')} disabled={isUploadingCover} />
          </label>
        </div>

        {/* Profile Details Container */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end sm:-mt-20 px-8 sm:px-12 gap-6 relative">
          
          <label className="cursor-pointer relative z-20">
            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'avatar')} disabled={isUploadingAvatar} />
            <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full border-4 border-white dark:border-stone-900 bg-stone-200 dark:bg-stone-800 overflow-hidden shadow-xl relative group flex-shrink-0 z-10">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#c8ff00] flex items-center justify-center text-stone-900 text-6xl font-black">{user.username[0].toUpperCase()}</div>
              )}
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-6 h-6 text-white mb-1" />
                <span className="text-white text-[10px] font-bold uppercase tracking-widest">{isUploadingAvatar ? '...' : 'Update'}</span>
              </div>
            </div>
          </label>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between w-full pb-4 gap-6 text-center sm:text-left">
            {/* User Info */}
            <div className="mb-2 z-10">
              <h1 className="text-3xl sm:text-5xl font-black text-stone-900 dark:text-white leading-none tracking-tighter mb-2">@{user.username}</h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <span className="text-[10px] font-bold text-stone-600 dark:text-stone-300 bg-[#c8ff00]/20 dark:bg-[#c8ff00]/10 px-3 py-1 rounded-full uppercase tracking-wider border border-[#c8ff00] dark:border-[#c8ff00]/50">{user.travelStyle || 'Traveler'}</span>
                {user.preferredVibe && (
                  <span className="text-[10px] font-bold text-stone-500 bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-full uppercase tracking-wider">{user.preferredVibe}</span>
                )}
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Joined {new Date(user.createdAt).getFullYear()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mb-2 z-10 w-full sm:w-auto justify-center">
              <Link to="/write" className="flex-grow sm:flex-grow-0 bg-stone-900 dark:bg-white hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900 px-6 sm:px-8 py-3 rounded-full font-bold shadow-xl transition-all flex items-center justify-center gap-2 text-xs sm:text-sm border border-stone-700 dark:border-white">
                <Edit3 className="w-4 h-4" /> Share Story
              </Link>
            </div>
          </div>
        </div>
        
        {/* Bio */}
        {user.bio && (
          <div className="px-8 sm:px-12 mt-6 text-stone-600 dark:text-stone-400 font-serif text-base sm:text-lg leading-relaxed max-w-2xl text-center sm:text-left mx-auto sm:mx-0">
            "{user.bio}"
          </div>
        )}
      </div>

      {/* Profile Navigation Tabs */}
      <div className="flex justify-center border-b border-stone-200/50 dark:border-stone-800/50 mt-2 mb-4 sticky top-24 z-30 bg-white/60 dark:bg-stone-950/60 backdrop-blur-md px-3 py-1.5 rounded-full mx-auto w-fit gap-1.5 shadow-sm">
        <button 
          onClick={() => setActiveTab('data')}
          className={`px-5 py-2 font-bold rounded-full text-xs flex items-center gap-1.5 transition-all ${
            activeTab === 'data' 
              ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-md' 
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>My Stories</span>
          <span className="text-[10px] bg-stone-200 dark:bg-stone-800 px-1.5 py-0.2 rounded-full font-black ml-0.5">{blogs.length}</span>
        </button>

        <button 
          onClick={() => setActiveTab('trips')}
          className={`px-5 py-2 font-bold rounded-full text-xs flex items-center gap-1.5 transition-all ${
            activeTab === 'trips' 
              ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-md' 
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Saved Trips</span>
          <span className="text-[10px] bg-stone-200 dark:bg-stone-800 px-1.5 py-0.2 rounded-full font-black ml-0.5">{savedTrips.length}</span>
        </button>

        <button 
          onClick={() => setActiveTab('bookmarks')}
          className={`px-5 py-2 font-bold rounded-full text-xs flex items-center gap-1.5 transition-all ${
            activeTab === 'bookmarks' 
              ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-md' 
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Bucket List</span>
          <span className="text-[10px] bg-stone-200 dark:bg-stone-800 px-1.5 py-0.2 rounded-full font-black ml-0.5">{bookmarks.length}</span>
        </button>

        <button 
          onClick={() => setActiveTab('analytics')}
          className={`px-5 py-2 font-bold rounded-full text-xs flex items-center gap-1.5 transition-all ${
            activeTab === 'analytics' 
              ? 'bg-[#c8ff00] text-stone-900 font-black shadow-md' 
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Analytics & Map</span>
        </button>
      </div>

      {/* Tab 1: My Stories */}
      {activeTab === 'data' && (
        <div className="animate-in fade-in duration-500">
          {loading ? (
            <div className="text-center py-20 font-bold text-stone-400">Loading journal...</div>
          ) : blogs.length === 0 ? (
            <div className="py-20 apple-glass rounded-[3rem] text-center flex flex-col items-center justify-center gap-4 border border-stone-200 dark:border-stone-800">
              <span className="text-stone-400 font-serif text-xl">You haven't charted any destinations yet.</span>
              <Link to="/write" className="text-stone-900 px-6 py-2.5 rounded-full shadow-md text-xs font-black bg-[#c8ff00] hover:bg-[#b8f200]">
                Write your first story
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {blogs.map(blog => (
                <Link key={blog.id} to={`/blog/${blog.id}`} className="group apple-glass rounded-[2rem] hover:shadow-xl hover:border-stone-300 dark:hover:border-stone-600 transition-all flex flex-col overflow-hidden border border-stone-200 dark:border-stone-800">
                  <div className="h-52 w-full overflow-hidden relative">
                    <CoverImage 
                      src={blog.coverImage} 
                      alt={blog.title} 
                      locationName={blog.location?.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                    />
                    {blog.location && (
                      <span className="absolute top-3 right-3 bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                        {blog.location.name}
                      </span>
                    )}
                  </div>
                  <div className="p-6">
                    <span className="text-[10px] text-stone-400 font-bold block mb-2 tracking-widest uppercase">{new Date(blog.createdAt).toLocaleDateString()}</span>
                    <h3 className="font-black text-xl text-stone-900 dark:text-white leading-tight group-hover:text-[#8ab836] transition-colors font-serif line-clamp-2">{blog.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Saved Trips */}
      {activeTab === 'trips' && (
        <div className="animate-in fade-in duration-500">
          {savedTrips.length === 0 ? (
            <div className="py-20 apple-glass rounded-[3rem] text-center flex flex-col items-center justify-center gap-3 border border-stone-200 dark:border-stone-800">
              <Compass className="w-12 h-12 text-stone-300 dark:text-stone-700 mb-2" />
              <h3 className="text-xl font-bold text-stone-800 dark:text-stone-200">No saved itineraries</h3>
              <p className="text-xs text-stone-500 max-w-sm mb-4">Generate custom day-by-day plans with AI and save them to track your journey checklist.</p>
              <Link to="/planner" className="bg-stone-900 dark:bg-white text-white dark:text-stone-900 px-6 py-2.5 rounded-full text-xs font-bold shadow-md">
                Launch AI Planner
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedTrips.map(trip => {
                const parsed = trip.parsedData || {};
                const totalActs = parsed.days?.reduce((sum, d) => sum + (d.activities?.length || 0), 0) || 0;
                const completedActs = Object.values(parsed.checkedActivities || {}).filter(Boolean).length;
                const pct = totalActs > 0 ? Math.round((completedActs / totalActs) * 100) : 0;

                return (
                  <div 
                    key={trip.id}
                    onClick={() => navigate('/planner')}
                    className="apple-glass-solid p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-[#c8ff00]/20 text-stone-900 dark:text-[#c8ff00] px-2.5 py-0.5 rounded-full flex items-center gap-1">
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

                      <h4 className="text-xl font-black text-stone-900 dark:text-white group-hover:text-[#8ab836] transition-colors leading-snug">
                        {trip.title}
                      </h4>

                      <div className="flex items-center gap-3 text-xs text-stone-500 mt-2 font-medium">
                        <span>{trip.days} Days</span>
                        <span>•</span>
                        <span>{trip.vibe || 'Balanced'}</span>
                        <span>•</span>
                        <span>{trip.budget || 'Moderate'}</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800">
                      <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                        <span className="text-stone-500">Checklist Progress</span>
                        <span className="text-[#8ab836] dark:text-[#c8ff00]">{pct}% ({completedActs}/{totalActs})</span>
                      </div>
                      <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-[#8ab836] to-[#c8ff00] h-full rounded-full transition-all duration-500" 
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs font-bold text-stone-400 mt-4 group-hover:text-stone-900 dark:group-hover:text-white transition-colors">
                        <span>Open in Planner</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Bucket List (Saved Bookmarked Stories) */}
      {activeTab === 'bookmarks' && (
        <div className="animate-in fade-in duration-500">
          {bookmarks.length === 0 ? (
            <div className="py-20 apple-glass rounded-[3rem] text-center flex flex-col items-center justify-center gap-3 border border-stone-200 dark:border-stone-800">
              <Bookmark className="w-12 h-12 text-stone-300 dark:text-stone-700 mb-2" />
              <h3 className="text-xl font-bold text-stone-800 dark:text-stone-200">Your Bucket List is empty</h3>
              <p className="text-xs text-stone-500 max-w-sm mb-4">Click the bookmark icon on any community story or hidden gem to save it here for future travels.</p>
              <Link to="/community" className="bg-[#c8ff00] hover:bg-[#b8f200] text-stone-900 px-6 py-2.5 rounded-full text-xs font-bold shadow-md">
                Explore Community Stories
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {bookmarks.map(blog => (
                <Link key={blog.id} to={`/blog/${blog.id}`} className="group apple-glass rounded-[2rem] hover:shadow-xl hover:border-stone-300 dark:hover:border-stone-600 transition-all flex flex-col overflow-hidden border border-stone-200 dark:border-stone-800">
                  <div className="h-52 w-full overflow-hidden relative">
                    <CoverImage 
                      src={blog.coverImage} 
                      alt={blog.title} 
                      locationName={blog.location?.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                    />
                    <span className="absolute top-3 right-3 bg-stone-900/80 backdrop-blur-md text-[#c8ff00] p-1.5 rounded-full">
                      <Bookmark className="w-3.5 h-3.5 fill-current" />
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between text-[10px] text-stone-400 font-bold mb-2 uppercase tracking-wider">
                      <span>@{blog.user?.username}</span>
                      <span>{blog.location?.name}</span>
                    </div>
                    <h3 className="font-black text-xl text-stone-900 dark:text-white leading-tight group-hover:text-[#8ab836] transition-colors font-serif line-clamp-2">{blog.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Travel Analytics & India Map */}
      {activeTab === 'analytics' && (
        <div className="flex flex-col gap-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="apple-glass p-8 rounded-[2.5rem] border border-stone-200 dark:border-stone-800 flex flex-col items-center">
              <h3 className="text-xl font-black text-stone-900 dark:text-white mb-2">Traveler Persona (ML)</h3>
              <p className="text-sm font-medium text-stone-500 mb-6 text-center">Computed via Semantic Tag Analysis</p>
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={personaData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#78716c', fontSize: 12, fontWeight: 'bold' }} />
                    <Radar name="Persona" dataKey="A" stroke="#8ab836" fill="#c8ff00" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="apple-glass p-8 rounded-[2.5rem] border border-stone-200 dark:border-stone-800 flex flex-col items-center">
              <h3 className="text-xl font-black text-stone-900 dark:text-white mb-2">Exploration Velocity</h3>
              <p className="text-sm font-medium text-stone-500 mb-6 text-center">Data points charted over time</p>
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fill: '#78716c', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#78716c', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f5f5f4' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="blogs" fill="#8ab836" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Geographic Footprint Map */}
          <div className="apple-glass p-8 rounded-[2.5rem] border border-stone-200 dark:border-stone-800 flex flex-col items-center w-full">
             <div className="flex items-center gap-2 mb-2">
               <MapPin className="w-5 h-5 text-[#8ab836]" />
               <h3 className="text-xl font-black text-stone-900 dark:text-white">Explored Territories</h3>
             </div>
             <p className="text-sm font-medium text-stone-500 mb-6 text-center">Your live geographic footprint across India (States highlighted in Green)</p>
             <div className="w-full max-w-lg flex justify-center overflow-hidden">
               <India 
                  type="select-single" 
                  size={420} 
                  mapColor="#e5e7eb" 
                  strokeColor="#ffffff" 
                  strokeWidth={1} 
                  hoverColor="#c8ff00" 
                  cityColors={visitedStates} 
               />
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
