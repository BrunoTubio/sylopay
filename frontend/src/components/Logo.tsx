import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

export function Logo({ size = 'md', className = '', showText = false }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12',
    xl: 'h-16'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <img 
        src="/sylopay-logo.jpeg" 
        alt="SyloPay" 
        className={`${sizeClasses[size]} w-auto object-contain`}
      />
      {showText && (
        <span className="text-foreground font-bold text-lg">
          SyloPay
        </span>
      )}
    </div>
  );
}

export default Logo;