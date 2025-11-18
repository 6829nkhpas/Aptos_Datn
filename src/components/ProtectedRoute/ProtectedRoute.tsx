"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/providers/AuthProvider";

// Public routes that don't require wallet authentication
const PUBLIC_ROUTES = [
  '/',
  '/verify',
  '/search',
  '/product',
  '/about',
  '/contact',
  '/faq',
  '/terms',
  '/privacy',
  '/help',
];

// Routes that require wallet connection
const PROTECTED_ROUTES = [
  '/checkout',
  '/profile',
  '/settings',
  '/order',
  '/dashboard',
  '/seller', // seller area requires authenticated seller
];

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading: authLoading, userProfile } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);

  // Check if current route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => {
    if (route === '/') return pathname === '/';
    if (route === '/product') return pathname === '/product' || pathname.startsWith('/product/');
    return pathname.startsWith(route);
  });

  // Check if current route requires wallet connection
  const isProtectedRoute = PROTECTED_ROUTES.some(route => {
    return pathname.startsWith(route);
  });

  useEffect(() => {
    // Simulate loading check
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-[#C6D870] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow public routes without authentication
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // For protected routes, check if user is authenticated
  if (isProtectedRoute && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-md glass-neo p-8 rounded-2xl border border-gray-800">
          <div className="w-20 h-20 bg-[#C6D870]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-[#C6D870]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Wallet Required</h2>
          <p className="text-gray-400 mb-6">
            Please connect your wallet to access this page
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-[#C6D870] text-black rounded-lg font-semibold hover:bg-[#B5C760] transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Seller-specific protection: ensure user has SELLER role
  if (pathname.startsWith('/seller')) {
    if (!isAuthenticated) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
          <div className="text-center max-w-md glass-neo p-8 rounded-2xl border border-gray-800">
            <div className="w-20 h-20 bg-[#C6D870]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-[#C6D870]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Wallet Required</h2>
            <p className="text-gray-400 mb-6">
              Please connect your wallet to access the seller dashboard
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-[#C6D870] text-black rounded-lg font-semibold hover:bg-[#B5C760] transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      );
    }

    // Deny access if not a seller (role 2 = Seller)
    if (userProfile && userProfile.role !== 2) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
          <div className="text-center max-w-md glass-neo p-8 rounded-2xl border border-gray-800">
            <div className="w-20 h-20 bg-[#C6D870]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M6.93 6.93l10.14 10.14" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Access Denied</h2>
            <p className="text-gray-400 mb-6">
              This section is only available to sellers. Your account is registered as a buyer.
            </p>
            <button
              onClick={() => window.location.href = '/product'}
              className="px-6 py-3 bg-[#C6D870] text-black rounded-lg font-semibold hover:bg-[#B5C760] transition-colors"
            >
              Browse Products
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
