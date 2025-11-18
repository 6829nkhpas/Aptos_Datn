'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Lock, Zap, Shield, Gem, Globe, BarChart } from 'lucide-react';

const features = [
  { Icon: Lock, title: 'Secure Escrow', description: 'Smart contract-based escrow ensures funds are protected until delivery confirmation', color: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400' },
  { Icon: Zap, title: 'Lightning Fast', description: 'Built on Volta Network for instant transactions with minimal gas fees', color: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900 text-yellow-600 dark:text-yellow-400' },
  { Icon: Shield, title: 'Dispute Resolution', description: 'Fair and transparent dispute handling system', color: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900 text-purple-600 dark:text-purple-400' },
  { Icon: Gem, title: 'DATN Token', description: 'Native cryptocurrency for marketplace transactions', color: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900 text-green-600 dark:text-green-400' },
  { Icon: Globe, title: 'Decentralized', description: 'No middlemen. Complete peer-to-peer trading freedom', color: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400' },
  { Icon: BarChart, title: 'Transparent', description: 'All transactions recorded on blockchain', color: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400' },
];

export const FeaturesSection = ({ className }: { className?: string }) => {
  return (
    <section className={cn('py-16 bg-gray-50 dark:bg-gray-950', className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-black dark:text-white mb-3">Why Choose DATN Marketplace</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Experience the future of e-commerce with blockchain-powered security</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} variant="default" className="p-6 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 hover:border-[#C6D870] transition-colors">
              <div className={cn('w-12 h-12 rounded-md flex items-center justify-center mb-4 border', feature.color)}>
                {React.createElement(feature.Icon, { className: "w-6 h-6" })}
              </div>
              <h3 className="text-xl font-bold text-black dark:text-white mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
