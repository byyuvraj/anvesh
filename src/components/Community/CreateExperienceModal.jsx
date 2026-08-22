import React, { useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import api from '../../lib/api';

export default function CreateExperienceModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    story: '',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/community/experience', formData);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to share experience. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-stone-100 bg-stone-50/50">
          <h3 className="font-black text-xl text-stone-900">Share Your Experience</h3>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-700 bg-white rounded-full border border-stone-200 shadow-sm transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {error && <div className="mb-4 text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl">{error}</div>}
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1.5">Destination / Location</label>
              <input 
                type="text" 
                required
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
                placeholder="e.g., Kyoto, Japan"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8ab836]/45"
              />
            </div>
            
            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1.5">Catchy Title</label>
              <input 
                type="text" 
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Finding peace in the bamboo forests"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8ab836]/45"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1.5">Your Story</label>
              <textarea 
                required
                rows={5}
                value={formData.story}
                onChange={e => setFormData({...formData, story: e.target.value})}
                placeholder="Share your favorite moments, hidden gems you found, or tips for other travelers..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8ab836]/45 resize-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase flex items-center gap-1.5 mb-1.5">
                <ImageIcon className="w-3 h-3" /> Image URL (Optional)
              </label>
              <input 
                type="url" 
                value={formData.imageUrl}
                onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8ab836]/45"
              />
              {formData.imageUrl && (
                <div className="mt-3 rounded-xl overflow-hidden h-32 w-full border border-stone-200">
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 mt-2 bg-[#8ab836] hover:bg-[#729c29] text-white rounded-xl font-bold shadow-md transition-all disabled:opacity-50"
            >
              {loading ? "Publishing..." : "Publish Experience"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
