import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import { Camera, Edit3, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UserProfile() {
  const { user, checkAuth } = useAuthStore();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Helper to compress image and return a low-res base64 string
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
          resolve(canvas.toDataURL('image/jpeg', 0.6)); // High compression (low res)
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  useEffect(() => {
    const fetchMyBlogs = async () => {
      try {
        const { data } = await api.get('/blogs');
        if (user) {
          setBlogs(data.filter(b => b.userId === user.id));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchMyBlogs();
  }, [user]);

  if (!user) return <div className="text-center py-32 font-black text-3xl text-stone-400 tracking-tighter">Please login to view your profile.</div>;

  const handleUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    type === 'cover' ? setIsUploadingCover(true) : setIsUploadingAvatar(true);
    
    try {
      // Compress the image before uploading to keep the DB footprint small
      // Cover photos can be wider, avatars can be small squares
      const maxW = type === 'cover' ? 800 : 300;
      const maxH = type === 'cover' ? 400 : 300;
      
      const compressedBase64 = await compressImage(file, maxW, maxH);
      
      const payload = type === 'cover' 
        ? { coverPhoto: compressedBase64 } 
        : { profilePicture: compressedBase64 };

      await api.put('/auth/profile', payload);
      
      // Refresh the user profile globally so the UI updates
      await checkAuth();
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to update profile picture.");
    } finally {
      type === 'cover' ? setIsUploadingCover(false) : setIsUploadingAvatar(false);
    }
  };

  return (
    <div className="w-full max-w-[1000px] mx-auto flex flex-col gap-10 animate-in fade-in duration-500 pb-20 pt-4">
      
      {/* Cover & Avatar Header */}
      <div className="apple-glass-solid rounded-[3rem] overflow-hidden relative pb-10 shadow-xl border border-white dark:border-stone-800">
        
        {/* Cover Photo */}
        <div className="h-[300px] sm:h-[400px] w-full bg-stone-100 dark:bg-stone-900 relative group">
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
            <div className="w-40 h-40 rounded-full border-4 border-white dark:border-stone-900 bg-stone-200 dark:bg-stone-800 overflow-hidden shadow-xl relative group flex-shrink-0 z-10">
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
              <h1 className="text-4xl sm:text-5xl font-black text-stone-900 dark:text-white leading-none tracking-tighter mb-2">@{user.username}</h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <span className="text-[10px] font-bold text-stone-600 dark:text-stone-300 bg-[#c8ff00]/20 dark:bg-[#c8ff00]/10 px-3 py-1 rounded-full uppercase tracking-widest border border-[#c8ff00] dark:border-[#c8ff00]/50">{user.travelStyle || 'Traveler'}</span>
                <span className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-widest">Joined {new Date(user.createdAt).getFullYear()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mb-2 z-10 w-full sm:w-auto justify-center">
              <button className="w-12 h-12 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-center text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors shadow-sm">
                <Settings className="w-5 h-5" />
              </button>
              <Link to="/write" className="flex-grow sm:flex-grow-0 bg-stone-900 dark:bg-white hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900 px-8 py-3.5 rounded-full font-bold shadow-xl transition-all flex items-center justify-center gap-2 text-sm border border-stone-700 dark:border-white">
                <Edit3 className="w-4 h-4" /> Add Data Point
              </Link>
            </div>
          </div>
        </div>
        
        {/* Bio */}
        {user.bio && (
          <div className="px-8 sm:px-12 mt-8 text-stone-600 font-serif text-lg leading-relaxed max-w-2xl text-center sm:text-left mx-auto sm:mx-0">
            "{user.bio}"
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex justify-center border-b border-stone-200/50 dark:border-stone-800/50 mt-4 mb-8 sticky top-24 z-30 bg-white/50 dark:bg-stone-950/50 backdrop-blur-md px-4 py-2 rounded-full mx-auto w-fit">
        <button className="px-6 py-2.5 font-black text-stone-900 dark:text-white bg-white dark:bg-stone-900 rounded-full shadow-sm text-sm border border-stone-200 dark:border-stone-700">
          Data Points
        </button>
      </div>

      {/* Blog Grid */}
      {loading ? (
        <div className="text-center py-20 font-bold text-stone-400 dark:text-stone-500">Loading journal...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {blogs.length === 0 ? (
            <div className="col-span-full py-20 apple-glass rounded-[3rem] text-center flex flex-col items-center justify-center gap-4 border border-stone-200 dark:border-stone-800">
              <span className="text-stone-400 dark:text-stone-500 font-serif text-xl">Your journal is currently empty.</span>
              <Link to="/write" className="text-stone-900 px-6 py-2 rounded-full shadow-sm text-sm font-black hover:underline underline-offset-4 bg-[#c8ff00]">Start charting your first location</Link>
            </div>
          ) : (
            blogs.map(blog => (
              <Link key={blog.id} to={`/blog/${blog.id}`} className="group apple-glass rounded-[2rem] hover:shadow-xl hover:border-stone-300 dark:hover:border-stone-600 transition-all flex flex-col overflow-hidden border border-stone-200 dark:border-stone-800">
                <div className="h-56 w-full overflow-hidden relative">
                  {blog.coverImage ? (
                    <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/50 dark:bg-stone-900/50 text-stone-300 dark:text-stone-600">
                      <Edit3 className="w-8 h-8 opacity-50" />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <span className="text-[10px] text-stone-400 dark:text-stone-500 font-bold block mb-2 tracking-widest uppercase">{new Date(blog.createdAt).toLocaleDateString()}</span>
                  <h3 className="font-black text-xl text-stone-900 dark:text-white leading-tight group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors font-serif line-clamp-2">{blog.title}</h3>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

    </div>
  );
}
