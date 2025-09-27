import React, { useState, useEffect } from 'react';
import { AnimatedCow } from './AnimatedCow';
import { AnimatedPig } from './AnimatedPig';
import { AnimatedGoat } from './AnimatedGoat';
import { AnimatedChicken } from './AnimatedChicken';
import { AnimatedSheep } from './AnimatedSheep';

interface FarmStoryProps {
  // No props needed for simple animation
}

export const FarmStoryAnimation: React.FC<FarmStoryProps> = () => {
  const [currentAnimal, setCurrentAnimal] = useState(0);

  const animals = [
    { component: AnimatedCow, name: 'Moo the Cow', story: 'Moo is helping farmers with dairy loans!' },
    { component: AnimatedPig, name: 'Pinky the Pig', story: 'Pinky manages the savings accounts!' },
    { component: AnimatedGoat, name: 'Billy the Goat', story: 'Billy climbs mountains of paperwork!' },
    { component: AnimatedChicken, name: 'Clucky the Chicken', story: 'Clucky counts all the eggs... I mean, applications!' },
    { component: AnimatedSheep, name: 'Woolly the Sheep', story: 'Woolly keeps everyone cozy during long work hours!' }
  ];

  // Random animal selection every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAnimal((prev) => (prev + 1) % animals.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [animals.length]);

  const CurrentAnimalComponent = animals[currentAnimal].component;

  return (
    <div className="mt-6">
      <div className="farm-animal-container transition-all duration-300 mb-10">
        <div className="text-center mb-6">
          <div className="text-xs text-gray-500 font-medium">
            {animals[currentAnimal].name}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {animals[currentAnimal].story}
          </div>
        </div>
        
        <CurrentAnimalComponent />
        
        {/* Story rotation indicator */}
        <div className="text-center mt-2">
          <div className="flex justify-center space-x-1">
            {animals.map((_, i) => (
              <div
                key={i}
                className={`w-1 h-1 rounded-full ${
                  i === currentAnimal ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};