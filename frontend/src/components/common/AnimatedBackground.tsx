import React from 'react';

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Main gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-green-100"></div>
      
      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-grid-pattern animate-grid-flow"></div>
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-green-400 rounded-full opacity-30 animate-float-${i % 4}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          ></div>
        ))}
      </div>
      
      {/* Animated light orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-200 rounded-full opacity-20 blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-200 rounded-full opacity-15 blur-3xl animate-pulse-slow-delayed"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-300 rounded-full opacity-10 blur-3xl animate-pulse-slower"></div>
      
      {/* Moving light beams */}
      <div className="absolute inset-0">
        <div className="absolute w-1 h-full bg-gradient-to-b from-transparent via-green-300 to-transparent opacity-30 animate-beam-1"></div>
        <div className="absolute w-1 h-full bg-gradient-to-b from-transparent via-emerald-300 to-transparent opacity-25 animate-beam-2"></div>
        <div className="absolute w-1 h-full bg-gradient-to-b from-transparent via-green-400 to-transparent opacity-20 animate-beam-3"></div>
      </div>
      
      {/* Grid lines with animation */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="rgb(34, 197, 94)"
              strokeWidth="0.5"
              opacity="0.2"
              className="animate-grid-pulse"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
};