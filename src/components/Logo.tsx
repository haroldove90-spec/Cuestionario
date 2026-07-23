import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'auto';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = 'h-10 w-auto',
}) => {
  return (
    <img
      src="https://mexicosignaturetours.com.mx/appdesignlogo.png"
      alt="App Design Logo"
      referrerPolicy="no-referrer"
      className={`${className} object-contain shrink-0`}
    />
  );
};
