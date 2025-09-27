import React from 'react';

export const AnimatedCow: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Animated Cow */}
      <div className="relative animate-bounce-slow">
        {/* Cow Body */}
        <div className="relative">
          {/* Main body */}
          <div className="w-16 h-12 bg-white rounded-full border-2 border-black relative">
            {/* Black spots */}
            <div className="absolute top-1 left-2 w-3 h-3 bg-black rounded-full"></div>
            <div className="absolute top-3 right-3 w-2 h-2 bg-black rounded-full"></div>
            <div className="absolute bottom-2 left-4 w-2 h-2 bg-black rounded-full"></div>
          </div>
          
          {/* Legs */}
          <div className="absolute -bottom-2 left-2 flex space-x-1">
            <div className="w-1 h-3 bg-black animate-wiggle"></div>
            <div className="w-1 h-3 bg-black animate-wiggle-delayed"></div>
          </div>
          <div className="absolute -bottom-2 right-2 flex space-x-1">
            <div className="w-1 h-3 bg-black animate-wiggle"></div>
            <div className="w-1 h-3 bg-black animate-wiggle-delayed"></div>
          </div>
          
          {/* Head */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            <div className="w-8 h-8 bg-white rounded-full border-2 border-black relative">
              {/* Eyes */}
              <div className="absolute top-2 left-1 w-1 h-1 bg-black rounded-full animate-blink"></div>
              <div className="absolute top-2 right-1 w-1 h-1 bg-black rounded-full animate-blink"></div>
              
              {/* Nose */}
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-pink-300 rounded"></div>
              
              {/* Ears */}
              <div className="absolute -top-1 left-0 w-2 h-3 bg-white border border-black rounded-full transform rotate-12"></div>
              <div className="absolute -top-1 right-0 w-2 h-3 bg-white border border-black rounded-full transform -rotate-12"></div>
              
              {/* Horns */}
              <div className="absolute -top-3 left-1 w-1 h-2 bg-gray-600 rounded transform rotate-12"></div>
              <div className="absolute -top-3 right-1 w-1 h-2 bg-gray-600 rounded transform -rotate-12"></div>
            </div>
          </div>
          
          {/* Tail */}
          <div className="absolute -right-2 top-2 w-1 h-4 bg-black transform origin-top animate-wag"></div>
        </div>
      </div>
      
      {/* Speech bubble */}
      <div className="mt-4 relative animate-fade-in-out">
        <div className="bg-green-100 text-green-800 text-xs px-3 py-2 rounded-lg shadow-sm border border-green-200">
          <div className="text-center font-medium">Moo! 🐄</div>
          <div className="text-center text-xs mt-1">Good luck with verification!</div>
        </div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-green-200"></div>
        </div>
      </div>
      
      {/* Grass animation */}
      <div className="flex space-x-1 mt-2">
        <div className="w-1 h-2 bg-green-400 rounded-t animate-sway"></div>
        <div className="w-1 h-3 bg-green-500 rounded-t animate-sway-delayed"></div>
        <div className="w-1 h-2 bg-green-400 rounded-t animate-sway"></div>
        <div className="w-1 h-3 bg-green-500 rounded-t animate-sway-delayed"></div>
        <div className="w-1 h-2 bg-green-400 rounded-t animate-sway"></div>
      </div>
    </div>
  );
};