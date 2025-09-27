import React from 'react';

export const AnimatedSheep: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Animated Sheep */}
      <div className="relative animate-bounce-slow">
        {/* Sheep Body */}
        <div className="relative">
          {/* Main body - fluffy and wooly */}
          <div className="w-16 h-12 bg-gray-100 rounded-full border-2 border-gray-300 relative overflow-hidden">
            {/* Wool texture - multiple fluffy circles */}
            <div className="absolute top-0 left-1 w-3 h-3 bg-white rounded-full border border-gray-200 opacity-80"></div>
            <div className="absolute top-1 right-1 w-4 h-4 bg-gray-50 rounded-full border border-gray-200 opacity-70"></div>
            <div className="absolute bottom-1 left-3 w-3 h-3 bg-white rounded-full border border-gray-200 opacity-80"></div>
            <div className="absolute bottom-0 right-2 w-2 h-2 bg-gray-50 rounded-full border border-gray-200 opacity-90"></div>
            <div className="absolute top-2 left-6 w-2 h-2 bg-white rounded-full border border-gray-200 opacity-75"></div>
          </div>
          
          {/* Legs - dark sheep legs */}
          <div className="absolute -bottom-2 left-2 flex space-x-1">
            <div className="w-1 h-3 bg-gray-800 animate-wiggle"></div>
            <div className="w-1 h-3 bg-gray-800 animate-wiggle-delayed"></div>
          </div>
          <div className="absolute -bottom-2 right-2 flex space-x-1">
            <div className="w-1 h-3 bg-gray-800 animate-wiggle"></div>
            <div className="w-1 h-3 bg-gray-800 animate-wiggle-delayed"></div>
          </div>
          
          {/* Head - darker than body */}
          <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
            <div className="w-7 h-6 bg-gray-600 rounded-full border-2 border-gray-700 relative">
              {/* Eyes */}
              <div className="absolute top-2 left-1 w-1 h-1 bg-black rounded-full animate-blink"></div>
              <div className="absolute top-2 right-1 w-1 h-1 bg-black rounded-full animate-blink"></div>
              
              {/* Snout */}
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-gray-800 rounded"></div>
              
              {/* Ears - floppy */}
              <div className="absolute top-1 left-0 w-1 h-2 bg-gray-700 rounded transform -rotate-12 origin-top"></div>
              <div className="absolute top-1 right-0 w-1 h-2 bg-gray-700 rounded transform rotate-12 origin-top"></div>
              
              {/* Wool on head */}
              <div className="absolute -top-1 left-1 w-2 h-2 bg-gray-200 rounded-full border border-gray-300 opacity-70"></div>
              <div className="absolute -top-0.5 right-1 w-1 h-1 bg-white rounded-full border border-gray-300 opacity-80"></div>
            </div>
          </div>
          
          {/* Tail */}
          <div className="absolute -right-1 top-3 w-1 h-1 bg-gray-200 rounded-full border border-gray-300 animate-wag"></div>
        </div>
      </div>
      
      {/* Speech bubble */}
      <div className="mt-4 relative animate-fade-in-out">
        <div className="bg-gray-100 text-gray-800 text-xs px-3 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center font-medium">Baa! 🐑</div>
          <div className="text-center text-xs mt-1">Keeping everyone cozy & warm!</div>
        </div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-200"></div>
        </div>
      </div>
      
      {/* Clouds of wool */}
      <div className="flex space-x-2 mt-2">
        <div className="w-2 h-1 bg-gray-200 rounded-full animate-pulse opacity-60"></div>
        <div className="w-1 h-1 bg-white rounded-full animate-pulse opacity-80" style={{ animationDelay: '0.5s' }}></div>
        <div className="w-3 h-1 bg-gray-100 rounded-full animate-pulse opacity-70" style={{ animationDelay: '1s' }}></div>
        <div className="w-1 h-1 bg-gray-200 rounded-full animate-pulse opacity-60" style={{ animationDelay: '1.5s' }}></div>
      </div>
    </div>
  );
};