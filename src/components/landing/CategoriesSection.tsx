'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Smartphone, Shirt, Home, BookOpen, Trophy, Car, Palette, Sparkles } from 'lucide-react';

const categories = [
  { id: 'electronics', name: 'Electronics', Icon: Smartphone, count: 12450, color: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900' },
  { id: 'fashion', name: 'Fashion', Icon: Shirt, count: 8920, color: 'bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-900' },
  { id: 'home', name: 'Home & Living', Icon: Home, count: 6580, color: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900' },
  { id: 'books', name: 'Books', Icon: BookOpen, count: 4320, color: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900' },
  { id: 'sports', name: 'Sports', Icon: Trophy, count: 3890, color: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900' },
  { id: 'automotive', name: 'Automotive', Icon: Car, count: 2760, color: 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800' },
  { id: 'collectibles', name: 'Collectibles', Icon: Palette, count: 5430, color: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900' },
  { id: 'other', name: 'More', Icon: Sparkles, count: 9870, color: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900' },
];

export const CategoriesSection = ({ className, onCategoryClick }: { className?: string; onCategoryClick?: (id: string) => void }) => {
  return (
    <section className={cn('py-16 bg-white dark:bg-black', className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-black dark:text-white mb-2">Shop by Category</h2>
          <p className="text-gray-600 dark:text-gray-400">Browse thousands of products across categories</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Card
              key={category.id}
              variant="default"
              onClick={() => onCategoryClick?.(category.id)}
              className={cn('p-6 cursor-pointer transition-all hover:shadow-md border', category.color, 'group')}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-14 h-14 bg-white dark:bg-black rounded-md flex items-center justify-center border border-gray-200 dark:border-gray-800 group-hover:border-[#C6D870] transition-colors">
                  <category.Icon className="w-7 h-7 text-[#C6D870]" />
                </div>
                <div>
                  <h3 className="font-semibold text-black dark:text-white text-sm mb-1">{category.name}</h3>
                  <p className="text-xs text-gray-500">{category.count.toLocaleString()} items</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
