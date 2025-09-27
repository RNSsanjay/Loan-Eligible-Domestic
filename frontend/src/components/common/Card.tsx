import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  padding?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  title, 
  className = '', 
  padding = true 
}) => {
  return (
    <div className={`bg-white/80 backdrop-blur-lg shadow-lg rounded-xl border border-white/20 ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-green-100/50">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      <div className={padding ? 'p-6' : ''}>{children}</div>
    </div>
  );
};