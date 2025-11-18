/**
 * @fileoverview DATN Logo Component
 * @description Modular logo component with multiple variants
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'full' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTagline?: boolean;
}

const sizeClasses = {
  sm: 'h-8',
  md: 'h-12',
  lg: 'h-16',
  xl: 'h-24',
};

const textSizeClasses = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
  xl: 'text-6xl',
};

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 'md',
  className,
  showTagline = false,
}) => {
  if (variant === 'icon') {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <div
          className={cn(
            'rounded-lg bg-[#C6D870] flex items-center justify-center font-bold text-black',
            sizeClasses[size],
            {
              'w-8 text-sm': size === 'sm',
              'w-12 text-xl': size === 'md',
              'w-16 text-3xl': size === 'lg',
              'w-24 text-5xl': size === 'xl',
            }
          )}
        >
          D
        </div>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={cn('flex flex-col', className)}>
        <h1 className={cn('font-bold text-black dark:text-white', textSizeClasses[size])}>
          DATN
        </h1>
        {showTagline && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Decentralized Autonomous Trade Network
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'rounded-lg bg-[#C6D870] flex items-center justify-center font-bold text-black',
          sizeClasses[size],
          {
            'w-8 text-sm': size === 'sm',
            'w-12 text-xl': size === 'md',
            'w-16 text-3xl': size === 'lg',
            'w-24 text-5xl': size === 'xl',
          }
        )}
      >
        D
      </div>
      <div className="flex flex-col">
        <span className={cn('font-bold text-black dark:text-white', textSizeClasses[size])}>
          DATN
        </span>
        {showTagline && (
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Decentralized Trade Network
          </span>
        )}
      </div>
    </div>
  );
};

export default Logo;
