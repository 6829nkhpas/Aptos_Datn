/**
 * @fileoverview Product Grid Component
 * @description Grid layout for displaying multiple products
 */

'use client';

import React from 'react';
import ProductCard from './ProductCard';
import { cn } from '@/lib/utils';

interface Product {
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
}

interface ProductGridProps {
  products: Product[];
  columns?: 2 | 3 | 4;
  variant?: 'default' | 'compact' | 'featured';
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  columns = 4,
  variant = 'default',
  loading = false,
  emptyMessage = 'No products found',
  className,
}) => {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  if (loading) {
    return (
      <div className={cn('grid gap-6', gridCols[columns], className)}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            <div className="h-56 bg-gray-200 dark:bg-gray-800" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg
          className="w-16 h-16 text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p className="text-gray-600 dark:text-gray-400 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('grid gap-6', gridCols[columns], className)}>
      {products.map((product) => (
        <ProductCard key={product.id} {...product} variant={variant} />
      ))}
    </div>
  );
};

export default ProductGrid;
