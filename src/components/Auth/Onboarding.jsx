import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Compass, Map, Wallet, Sparkles, Loader2 } from 'lucide-react';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, setCredentials } = useAuthStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    travelStyle: 'Explorer',
    placesVisitedCount: 0,
    budgetPreference: 'Mid-range',
    preferredVibe: 'Nature'
  });

  const travelStyles = [
    { name: 'Explorer', desc: 'Seeking the unknown and venturing off the beaten path.' },
    { name: 'Luxury', desc: 'Prioritizing comfort, fine dining, and premium experiences.' },
    { name: 'Backpacker', desc: 'Budget-conscious, adventurous, and always on the move.' },
    { name: 'Digital Nomad', desc: 'Working remotely from cafes with beautiful views.' },
    { name: 'History Buff', desc: 'Fascinated by ancient ruins, museums, and local heritage.' },
    { name: 'Foodie', desc: 'Planning entire trips around local cuisines and street food.' }
  ];
  const budgets = ['Budget', 'Mid-range', 'Luxury', 'No Limit'];
  const vibes = ['Nature', 'City Life', 'Historical', 'Adventure', 'Relaxation'];

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const getSliderMessage = (count) => {
    const c = parseInt(count, 10);
    if (c === 0) return "Just getting started. Your journey begins now!";
    if (c < 20) return "We all start somewhere! The world awaits.";
    if (c === 42) return "42? The answer to life, the universe, and everything!";
    if (c === 69) return "Nice.";
    if (c === 80) return "Around the world in 80 places? Jules Verne would be proud.";
    if (c < 50) return "An expanding map. You've seen some incredible things.";
    if (c < 80) return "A true explorer! You're building an impressive travel journal.";
    if (c < 100) return "A seasoned globetrotter! The world is your playground.";
    return "A true master of the map! Have you been everywhere?";
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data } = await api.post('/auth/onboarding', formData);
      // Update store with new user data containing onboardingComplete: true
      const token = localStorage.getItem('auth_token');
      setCredentials(data, token);
      navigate('/community');
    } catch (err) {
      console.error("Onboarding failed", err);
      alert("Something went wrong during onboarding.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-full min-h-[700px] animate-in fade-in duration-500 w-full px-4">
      <div className="apple-glass p-8 sm:p-12 rounded-[3rem] max-w-2xl w-full shadow-2xl relative overflow-hidden border border-white dark:border-stone-800">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-stone-100 dark:bg-stone-800">
          <div 
            className="h-full bg-[#c8ff00] transition-all duration-500 ease-out" 
            style={{ width: `${(step / 4) * 100}%` }} 
          />
        </div>

        <div className="text-center mb-10 mt-4">
          <span className="text-stone-400 dark:text-stone-500 font-bold tracking-[0.2em] text-[10px] uppercase block mb-3">Step {step} of 4</span>
          <h2 className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white tracking-tighter">
            {step === 1 && "What's your travel style?"}
            {step === 2 && "How much of the world have you seen?"}
            {step === 3 && "What's your typical budget?"}
            {step === 4 && "What vibe speaks to you?"}
          </h2>
        </div>

        {/* STEP 1: Travel Style */}
        {step === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-right-4">
            {travelStyles.map(({name, desc}) => (
              <button
                key={name}
                onClick={() => setFormData({ ...formData, travelStyle: name })}
                className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-2 text-center ${
                  formData.travelStyle === name 
                    ? 'border-[#c8ff00] bg-white dark:bg-stone-900 shadow-md text-stone-900 dark:text-white scale-105' 
                    : 'border-transparent bg-stone-50/50 dark:bg-stone-800/50 hover:bg-white dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400'
                }`}
              >
                <Compass className={`w-8 h-8 mb-1 ${formData.travelStyle === name ? 'text-[#c8ff00]' : 'text-stone-400 dark:text-stone-500'}`} />
                <span className="font-bold text-lg">{name}</span>
                <span className={`text-xs font-medium leading-relaxed px-2 ${formData.travelStyle === name ? 'text-stone-600 dark:text-stone-300' : 'text-stone-400 dark:text-stone-500'}`}>{desc}</span>
              </button>
            ))}
          </div>
        )}

        {/* STEP 2: Places Visited */}
        {step === 2 && (
          <div className="flex flex-col items-center animate-in slide-in-from-right-4 py-10">
            <Map className="w-16 h-16 text-stone-300 dark:text-stone-600 mb-8" />
            <div className="flex flex-col items-center mb-6">
              <span className="text-6xl font-black text-stone-900 dark:text-white font-serif">{formData.placesVisitedCount}{formData.placesVisitedCount == 100 ? '+' : ''}</span>
              <span className="text-stone-500 dark:text-stone-400 font-bold uppercase tracking-widest text-xs mt-2 text-center px-4">Approximate Cities / Villages</span>
            </div>
            
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={formData.placesVisitedCount}
              onChange={(e) => setFormData({ ...formData, placesVisitedCount: e.target.value })}
              className="w-full max-w-md accent-[#c8ff00] mb-10"
            />
            
            <p className="text-center font-serif text-lg sm:text-xl text-stone-600 dark:text-stone-300 min-h-[60px] max-w-sm italic">
              "{getSliderMessage(formData.placesVisitedCount)}"
            </p>
          </div>
        )}

        {/* STEP 3: Budget */}
        {step === 3 && (
          <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-right-4">
            {budgets.map(budget => (
              <button
                key={budget}
                onClick={() => setFormData({ ...formData, budgetPreference: budget })}
                className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-3 font-bold ${
                  formData.budgetPreference === budget 
                    ? 'border-[#c8ff00] bg-white dark:bg-stone-900 shadow-md text-stone-900 dark:text-white scale-105' 
                    : 'border-transparent bg-stone-50/50 dark:bg-stone-800/50 hover:bg-white dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400'
                }`}
              >
                <Wallet className={`w-8 h-8 ${formData.budgetPreference === budget ? 'text-[#c8ff00]' : 'text-stone-400 dark:text-stone-500'}`} />
                {budget}
              </button>
            ))}
          </div>
        )}

        {/* STEP 4: Vibe */}
        {step === 4 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 animate-in slide-in-from-right-4">
            {vibes.map(vibe => (
              <button
                key={vibe}
                onClick={() => setFormData({ ...formData, preferredVibe: vibe })}
                className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-3 font-bold text-sm ${
                  formData.preferredVibe === vibe 
                    ? 'border-[#c8ff00] bg-white dark:bg-stone-900 shadow-md text-stone-900 dark:text-white scale-105' 
                    : 'border-transparent bg-stone-50/50 dark:bg-stone-800/50 hover:bg-white dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400'
                }`}
              >
                <Sparkles className={`w-6 h-6 ${formData.preferredVibe === vibe ? 'text-[#c8ff00]' : 'text-stone-400 dark:text-stone-500'}`} />
                {vibe}
              </button>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12 pt-6 border-t border-stone-200/50 dark:border-stone-700/50">
          <button 
            onClick={handlePrev}
            disabled={step === 1}
            className="px-6 py-3 font-bold text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 disabled:opacity-0 transition-colors"
          >
            Back
          </button>
          
          {step < 4 ? (
            <button 
              onClick={handleNext}
              className="bg-stone-900 dark:bg-white hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900 px-8 py-3 rounded-full font-bold shadow-md transition-all hover:scale-105"
            >
              Continue
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-[#c8ff00] hover:bg-[#b8f200] text-stone-900 px-8 py-3 rounded-full font-black shadow-md transition-all hover:scale-105 flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Complete Profile
            </button>
          )}
        </div>
        
      </div>
    </div>
  );
}
