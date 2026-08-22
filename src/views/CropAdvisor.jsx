import React, { useState } from 'react';
import { FlaskConical, Droplet, ThermometerSun, TestTube, Sprout } from 'lucide-react';
import axios from 'axios';

const USER_ID = 1;
const API_URL = 'http://localhost:8000/api';

export default function CropAdvisor() {
  const [formData, setFormData] = useState({
    n: 50,
    p: 40,
    k: 30,
    ph: 6.5,
    rain: 100,
    temp: 26,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post(`${API_URL}/predict`, {
        user_id: USER_ID,
        ...formData
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "ML Model failed. Please ensure the backend is running and the model is trained.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-leaf-800">Smart Crop Advisor</h1>
        <p className="text-earth-600 mt-2">Scientific Soil Analysis & ML Prediction.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form */}
        <div className="lg:col-span-1">
          <form onSubmit={handleAnalyze} className="premium-card p-6">
            <h2 className="text-xl font-bold text-earth-900 mb-6 flex items-center gap-2">
              <FlaskConical className="text-leaf-600 w-6 h-6" />
              Enter Lab Data
            </h2>

            <div className="space-y-5">
              <SliderInput 
                label="Nitrogen (N)" val={formData.n} min={0} max={140}
                onChange={(v) => setFormData({...formData, n: v})} 
              />
              <SliderInput 
                label="Phosphorus (P)" val={formData.p} min={0} max={145}
                onChange={(v) => setFormData({...formData, p: v})} 
              />
              <SliderInput 
                label="Potassium (K)" val={formData.k} min={0} max={205}
                onChange={(v) => setFormData({...formData, k: v})} 
              />
              <SliderInput 
                label="pH Level" val={formData.ph} min={0} max={14} step={0.1}
                onChange={(v) => setFormData({...formData, ph: v})} 
              />
              
              <div className="pt-2 border-t border-earth-100">
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="text-sm font-semibold text-earth-700 flex items-center gap-1"><Droplet className="w-4 h-4 text-blue-500"/> Rain (mm)</label>
                    <input type="number" className="w-full mt-1 p-2 border border-earth-200 rounded-lg" value={formData.rain} onChange={e => setFormData({...formData, rain: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-earth-700 flex items-center gap-1"><ThermometerSun className="w-4 h-4 text-amber-500"/> Temp (°C)</label>
                    <input type="number" className="w-full mt-1 p-2 border border-earth-200 rounded-lg" value={formData.temp} onChange={e => setFormData({...formData, temp: Number(e.target.value)})} />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full btn-primary py-3 mt-4 flex justify-center items-center gap-2 text-lg"
              >
                {loading ? (
                  <span className="animate-pulse">Analyzing...</span>
                ) : (
                  <>Analyze Soil <TestTube className="w-5 h-5" /></>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-2">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 mb-6">
              {error}
            </div>
          )}

          {result ? (
            <div className="space-y-6 animate-slide-up">
              <div className="p-8 bg-gradient-to-br from-leaf-800 to-leaf-900 rounded-2xl shadow-xl text-white relative overflow-hidden">
                <Sprout className="absolute -bottom-10 -right-10 w-64 h-64 opacity-10 text-leaf-300 transform -rotate-12" />
                <div className="relative z-10">
                  <h3 className="text-leaf-200 font-semibold mb-2 uppercase tracking-wider text-sm">Recommended Crop</h3>
                  <h2 className="text-5xl font-bold mb-4">{result.crop}</h2>
                  <div className="inline-flex items-center bg-white/20 backdrop-blur-md rounded-full px-4 py-1.5 text-sm font-medium">
                    ML Confidence Score: {result.confidence}%
                  </div>
                </div>
              </div>

              <div className="premium-card p-6">
                <h3 className="text-lg font-bold text-earth-900 mb-2">Fertilizer Recommendation</h3>
                <p className="text-earth-700">
                  <strong className="text-leaf-700">Key Input for {result.crop}:</strong> Apply standard basal dose.
                </p>
                <p className="text-earth-600 text-sm mt-2">
                  <strong>Why?</strong> The ML model determined {result.crop} is best suited for your NPK profile (N={formData.n}, P={formData.p}, K={formData.k}) and regional climate (Rainfall={formData.rain}mm, Temp={formData.temp}°C).
                </p>
                <p className="text-xs text-earth-400 mt-4 italic">Record saved permanently to SQLite farm database.</p>
              </div>
            </div>
          ) : (
            <div className="h-full premium-card flex flex-col items-center justify-center p-12 text-center text-earth-500 border-dashed border-2">
              <FlaskConical className="w-16 h-16 text-earth-300 mb-4" />
              <p className="text-lg">Submit your soil parameters to get an ML-powered crop recommendation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SliderInput({ label, val, min, max, step=1, onChange }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-sm font-semibold text-earth-700">{label}</label>
        <span className="text-sm font-bold text-leaf-600">{val}</span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step}
        value={val}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-leaf-600"
      />
    </div>
  );
}
