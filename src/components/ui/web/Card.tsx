import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  style,
}) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-lg p-6 ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};