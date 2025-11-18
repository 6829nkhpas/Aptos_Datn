'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Search, Shield, Zap, TrendingUp, Package } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted?: () => void;
  onExplore?: () => void;
  className?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onGetStarted,
  className,
}) => {
  return (
    <section className={cn('bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800', className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center py-12 lg:py-20">
          <div className="space-y-8">
            <Badge variant="outline" className="border-[#C6D870] text-[#C6D870] w-fit">
              <Shield className="w-3 h-3 mr-1" />
              Blockchain Secured
            </Badge>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black dark:text-white leading-tight">
                Shop Anything,
                <br />
                <span className="text-[#C6D870]">Anytime, Securely</span>
              </h1>

              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl">
                India&apos;s most trusted decentralized marketplace with blockchain protection
              </p>
            </div>

            <div className="flex gap-2 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for products, brands and more"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:border-[#C6D870] bg-white dark:bg-gray-950 text-black dark:text-white"
                />
              </div>
              <Button onClick={onGetStarted} className="bg-[#C6D870] hover:bg-[#b8c962]  text-black px-8 py-6">
                Search
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-[#C6D870]/10 rounded-md flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#C6D870]" />
                </div>
                <div>
                  <p className="font-semibold text-black dark:text-white text-sm">Secure Escrow</p>
                  <p className="text-xs text-gray-500">100% Protected</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-[#C6D870]/10 rounded-md flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[#C6D870]" />
                </div>
                <div>
                  <p className="font-semibold text-black dark:text-white text-sm">Fast Delivery</p>
                  <p className="text-xs text-gray-500">Express Shipping</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-8 border border-gray-200 dark:border-gray-800">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Package, label: 'Products', value: '50K+', color: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400' },
                  { icon: Shield, label: 'Secure Trades', value: '100K+', color: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400' },
                  { icon: Zap, label: 'Fast Delivery', value: '24hrs', color: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400' },
                  { icon: TrendingUp, label: 'Active Users', value: '15K+', color: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400' },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white dark:bg-black p-6 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-[#C6D870] transition-colors">
                    <div className={cn('w-12 h-12 rounded-md flex items-center justify-center mb-3', stat.color)}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <p className="text-2xl font-bold text-black dark:text-white mb-1">{stat.value}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
