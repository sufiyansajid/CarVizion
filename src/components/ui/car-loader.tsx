import React from "react";

interface CarLoaderProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

const CarLoader: React.FC<CarLoaderProps> = ({ 
  size = "md", 
  text = "Loading...",
  className = "" 
}) => {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32"
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      {/* Rotating Car SVG */}
      <div className={`${sizeClasses[size]} relative animate-spin`} style={{ animationDuration: "2s" }}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-primary"
        >
          {/* Car body */}
          <path
            d="M5 13l1-3h12l1 3M5 13v5h2m12-5v5h-2M7 18h10M7 18a2 2 0 100-4M17 18a2 2 0 100-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Car top */}
          <path
            d="M8 10h8l-1.5-2.5a1 1 0 00-.86-.5h-3.28a1 1 0 00-.86.5L8 10z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="currentColor"
            fillOpacity="0.2"
          />
          {/* Wheels */}
          <circle cx="7" cy="16" r="1.5" fill="currentColor" />
          <circle cx="17" cy="16" r="1.5" fill="currentColor" />
        </svg>
        
        {/* Rotating ring around car */}
        <div className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full animate-spin" style={{ animationDuration: "1s" }} />
      </div>

      {/* Loading text */}
      {text && (
        <p className={`${textSizes[size]} text-muted-foreground font-medium animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default CarLoader;

// Preset components for common use cases
export const CarLoaderFullScreen: React.FC<{ text?: string }> = ({ text }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-background/95 backdrop-blur-sm z-50">
    <CarLoader size="lg" text={text} />
  </div>
);

export const CarLoaderCard: React.FC<{ text?: string }> = ({ text }) => (
  <div className="w-full h-48 flex items-center justify-center bg-card border border-border rounded-lg">
    <CarLoader size="md" text={text} />
  </div>
);

export const CarLoaderInline: React.FC<{ text?: string }> = ({ text }) => (
  <div className="flex items-center justify-center py-8">
    <CarLoader size="sm" text={text} />
  </div>
);
