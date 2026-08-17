import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = "", size = 36 }: LogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="20" y="20" width="45" height="45" stroke="currentColor" strokeWidth="5" />
      <rect x="35" y="35" width="45" height="45" stroke="#8b7355" strokeWidth="5" />
    </svg>
  );
}
