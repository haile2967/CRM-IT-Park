import React from 'react';

interface LogoProps {
  className?: string;
  isDark?: boolean;
}

/**
 * Exact Emblem cropped directly from official website login logo
 */
export const ItParkGlobeEmblem: React.FC<LogoProps> = ({ className = 'w-8 h-8', isDark = true }) => {
  return (
    <img
      src={isDark ? '/itpark-emblem-dark.png' : '/itpark-emblem-light.png'}
      alt="Ethiopian IT Park Emblem"
      className={`object-contain ${className}`}
    />
  );
};

interface BrandLockupProps {
  collapsed?: boolean;
  isDark?: boolean;
  className?: string;
}

/**
 * Exact Ethiopian IT Park Logo identical to Keycloak login page
 */
export const ItParkBrandLockup: React.FC<BrandLockupProps> = ({
  collapsed = false,
  className = '',
}) => {
  if (collapsed) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center p-1.5 transition-colors">
          <img
            src="/itpark-emblem-dark.png"
            alt="Ethiopian IT Park"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center min-w-0 ${className}`}>
      {/* Exact full logo from Keycloak login page */}
      <img
        src="/itpark-logo-dark.png"
        alt="Ethiopian IT Park • የኢትዮጵያ ኢንፎርሜሽን ቴክኖሎጂ ፓርክ"
        className="h-9 w-auto max-w-[210px] object-contain"
      />
    </div>
  );
};

export default ItParkBrandLockup;
