/**
 * @fileoverview Auth Context Provider
 * @description Manages authentication state using blockchain data only
 */

'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useUserProfile } from '@/lib/hooks/useProfileContract';
import type { UserProfile } from '@/lib/types/contracts';
import { USER_ROLES } from '@/constants';

interface AuthContextValue {
  address: string | null;
  isConnected: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  user: UserProfile | null; // Alias for ProtectedRoute compatibility
  isBuyer: boolean;
  isSeller: boolean;
  role: 'BUYER' | 'SELLER' | null; // String role for easier checks
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { account, connected } = useWallet();
  const walletAddress = account?.address?.toString();

  // Fetch user profile from blockchain
  const { data: userProfile, isLoading } = useUserProfile(walletAddress);

  // Debug log to verify data transformation
  if (userProfile && process.env.NODE_ENV === 'development') {
    console.log('[AuthProvider] ✅ User profile loaded:', {
      name: userProfile.name,
      role: userProfile.role === 1 ? 'Buyer' : userProfile.role === 2 ? 'Seller' : 'Unknown',
      isActive: userProfile.isActive,
    });
  }

  // Determine role information
  const isBuyer = userProfile?.role === USER_ROLES.BUYER;
  const isSeller = userProfile?.role === USER_ROLES.SELLER;
  const role = isBuyer ? 'BUYER' : isSeller ? 'SELLER' : null;

  const value: AuthContextValue = {
    address: walletAddress || null,
    isConnected: connected,
    isLoading,
    // User is authenticated if wallet is connected AND profile exists on blockchain
    isAuthenticated: connected && !!userProfile,
    userProfile: userProfile || null,
    user: userProfile || null, // Alias for ProtectedRoute compatibility
    isBuyer,
    isSeller,
    role,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
