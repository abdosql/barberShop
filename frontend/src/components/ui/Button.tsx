import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function Button({ 
  isLoading, 
  loadingText, 
  children, 
  className = '', 
  ...props 
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={isLoading || props.disabled}
      className={`w-full relative flex items-center justify-center
        ${isLoading 
          ? 'bg-blue-500/80 cursor-not-allowed' 
          : 'bg-blue-500 hover:bg-blue-400 active:bg-blue-600'
        }
        text-white py-3 px-4 rounded-lg font-medium transition-all duration-200
        transform active:scale-[0.98]
        disabled:cursor-not-allowed disabled:transform-none
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900
        ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
} 