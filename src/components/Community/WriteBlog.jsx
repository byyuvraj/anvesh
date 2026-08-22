import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import { Image as ImageIcon, Loader2, ArrowLeft, Send, MapPin, Plus } from 'lucide-react';

export default function WriteBlog() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Location selection
  const [locations, setLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [showNewLocationInput, setShowNewLocationInput] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationType, setNewLocationType] = useState('City');
  
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const { data } = await api.get('/locations');
        setLocations(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLocations();
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col justify-center items-center h-[600px] text-center px-4">
        <h2 className="text-3xl font-black text-stone-900 dark:text-white mb-4">Ready to share your journey?</h2>
        <p className="text-stone-500 dark:text-stone-400 mb-8 max-w-md">Join the Anvesh community to craft beautiful travel stories and inspire others.</p>
        <button onClick={() => navigate('/login')} className="bg-[#c8ff00] hover:bg-[#b8f200] text-stone-900 px-8 py-3 rounded-full font-black shadow-md transition-all">Login to Anvesh</button>
      </div>
    );
  }



  const handleCreateLocation = async () => {
    if (!newLocationName.trim()) return null;
    try {
      const { data } = await api.post('/locations', { name: newLocationName, type: newLocationType });
      setLocations([...locations, data]);
      return data.id;
    } catch (err) {
      console.error(err);
      alert("Failed to create new location");
      return null;
    }
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim() || content === '<p><br></p>') {
      alert("Please provide a title and some content.");
      return;
    }

    setIsPublishing(true);
    try {
      let finalLocationId = selectedLocationId;
      
      // If user is adding a new location instead of selecting from dropdown
      if (showNewLocationInput && newLocationName.trim()) {
        finalLocationId = await handleCreateLocation();
      }

      const { data } = await api.post('/blogs', {
        title,
        richContent: content,
        coverImage,
        locationId: finalLocationId || null
      });
      navigate(`/blog/${data.id}`);
    } catch (err) {
      console.error("Failed to publish blog", err);
      alert("Failed to publish your story.");
    } finally {
      setIsPublishing(false);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'image'],
      ['clean']
    ],
  };

  return (
    <div className="max-w-[900px] mx-auto py-10 px-4 animate-in fade-in duration-500">
      
      <div className="flex items-center justify-between mb-10">
        <button onClick={() => navigate('/community')} className="inline-flex items-center gap-2 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 font-bold text-sm transition-colors bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-4 py-2 rounded-full shadow-sm">
          <ArrowLeft className="w-4 h-4" /> Cancel
        </button>

        <button 
          onClick={handlePublish}
          disabled={isPublishing}
          className="bg-[#c8ff00] hover:bg-[#b8f200] text-stone-900 px-6 py-2.5 rounded-full font-black shadow-md transition-all disabled:opacity-50 flex items-center gap-2 text-sm"
        >
          {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          Publish Data Point
        </button>
      </div>

      {/* Editor Area */}
      <div className="apple-glass p-8 sm:p-12 rounded-[3rem] shadow-sm">
        
        {/* Cover Image URL Input */}
        <div className="mb-10 relative group w-full">
          {coverImage ? (
            <div className="relative w-full h-[300px] sm:h-[400px] rounded-[2rem] overflow-hidden shadow-lg border border-stone-200 dark:border-stone-800 mb-4">
              <img src={coverImage} alt="Cover" className="w-full h-full object-cover" onError={() => setCoverImage('')} />
              <button onClick={() => setCoverImage('')} className="absolute top-4 right-4 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md hover:bg-white dark:hover:bg-stone-800 px-4 py-2 rounded-full text-xs font-bold text-stone-700 dark:text-stone-300 transition-all shadow-sm border border-stone-200 dark:border-stone-700">
                Remove Cover
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-[250px] border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-[2rem] bg-white/50 dark:bg-stone-900/50 hover:bg-white dark:hover:bg-stone-800 transition-colors p-6 text-center">
              <div className="w-16 h-16 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ImageIcon className="w-6 h-6 text-stone-400 dark:text-stone-500" />
              </div>
              <span className="text-stone-700 dark:text-stone-300 font-bold mb-2">Add a Cover Photo</span>
              <input 
                type="url" 
                placeholder="Paste an image URL here..." 
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full max-w-md bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8ab836] dark:focus:border-[#c8ff00] transition-colors"
              />
            </div>
          )}
        </div>

        {/* Location Selector */}
        <div className="mb-10 p-6 bg-white/60 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-3xl">
          <label className="flex items-center gap-2 text-sm font-bold text-stone-600 dark:text-stone-400 mb-3 uppercase tracking-widest">
            <MapPin className="w-4 h-4 text-[#8ab836] dark:text-[#c8ff00]" /> Map this story to a location
          </label>
          
          {!showNewLocationInput ? (
            <div className="flex items-center gap-4">
              <select 
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                className="flex-grow bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-stone-700 dark:text-stone-300 font-medium focus:outline-none focus:ring-2 focus:ring-[#c8ff00]/50"
              >
                <option value="">Select an existing location...</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name} ({loc.type})</option>
                ))}
              </select>
              <button 
                onClick={() => setShowNewLocationInput(true)}
                className="bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 px-4 py-3 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 whitespace-nowrap border border-stone-200 dark:border-stone-700"
              >
                <Plus className="w-4 h-4" /> Add New
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-stone-900 p-4 rounded-2xl border border-[#c8ff00]/50 shadow-sm">
              <input 
                type="text" 
                placeholder="Location Name (e.g., Spiti Valley)" 
                value={newLocationName}
                onChange={(e) => setNewLocationName(e.target.value)}
                className="flex-grow bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#8ab836] dark:focus:border-[#c8ff00]"
              />
              <select 
                value={newLocationType}
                onChange={(e) => setNewLocationType(e.target.value)}
                className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#8ab836] dark:focus:border-[#c8ff00]"
              >
                <option value="State">State</option>
                <option value="City">City</option>
                <option value="Village">Village</option>
                <option value="HiddenGem">Hidden Gem</option>
              </select>
              <button 
                onClick={() => setShowNewLocationInput(false)}
                className="text-xs font-bold text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <input 
          type="text" 
          placeholder="Give your story a title" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-4xl sm:text-6xl font-black text-stone-900 dark:text-white border-none outline-none placeholder-stone-300 dark:placeholder-stone-700 mb-10 font-serif tracking-tight bg-transparent"
        />
        
        <div className="prose prose-lg sm:prose-xl max-w-none prose-p:font-serif prose-p:leading-loose text-stone-700 dark:text-stone-300 editor-container bg-white/40 dark:bg-stone-900/40 rounded-3xl p-4">
          <ReactQuill 
            theme="snow" 
            value={content} 
            onChange={setContent} 
            modules={modules}
            placeholder="Document your experience..."
            className="min-h-[400px]"
          />
        </div>
      </div>

    </div>
  );
}
