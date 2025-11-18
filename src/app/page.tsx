'use client';

import { useRouter } from 'next/navigation';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import CategoriesSection from '@/components/landing/CategoriesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import FeaturedProductsSection from '@/components/landing/FeaturedProductsSection';
import StatsSection from '@/components/landing/StatsSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import CTASection from '@/components/landing/CTASection';

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/product');
  };

  const handleExplore = () => {
    router.push('/search');
  };

  return (
    <>
      {/* Hero Section */}
      <HeroSection
        onGetStarted={handleGetStarted}
        onExplore={handleExplore}
      />

      {/* Featured Products Section */}
      <FeaturedProductsSection onExplore={handleExplore} />

      {/* Features Section */}
      <FeaturesSection />

      {/* Categories Section */}
      <CategoriesSection onCategoryClick={(id) => router.push(`/search?category=${id}`)} />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Stats Section */}
      <StatsSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Final CTA Section */}
      <CTASection onGetStarted={handleGetStarted} />
    </>
  );
}
