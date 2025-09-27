import React from 'react';

export const AnimatedPig: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Animated Pig */}
      <div className="relative animate-bounce-slow">
        {/* Pig Body */}
        <div className="relative">
          {/* Main body */}
          <div className="w-16 h-12 bg-pink-300 rounded-full border-2 border-pink-500 relative">
            {/* Body spots */}
            <div className="absolute top-2 left-3 w-2 h-2 bg-pink-400 rounded-full opacity-60"></div>
            <div className="absolute top-4 right-2 w-1 h-1 bg-pink-400 rounded-full opacity-60"></div>
          </div>
          
          {/* Legs */}
          <div className="absolute -bottom-2 left-2 flex space-x-1">
            <div className="w-1 h-3 bg-pink-500 animate-wiggle"></div>
            <div className="w-1 h-3 bg-pink-500 animate-wiggle-delayed"></div>
          </div>
          <div className="absolute -bottom-2 right-2 flex space-x-1">
            <div className="w-1 h-3 bg-pink-500 animate-wiggle"></div>
            <div className="w-1 h-3 bg-pink-500 animate-wiggle-delayed"></div>
          </div>
          
          {/* Head */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            <div className="w-8 h-8 bg-pink-300 rounded-full border-2 border-pink-500 relative">
              {/* Eyes */}
              <div className="absolute top-2 left-1 w-1 h-1 bg-black rounded-full animate-blink"></div>
              <div className="absolute top-2 right-1 w-1 h-1 bg-black rounded-full animate-blink"></div>
              
              {/* Snout */}
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-pink-400 rounded-full border border-pink-500">
                {/* Nostrils */}
                <div className="absolute top-0 left-1 w-0.5 h-0.5 bg-pink-600 rounded-full"></div>
                <div className="absolute top-0 right-1 w-0.5 h-0.5 bg-pink-600 rounded-full"></div>
              </div>
              
              {/* Ears */}
              <div className="absolute -top-1 left-1 w-2 h-2 bg-pink-300 border border-pink-500 rounded-full transform rotate-45"></div>
              <div className="absolute -top-1 right-1 w-2 h-2 bg-pink-300 border border-pink-500 rounded-full transform -rotate-45"></div>
            </div>
          </div>
          
          {/* Curly tail */}
          <div className="absolute -right-2 top-1 transform origin-top animate-wag">
            <div className="w-1 h-1 border-2 border-pink-500 rounded-full"></div>
            <div className="w-1 h-1 border-2 border-pink-500 rounded-full transform translate-x-1 -translate-y-1"></div>
          </div>
        </div>
      </div>
      
      {/* Speech bubble */}
      <div className="mt-4 relative animate-fade-in-out">
        <div className="bg-pink-100 text-pink-800 text-xs px-3 py-2 rounded-lg shadow-sm border border-pink-200">
          <div className="text-center font-medium">Oink! 🐷</div>
          <div className="text-center text-xs mt-1">Keep up the great work!</div>
        </div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-pink-200"></div>
        </div>
      </div>
      
      {/* Mud puddles */}
      <div className="flex space-x-2 mt-2">
        <div className="w-3 h-1 bg-amber-600 rounded-full opacity-60 animate-pulse"></div>
        <div className="w-2 h-1 bg-amber-700 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="w-4 h-1 bg-amber-600 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>
    </div>
  );
};