'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, Users, Package, CheckCircle } from 'lucide-react';

const stats = [
  { Icon: TrendingUp, value: '$2.5M+', label: 'Total Trading Volume', color: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600' },
  { Icon: Users, value: '50K+', label: 'Active Users', color: 'bg-green-50 dark:bg-green-950/30 text-green-600' },
  { Icon: Package, value: '100K+', label: 'Products Listed', color: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600' },
  { Icon: CheckCircle, value: '98%', label: 'Successful Trades', color: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600' },
];

export const StatsSection = ({ className }: { className?: string }) => {
  return (
    <section className={cn('py-16 bg-gray-50 dark:bg-gray-950', className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} variant="default" className={cn('p-6 border border-gray-200 dark:border-gray-800', stat.color)}>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white dark:bg-black rounded-md flex items-center justify-center border border-gray-200 dark:border-gray-800">
                  <stat.Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-black dark:text-white">{stat.value}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
