import React, { useState } from 'react';

export default function CoverImage({ src, alt, locationName, className = '' }) {
  const [error, setError] = useState(false);

  const showFallback = !src || error;

  if (showFallback) {
    return (
      <div className={`w-full h-full relative overflow-hidden bg-stone-950 flex items-center justify-center group ${className}`}>
        {/* Blurry, travel-like ambient green/teal background */}
        <div className="absolute inset-0 opacity-50 mix-blend-screen transition-opacity duration-1000 group-hover:opacity-70">
          <div className="absolute top-0 -left-12 w-64 h-64 bg-[#c8ff00] rounded-full mix-blend-multiply filter blur-[80px] animate-blob" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-600 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000" />
          <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-teal-500 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-4000" />
        </div>
        
        {/* Dark overlay to ensure text is always readable */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

        {/* Location Name centered */}
        <div className="relative z-10 p-6 flex items-center justify-center w-full h-full">
          <h2 className="text-white font-serif italic text-3xl md:text-4xl lg:text-5xl font-black text-center tracking-wide leading-tight drop-shadow-2xl group-hover:scale-110 transition-transform duration-1000 ease-out">
            {locationName || alt || 'Unknown Location'}
          </h2>
        </div>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      onError={() => setError(true)} 
    />
  );
}
