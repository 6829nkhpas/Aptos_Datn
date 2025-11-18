'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { User, Star } from 'lucide-react';

const testimonials = [
  { name: 'Sarah Johnson', role: 'Electronics Seller', content: 'DATN Marketplace revolutionized my online selling. The blockchain security gives buyers confidence, and I get paid instantly.', rating: 5 },
  { name: 'Michael Chen', role: 'Fashion Buyer', content: 'Finally, a marketplace where I can trust every transaction. The escrow system is genius - my purchases are always protected.', rating: 5 },
  { name: 'Emma Williams', role: 'Collectibles Trader', content: 'The DATN token rewards make trading here incredibly rewarding. Plus, zero fraud thanks to smart contracts.', rating: 5 },
];

export const TestimonialsSection = ({ className }: { className?: string }) => {
  return (
    <section className={cn('py-16 bg-white dark:bg-black', className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-black dark:text-white mb-3">What Our Users Say</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">Trusted by thousands of traders worldwide</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} variant="default" className="p-6 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-[#C6D870] rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h4 className="font-semibold text-black dark:text-white">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex space-x-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#C6D870] text-[#C6D870]" />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{testimonial.content}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
