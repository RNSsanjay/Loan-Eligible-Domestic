import React from 'react';

export const AnimatedChicken: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Animated Chicken */}
      <div className="relative animate-bounce-slow">
        {/* Chicken Body */}
        <div className="relative">
          {/* Main body - round and fluffy */}
          <div className="w-14 h-12 bg-white rounded-full border-2 border-yellow-400 relative overflow-hidden">
            {/* Feather texture */}
            <div className="absolute inset-1 bg-gradient-to-br from-white to-yellow-50 rounded-full"></div>
            <div className="absolute top-2 left-2 w-2 h-1 bg-yellow-100 rounded opacity-60"></div>
            <div className="absolute top-4 right-2 w-3 h-1 bg-yellow-100 rounded opacity-60"></div>
          </div>
          
          {/* Legs - orange chicken legs */}
          <div className="absolute -bottom-2 left-3 flex space-x-2">
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-2 bg-orange-400 animate-wiggle"></div>
              <div className="w-2 h-0.5 bg-orange-400"></div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-2 bg-orange-400 animate-wiggle-delayed"></div>
              <div className="w-2 h-0.5 bg-orange-400"></div>
            </div>
          </div>
          
          {/* Head */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="w-6 h-6 bg-white rounded-full border-2 border-yellow-400 relative">
              {/* Eyes */}
              <div className="absolute top-1 left-1 w-1 h-1 bg-black rounded-full animate-blink"></div>
              <div className="absolute top-1 right-1 w-1 h-1 bg-black rounded-full animate-blink"></div>
              
              {/* Beak */}
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-orange-400"></div>
              
              {/* Comb (red crown) */}
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 flex">
                <div className="w-1 h-2 bg-red-500 rounded-full transform -rotate-12"></div>
                <div className="w-1 h-3 bg-red-500 rounded-full"></div>
                <div className="w-1 h-2 bg-red-500 rounded-full transform rotate-12"></div>
              </div>
              
              {/* Wattles (red dangly bits) */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1">
                <div className="w-1 h-1 bg-red-400 rounded-full"></div>
              </div>
            </div>
          </div>
          
          {/* Wing */}
          <div className="absolute left-1 top-2 w-4 h-3 bg-yellow-100 rounded border border-yellow-400 transform rotate-12 animate-wing-flap"></div>
          
          {/* Tail feathers */}
          <div className="absolute -right-1 top-0 flex flex-col space-y-0.5">
            <div className="w-3 h-1 bg-yellow-300 rounded transform rotate-45 animate-sway"></div>
            <div className="w-4 h-1 bg-yellow-400 rounded transform rotate-30 animate-sway-delayed"></div>
            <div className="w-3 h-1 bg-yellow-300 rounded transform rotate-60 animate-sway"></div>
          </div>
        </div>
      </div>
      
      {/* Speech bubble */}
      <div className="mt-4 relative animate-fade-in-out">
        <div className="bg-yellow-100 text-yellow-800 text-xs px-3 py-2 rounded-lg shadow-sm border border-yellow-200">
          <div className="text-center font-medium">Cluck! 🐔</div>
          <div className="text-center text-xs mt-1">Counting applications all day!</div>
        </div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-yellow-200"></div>
        </div>
      </div>
      
      {/* Scattered feed */}
      <div className="flex space-x-1 mt-2">
        <div className="w-0.5 h-0.5 bg-amber-600 rounded-full animate-pulse"></div>
        <div className="w-1 h-1 bg-amber-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="w-0.5 h-0.5 bg-amber-700 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="w-1 h-1 bg-amber-600 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="w-0.5 h-0.5 bg-amber-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
      </div>
    </div>
  );
};