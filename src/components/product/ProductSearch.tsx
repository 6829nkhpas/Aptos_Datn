/**
 * @fileoverview Product Search Component
 * @description Search bar with suggestions and filters
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  name: string;
  category: string;
  price: number;
}

interface ProductSearchProps {
  onSearch?: (query: string) => void;
  suggestions?: SearchResult[];
  placeholder?: string;
  className?: string;
  showFilters?: boolean;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({
  onSearch,
  suggestions = [],
  placeholder = 'Search products...',
  className,
  showFilters = true,
}) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Compute filtered suggestions directly from props and state
  const filteredSuggestions = React.useMemo(() => {
    if (query.trim() && suggestions.length > 0) {
      return suggestions
        .filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5); // Show top 5 suggestions
    }
    return [];
  }, [query, suggestions]);

  const handleSearch = useCallback(() => {
    onSearch?.(query);
    setShowSuggestions(false);
  }, [query, onSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchResult) => {
    setQuery(suggestion.name);
    setShowSuggestions(false);
    onSearch?.(suggestion.name);
  };

  const clearSearch = () => {
    setQuery('');
    setShowSuggestions(false);
    onSearch?.('');
  };

  return (
    <div className={cn('relative w-full max-w-2xl', className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setShowSuggestions(true)}
          className="pl-10 pr-24"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button
              onClick={clearSearch}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          <Button
            size="sm"
            onClick={handleSearch}
            className="bg-[#C6D870] hover:bg-[#b8c962] text-black"
          >
            Search
          </Button>
        </div>
      </div>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="py-2">
            <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Suggestions
            </div>
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-black dark:text-white group-hover:text-[#C6D870]">
                      {suggestion.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {suggestion.category}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-[#C6D870]">
                    {suggestion.price} DATN
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Filters */}
      {showFilters && (
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-sm text-gray-500 dark:text-gray-400">Quick filters:</span>
          {['Electronics', 'Fashion', 'Home', 'Books'].map((category) => (
            <button
              key={category}
              onClick={() => {
                setQuery(category);
                onSearch?.(category);
              }}
              className="px-3 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-[#C6D870] hover:text-black transition-colors"
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Click outside to close suggestions */}
      {showSuggestions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
};

export default ProductSearch;
