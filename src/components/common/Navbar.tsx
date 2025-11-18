/**
 * @fileoverview Navigation Bar Component
 * @description Main navigation component with wallet connection
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Logo from './Logo';
import { WalletButton } from '@/components/wallet/WalletButton';
import { WalletConnectModal } from '@/components/wallet/WalletConnectModal';
import { useAuth } from '@/lib/providers/AuthProvider';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { USER_ROLES } from '@/constants';
import { Home, Package, Search, ShoppingBag, User, LogOut } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  requiresAuth?: boolean;
  hideWhenAuth?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/', icon: Home, requiresAuth: false, hideWhenAuth: true },
  { label: 'Products', href: '/product', icon: Package },
  { label: 'Search', href: '/search', icon: Search },
  { label: 'My Orders', href: '/order', icon: ShoppingBag, requiresAuth: true },
  { label: 'Profile', href: '/profile', icon: User, requiresAuth: true },
];

// Seller-specific navigation
const sellerNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/seller', icon: Home },
  { label: 'Products', href: '/seller/products', icon: Package },
  { label: 'Inventory', href: '/seller/inventory', icon: ShoppingBag, requiresAuth: true },
  { label: 'Payments', href: '/seller/payments', icon: User, requiresAuth: true },
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const { isAuthenticated, userProfile } = useAuth();
  const { disconnect } = useWallet();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  const handleLogout = async () => {
    try {
      await disconnect();
      setShowProfileDropdown(false);
      router.push('/');
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Logo variant="full" size="sm" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {(userProfile && userProfile.role === USER_ROLES.SELLER ? sellerNavItems : navItems)
              .filter(item => {
                // Hide items that require auth if user is not authenticated
                if (item.requiresAuth && !isAuthenticated) return false;
                // Hide items marked to hide when authenticated
                if (item.hideWhenAuth && isAuthenticated) return false;
                return true;
              })
              .map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-[#C6D870] text-black'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-black dark:hover:text-white'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                    {item.badge && (
                      <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-[#C6D870] text-black">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* User Info (when authenticated) with Dropdown */}
            {isAuthenticated && userProfile && (
              <div className="hidden md:block relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#C6D870]/10 border border-[#C6D870]/30 hover:bg-[#C6D870]/20 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-[#C6D870] flex items-center justify-center">
                    <span className="text-black font-semibold text-sm">
                      {userProfile?.name ? String(userProfile.name).charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-black dark:text-white">
                      {userProfile?.name || 'User'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {userProfile.role === USER_ROLES.SELLER ? 'Seller' : 'Buyer'}
                    </span>
                  </div>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-700 bg-[#0b0b0b] backdrop-blur-lg shadow-xl z-50">
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Disconnect</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Connect Wallet Button */}
            <div className="hidden md:block">
              <WalletButton onConnectClick={() => setShowWalletModal(true)} />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col gap-2">
              {/* User Info (Mobile) */}
              {isAuthenticated && userProfile && (
                <div className="mb-3 p-3 rounded-lg bg-[#C6D870]/10 border border-[#C6D870]/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#C6D870] flex items-center justify-center">
                      <span className="text-black font-semibold text-lg">
                        {userProfile?.name ? String(userProfile.name).charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-black dark:text-white">
                        {userProfile?.name || 'User'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {userProfile.role === USER_ROLES.SELLER ? 'Seller' : 'Buyer'} • Authenticated
                      </div>
                    </div>
                  </div>
                  {/* Mobile Logout Button */}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/20"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Disconnect</span>
                  </button>
                </div>
              )}

              {navItems
                .filter(item => {
                  // Hide items that require auth if user is not authenticated
                  if (item.requiresAuth && !isAuthenticated) return false;
                  // Hide items marked to hide when authenticated
                  if (item.hideWhenAuth && isAuthenticated) return false;
                  return true;
                })
                .map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-[#C6D870] text-black'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                <WalletButton onConnectClick={() => {
                  setShowWalletModal(true);
                  setMobileMenuOpen(false);
                }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Wallet Connect Modal */}
      <WalletConnectModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />
    </nav>
  );
};

export default Navbar;
