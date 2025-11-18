/**
 * @fileoverview Product Card Component
 * @description Reusable product card for displaying marketplace items
 */

'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  id: string;
  title: string;
  description: string;
  price: string;
  image: string;
  category: string;
  seller: string;
  status?: 'active' | 'sold' | 'pending';
  views?: number;
  favorites?: number;
  className?: string;
  variant?: 'default' | 'compact' | 'featured';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  description,
  price,
  image,
  category,
  seller,
  status = 'active',
  views = 0,
  favorites = 0,
  className,
  variant = 'default',
}) => {
  const router = useRouter();
  const isCompact = variant === 'compact';
  const isFeatured = variant === 'featured';

  return (
    <Card
      variant="primary"
      hover="glow"
      padding="none"
      className={cn(
        'group overflow-hidden',
        isFeatured && 'border-2 border-[#C6D870]',
        className
      )}
    >
      <Link href={`/product/${id}`}>
        {/* Image Section */}
        <div className={cn('relative overflow-hidden bg-gray-100', isCompact ? 'h-40' : 'h-56')}>
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
          {/* Status Badge */}
          {status !== 'active' && (
            <div className="absolute top-2 left-2">
              <Badge variant={status === 'sold' ? 'error' : 'warning'}>
                {status === 'sold' ? 'Sold' : 'Pending'}
              </Badge>
            </div>
          )}
          {/* Category Badge */}
          <div className="absolute top-2 right-2">
            <Badge variant="lime" className="capitalize">
              {category}
            </Badge>
          </div>
          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              // Handle favorite toggle
            }}
            className="absolute bottom-2 right-2 p-2 rounded-full bg-white/90 hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100"
          >
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        {/* Content Section */}
        <div className={cn('p-4', isCompact && 'p-3')}>
          {/* Title */}
          <h3
            className={cn(
              'font-semibold text-black dark:text-white line-clamp-1 group-hover:text-[#C6D870] transition-colors',
              isCompact ? 'text-sm' : 'text-lg'
            )}
          >
            {title}
          </h3>

          {/* Description */}
          {!isCompact && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {description}
            </p>
          )}

          {/* Seller */}
          <div className="mt-2 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#C6D870] flex items-center justify-center text-xs font-semibold text-black">
              {seller.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              {seller.slice(0, 6)}...{seller.slice(-4)}
            </span>
          </div>

          {/* Stats Row */}
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span>{views}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>{favorites}</span>
            </div>
          </div>

          {/* Price and Action */}
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
              <p className={cn('font-bold text-black dark:text-white', isCompact ? 'text-base' : 'text-xl')}>
                {price} <span className="text-sm font-normal text-[#C6D870]">DATN</span>
              </p>
            </div>
            {status === 'active' && (
              <Button
                size={isCompact ? 'sm' : 'default'}
                className="bg-[#C6D870] text-black hover:bg-[#B5C760]"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Navigate to product detail page
                  router.push(`/product/${id}`);
                }}
              >
                Buy Now
              </Button>
            )}
          </div>
        </div>
      </Link>
    </Card>
  );
};

export default ProductCard;
