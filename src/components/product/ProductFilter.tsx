/**
 * @fileoverview Product Filter Component
 * @description Sidebar filter for marketplace products
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const categories = [
  'All',
  'Electronics',
  'Fashion',
  'Home',
  'Books',
  'Sports',
  'Automotive',
  'Collectibles',
  'Other',
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
];

interface FilterState {
  category: string;
  priceRange: { min: string; max: string };
  sort: string;
}

interface ProductFilterProps {
  onFilterChange?: (filters: FilterState) => void;
  className?: string;
}

export const ProductFilter: React.FC<ProductFilterProps> = ({
  onFilterChange,
  className,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedSort, setSelectedSort] = useState('newest');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    onFilterChange?.({ category, priceRange, sort: selectedSort });
  };

  const handlePriceChange = () => {
    onFilterChange?.({ category: selectedCategory, priceRange, sort: selectedSort });
  };

  const handleSortChange = (sort: string) => {
    setSelectedSort(sort);
    onFilterChange?.({ category: selectedCategory, priceRange, sort });
  };

  const resetFilters = () => {
    setSelectedCategory('All');
    setPriceRange({ min: '', max: '' });
    setSelectedSort('newest');
    onFilterChange?.({ category: 'All', priceRange: { min: '', max: '' }, sort: 'newest' });
  };

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filters & Sort
        </Button>
      </div>

      {/* Filter Panel */}
      <div
        className={cn(
          'space-y-6',
          showMobileFilters ? 'block' : 'hidden lg:block',
          className
        )}
      >
        {/* Category Filter */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-black dark:text-white">Category</h3>
            <Button variant="ghost" size="sm" onClick={resetFilters} className="h-auto p-0 text-xs text-[#C6D870]">
              Reset
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? 'lime' : 'outline'}
                className="cursor-pointer transition-all hover:border-[#C6D870]"
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div>
          <h3 className="font-semibold text-black dark:text-white mb-3">Price Range (DATN)</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                Min Price
              </label>
              <Input
                type="number"
                placeholder="0"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                Max Price
              </label>
              <Input
                type="number"
                placeholder="1000"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                className="w-full"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handlePriceChange}
            >
              Apply Price Filter
            </Button>
          </div>
        </div>

        {/* Sort Options */}
        <div>
          <h3 className="font-semibold text-black dark:text-white mb-3">Sort By</h3>
          <div className="space-y-2">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-md text-sm transition-all',
                  selectedSort === option.value
                    ? 'bg-[#C6D870] text-black font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <h3 className="font-semibold text-black dark:text-white mb-3">Status</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-[#C6D870] focus:ring-[#C6D870]"
                defaultChecked
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">Available</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-[#C6D870] focus:ring-[#C6D870]"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">Sold</span>
            </label>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(selectedCategory !== 'All' || priceRange.min || priceRange.max) && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-black dark:text-white">
                Active Filters
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-auto p-0 text-xs text-red-500"
              >
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedCategory !== 'All' && (
                <Badge variant="lime">{selectedCategory}</Badge>
              )}
              {(priceRange.min || priceRange.max) && (
                <Badge variant="lime">
                  {priceRange.min || '0'} - {priceRange.max || '∞'} DATN
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductFilter;
