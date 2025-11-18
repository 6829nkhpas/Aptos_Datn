'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ProductCard } from '../product/ProductCard';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const featuredProducts = [
  { id: '1', name: 'iPhone 15 Pro Max', price: 1299, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500', category: 'Electronics', seller: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', rating: 4.8, description: 'Latest iPhone with advanced features' },
  { id: '2', name: 'MacBook Pro M3', price: 2499, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500', category: 'Electronics', seller: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199', rating: 4.9, description: 'Powerful laptop for professionals' },
  { id: '3', name: 'Sony WH-1000XM5', price: 399, image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500', category: 'Electronics', seller: '0xdD870fA1b7C4700F2BD7f44238821C26f7392148', rating: 4.7, description: 'Premium noise-cancelling headphones' },
  { id: '4', name: 'Nike Air Max', price: 150, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', category: 'Fashion', seller: '0x583031D1113aD414F02576BD6afaBfb302140225', rating: 4.6, description: 'Stylish and comfortable sneakers' },
];

export const FeaturedProductsSection = ({ className, onExplore }: { className?: string; onExplore?: () => void }) => {
  return (
    <section className={cn('py-16 bg-gray-50 dark:bg-gray-950', className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-black dark:text-white mb-2">Featured Products</h2>
            <p className="text-gray-600 dark:text-gray-400">Handpicked items from verified sellers</p>
          </div>
          <Button variant="outline" onClick={onExplore} className="border-[#C6D870] text-[#C6D870] hover:bg-[#C6D870] hover:text-black">
            View All
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} {...product} title={product.name} price={product.price.toString()} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductsSection;
