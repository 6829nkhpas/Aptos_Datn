'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Link2, Search, ShoppingCart, Package, CheckCircle } from 'lucide-react';

const steps = [
  { Icon: Link2, number: '01', title: 'Connect Wallet', description: 'Link your crypto wallet to start trading securely' },
  { Icon: Search, number: '02', title: 'Browse Products', description: 'Explore thousands of verified listings' },
  { Icon: ShoppingCart, number: '03', title: 'Place Order', description: 'Purchase with confidence using smart escrow' },
  { Icon: Package, number: '04', title: 'Track Delivery', description: 'Monitor your order in real-time' },
  { Icon: CheckCircle, number: '05', title: 'Confirm & Release', description: 'Verify delivery and release payment' },
];

export const HowItWorksSection = ({ className }: { className?: string }) => {
  return (
    <section className={cn('py-16 bg-white dark:bg-black', className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-black dark:text-white mb-3">How It Works</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">Get started in 5 simple steps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {steps.map((step, index) => (
            <Card key={index} variant="default" className="p-6 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:border-[#C6D870] transition-colors relative">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="absolute top-3 right-3 text-5xl font-bold text-gray-100 dark:text-gray-900">{step.number}</div>
                <div className="w-12 h-12 bg-[#C6D870] rounded-md flex items-center justify-center relative z-10">
                  <step.Icon className="w-6 h-6 text-black" />
                </div>
                <div className="relative z-10">
                  <h3 className="font-bold text-black dark:text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
