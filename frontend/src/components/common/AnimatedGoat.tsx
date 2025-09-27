import React from 'react';

export const AnimatedGoat: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Animated Goat */}
      <div className="relative animate-bounce-slow">
        {/* Goat Body */}
        <div className="relative">
          {/* Main body */}
          <div className="w-16 h-10 bg-gray-100 rounded-full border-2 border-gray-400 relative">
            {/* Body texture */}
            <div className="absolute top-1 left-2 w-2 h-1 bg-gray-200 rounded opacity-60"></div>
            <div className="absolute top-3 right-3 w-3 h-1 bg-gray-200 rounded opacity-60"></div>
          </div>
          
          {/* Legs */}
          <div className="absolute -bottom-2 left-2 flex space-x-1">
            <div className="w-1 h-3 bg-gray-600 animate-wiggle"></div>
            <div className="w-1 h-3 bg-gray-600 animate-wiggle-delayed"></div>
          </div>
          <div className="absolute -bottom-2 right-2 flex space-x-1">
            <div className="w-1 h-3 bg-gray-600 animate-wiggle"></div>
            <div className="w-1 h-3 bg-gray-600 animate-wiggle-delayed"></div>
          </div>
          
          {/* Head */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            <div className="w-8 h-7 bg-gray-100 rounded-full border-2 border-gray-400 relative">
              {/* Eyes */}
              <div className="absolute top-2 left-1 w-1 h-1 bg-black rounded-full animate-blink"></div>
              <div className="absolute top-2 right-1 w-1 h-1 bg-black rounded-full animate-blink"></div>
              
              {/* Snout - elongated for goat */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-gray-200 rounded border border-gray-400"></div>
              
              {/* Ears - long and floppy */}
              <div className="absolute top-0 left-0 w-1 h-4 bg-gray-100 border border-gray-400 rounded transform rotate-45 origin-top"></div>
              <div className="absolute top-0 right-0 w-1 h-4 bg-gray-100 border border-gray-400 rounded transform -rotate-45 origin-top"></div>
              
              {/* Horns - small and curved */}
              <div className="absolute -top-2 left-2 w-0.5 h-2 bg-yellow-600 rounded transform rotate-12"></div>
              <div className="absolute -top-2 right-2 w-0.5 h-2 bg-yellow-600 rounded transform -rotate-12"></div>
              
              {/* Goatee */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-gray-300 rounded"></div>
            </div>
          </div>
          
          {/* Tail */}
          <div className="absolute -right-2 top-1 w-0.5 h-3 bg-gray-400 transform origin-top animate-wag"></div>
        </div>
      </div>
      
      {/* Speech bubble */}
      <div className="mt-4 relative animate-fade-in-out">
        <div className="bg-gray-100 text-gray-800 text-xs px-3 py-2 rounded-lg shadow-sm border border-gray-300">
          <div className="text-center font-medium">Baah! 🐐</div>
          <div className="text-center text-xs mt-1">Financial goals ahead!</div>
        </div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-300"></div>
        </div>
      </div>
      
      {/* Rocks */}
      <div className="flex space-x-1 mt-2">
        <div className="w-2 h-1 bg-gray-500 rounded animate-pulse opacity-70"></div>
        <div className="w-1 h-2 bg-gray-600 rounded animate-pulse opacity-60" style={{ animationDelay: '0.5s' }}></div>
        <div className="w-3 h-1 bg-gray-500 rounded animate-pulse opacity-50" style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  );
};