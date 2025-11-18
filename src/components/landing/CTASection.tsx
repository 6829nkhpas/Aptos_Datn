'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowRight, Shield } from 'lucide-react';

export const CTASection = ({ className, onGetStarted }: { className?: string; onGetStarted?: () => void }) => {
  return (
    <section className={cn('py-16 bg-white dark:bg-black', className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card variant="default" className="p-12 bg-[#C6D870] border-0">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">Ready to Start Trading?</h2>
            <p className="text-lg text-black/80 mb-8">Join thousands of users who trust DATN Marketplace for secure, blockchain-powered commerce</p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Button size="lg" variant="default" onClick={onGetStarted} className="bg-black text-white hover:bg-gray-900 border-0">
                Get Started Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="bg-white text-black border-black hover:bg-gray-100">
                Learn More
              </Button>
            </div>

            <div className="flex items-center justify-center space-x-2 text-sm text-black/80">
              <Shield className="w-4 h-4" />
              <span>Secured by blockchain technology</span>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default CTASection;
