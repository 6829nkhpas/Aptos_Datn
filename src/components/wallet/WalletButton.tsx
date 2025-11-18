/**
 * @fileoverview Wallet Button Component
 * @description Display connected wallet address and balance with disconnect option
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useAuth } from '@/lib/providers/AuthProvider';
import { Wallet, Copy, ExternalLink, LogOut, CheckCircle2, User, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface WalletButtonProps {
  onConnectClick?: () => void;
  className?: string;
}

export const WalletButton: React.FC<WalletButtonProps> = ({
  onConnectClick,
  className,
}) => {
  const { account, connected, disconnect } = useWallet();
  const { isAuthenticated, userProfile } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const address = account?.address?.toString();
  const balance = ''; // We can fetch this from blockchain if needed

  // Format address to display first and last 4 characters
  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Copy address to clipboard
  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Address copied to clipboard!');
    }
  };

  // View on explorer
  const viewOnExplorer = () => {
    if (address) {
      window.open(`https://explorer.aptoslabs.com/account/${address}?network=testnet`, '_blank');
    }
  };

  // Handle disconnect
  const handleDisconnect = async () => {
    setShowDropdown(false);
    await disconnect();
  };

  // If user is authenticated, don't show anything (user info is shown in Navbar)
  if (isAuthenticated) {
    return null;
  }

  // If not authenticated and wallet not connected, show Connect Wallet button
  if (!connected) {
    return (
      <Button
        onClick={onConnectClick}
        className={cn(
          'bg-[#C6D870] hover:bg-[#b8c962] text-black font-medium',
          className
        )}
      >
        <Wallet className="w-5 h-5 mr-2" />
        Connect Wallet
      </Button>
    );
  }

  // Wallet connected but not authenticated - show wallet info
  return (
    <div className={cn('relative', className)}>
      {/* Connected Wallet Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={cn(
          'flex items-center gap-3 px-4 py-2 rounded-lg',
          'border',
          isAuthenticated
            ? 'border-green-500/50 bg-green-50 dark:bg-green-950/20'
            : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950',
          'hover:border-[#C6D870] transition-all',
          'group'
        )}
      >
        {/* Authentication Status Badge */}
        {isAuthenticated ? (
          <Badge className="text-xs bg-green-500 hover:bg-green-600">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Authenticated
          </Badge>
        ) : (
          <Badge variant="lime" className="text-xs">
            Aptos
          </Badge>
        )}

        {/* Balance */}
        {balance && balance !== '0.0000' && (
          <span className="font-medium text-black dark:text-white">
            {balance} APT
          </span>
        )}

        {/* Address */}
        <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
          {formatAddress(address || '')}
        </span>

        {/* Dropdown Arrow */}
        <svg
          className={cn(
            'w-4 h-4 text-gray-400 transition-transform',
            showDropdown && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl z-50">
            {/* Wallet Info */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {isAuthenticated ? 'Authenticated Wallet' : 'Connected Wallet'}
                </span>
                <div className="flex items-center gap-1">
                  <div className={cn(
                    'w-2 h-2 rounded-full animate-pulse',
                    isAuthenticated ? 'bg-green-500' : 'bg-yellow-500'
                  )} />
                  <span className={cn(
                    'text-xs font-medium',
                    isAuthenticated ? 'text-green-500' : 'text-yellow-500'
                  )}>
                    {isAuthenticated ? 'Verified' : 'Active'}
                  </span>
                </div>
              </div>

              {/* User Info (if authenticated) */}
              {isAuthenticated && userProfile && (
                <div className="mb-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#C6D870] flex items-center justify-center">
                      <span className="text-black font-bold text-lg">
                        {userProfile.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-black dark:text-white">
                        {userProfile.name}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {userProfile.role} • {userProfile.email}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#C6D870] flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-black" />
                </div>
                <div className="flex-1">
                  <div className="font-mono text-sm text-black dark:text-white">
                    {formatAddress(address || '')}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Aptos Network
                  </div>
                </div>
              </div>

              {/* Balance Display */}
              {balance && balance !== '0.0000' && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Balance
                  </div>
                  <div className="text-lg font-bold text-black dark:text-white">
                    {balance} <span className="text-sm text-[#C6D870]">APT</span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-2">
              {/* Quick Links (if authenticated) */}
              {isAuthenticated && (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setShowDropdown(false)}
                    className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors flex items-center gap-3 group"
                  >
                    <User className="w-4 h-4 text-gray-400 group-hover:text-[#C6D870]" />
                    <span className="text-gray-700 dark:text-gray-300">My Profile</span>
                  </Link>

                  <Link
                    href="/order"
                    onClick={() => setShowDropdown(false)}
                    className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors flex items-center gap-3 group"
                  >
                    <ShoppingBag className="w-4 h-4 text-gray-400 group-hover:text-[#C6D870]" />
                    <span className="text-gray-700 dark:text-gray-300">My Orders</span>
                  </Link>

                  <div className="my-2 border-t border-gray-200 dark:border-gray-800" />
                </>
              )}

              <button
                onClick={copyAddress}
                className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors flex items-center gap-3 group"
              >
                <Copy className="w-4 h-4 text-gray-400 group-hover:text-[#C6D870]" />
                <span className="text-gray-700 dark:text-gray-300">Copy Address</span>
              </button>

              <button
                onClick={viewOnExplorer}
                className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors flex items-center gap-3 group"
              >
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#C6D870]" />
                <span className="text-gray-700 dark:text-gray-300">View on Explorer</span>
              </button>

              <div className="my-2 border-t border-gray-200 dark:border-gray-800" />

              <button
                onClick={handleDisconnect}
                className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors flex items-center gap-3 group"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span className="text-red-500">Disconnect Wallet</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WalletButton;
