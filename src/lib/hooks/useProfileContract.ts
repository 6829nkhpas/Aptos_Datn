/**
 * @fileoverview Profile Blockchain Query Hooks
 * @description React Query hooks for user profile smart contract interactions
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { toast } from 'sonner';
import * as profileContract from '../contracts/profile';
import type { RegisterProfileParams, UpdateProfileParams } from '../types/contracts';

// Helper to pad addresses to 64 characters
const padAddress = (address: string): string => {
  const cleanAddress = address.startsWith('0x') ? address.slice(2) : address;
  return `0x${cleanAddress.padStart(64, '0')}`;
};

// Query keys
export const profileKeys = {
  all: ['profile'] as const,
  detail: (address: string) => [...profileKeys.all, 'detail', address] as const,
  isBuyer: (address: string) => [...profileKeys.all, 'isBuyer', address] as const,
  isSeller: (address: string) => [...profileKeys.all, 'isSeller', address] as const,
  isActive: (address: string) => [...profileKeys.all, 'isActive', address] as const,
  details: (address: string) => [...profileKeys.all, 'details', address] as const,
};

/**
 * Hook to get user profile
 */
export const useUserProfile = (address?: string, enabled = true) => {
  const { account } = useWallet();
  const userAddress = address || account?.address?.toString();
  const paddedAddress = userAddress ? padAddress(userAddress) : undefined;

  return useQuery({
    queryKey: profileKeys.detail(paddedAddress || ''),
    queryFn: () => profileContract.getUserProfile(paddedAddress!),
    enabled: enabled && !!paddedAddress,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to check if user is a buyer
 */
export const useIsBuyer = (address?: string) => {
  const { account } = useWallet();
  const userAddress = address || account?.address?.toString();
  const paddedAddress = userAddress ? padAddress(userAddress) : undefined;

  return useQuery({
    queryKey: profileKeys.isBuyer(paddedAddress || ''),
    queryFn: () => profileContract.isBuyer(paddedAddress!),
    enabled: !!paddedAddress,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to check if user is a seller
 */
export const useIsSeller = (address?: string) => {
  const { account } = useWallet();
  const userAddress = address || account?.address?.toString();
  const paddedAddress = userAddress ? padAddress(userAddress) : undefined;

  return useQuery({
    queryKey: profileKeys.isSeller(paddedAddress || ''),
    queryFn: () => profileContract.isSeller(paddedAddress!),
    enabled: !!paddedAddress,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to check if profile is active
 */
export const useIsProfileActive = (address?: string) => {
  const { account } = useWallet();
  const userAddress = address || account?.address?.toString();
  const paddedAddress = userAddress ? padAddress(userAddress) : undefined;

  return useQuery({
    queryKey: profileKeys.isActive(paddedAddress || ''),
    queryFn: () => profileContract.isProfileActive(paddedAddress!),
    enabled: !!paddedAddress,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to get user details
 */
export const useUserDetails = (address?: string) => {
  const { account } = useWallet();
  const userAddress = address || account?.address?.toString();
  const paddedAddress = userAddress ? padAddress(userAddress) : undefined;

  return useQuery({
    queryKey: profileKeys.details(paddedAddress || ''),
    queryFn: () => profileContract.getUserDetails(paddedAddress!),
    enabled: !!paddedAddress,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to register profile
 */
export const useRegisterProfile = () => {
  const queryClient = useQueryClient();
  const { account, signAndSubmitTransaction } = useWallet();

  return useMutation({
    mutationFn: async (params: RegisterProfileParams) => {
      if (!account) throw new Error('Wallet not connected');

      try {
        const transaction = profileContract.registerProfile(params);
        const response = await signAndSubmitTransaction(transaction);
        return response;
      } catch (error: any) {
        // Handle keyless account errors for local development
        if (error.message?.includes('keyless_account') || error.message?.includes('Groth16VerificationKey')) {
          throw new Error('Local network configuration issue. Please ensure your Petra wallet is connected to the correct network (Devnet or Testnet) for development.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      if (account?.address) {
        const paddedAddress = padAddress(account.address.toString());
        queryClient.invalidateQueries({ queryKey: profileKeys.detail(paddedAddress) });
        queryClient.invalidateQueries({ queryKey: profileKeys.all });
      }
      toast.success('Profile registered successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to register profile');
      console.error('Register profile error:', error);
    },
  });
};

/**
 * Hook to update profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { account, signAndSubmitTransaction } = useWallet();

  return useMutation({
    mutationFn: async (params: UpdateProfileParams) => {
      if (!account) throw new Error('Wallet not connected');

      const transaction = profileContract.updateProfile(params);
      const response = await signAndSubmitTransaction(transaction);
      return response;
    },
    onSuccess: (_, variables) => {
      const paddedAddress = padAddress(variables.profileAddress);
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(paddedAddress) });
      toast.success('Profile updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile');
      console.error('Update profile error:', error);
    },
  });
};

/**
 * Hook to deactivate profile
 */
export const useDeactivateProfile = () => {
  const queryClient = useQueryClient();
  const { account, signAndSubmitTransaction } = useWallet();

  return useMutation({
    mutationFn: async (profileAddress: string) => {
      if (!account) throw new Error('Wallet not connected');

      const transaction = profileContract.deactivateProfile(profileAddress);
      const response = await signAndSubmitTransaction(transaction);
      return response;
    },
    onSuccess: (_, profileAddress) => {
      const paddedAddress = padAddress(profileAddress);
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(paddedAddress) });
      queryClient.invalidateQueries({ queryKey: profileKeys.isActive(paddedAddress) });
      toast.success('Profile deactivated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to deactivate profile');
      console.error('Deactivate profile error:', error);
    },
  });
};

/**
 * Hook to reactivate profile
 */
export const useReactivateProfile = () => {
  const queryClient = useQueryClient();
  const { account, signAndSubmitTransaction } = useWallet();

  return useMutation({
    mutationFn: async (profileAddress: string) => {
      if (!account) throw new Error('Wallet not connected');

      const transaction = profileContract.reactivateProfile(profileAddress);
      const response = await signAndSubmitTransaction(transaction);
      return response;
    },
    onSuccess: (_, profileAddress) => {
      const paddedAddress = padAddress(profileAddress);
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(paddedAddress) });
      queryClient.invalidateQueries({ queryKey: profileKeys.isActive(paddedAddress) });
      toast.success('Profile reactivated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reactivate profile');
      console.error('Reactivate profile error:', error);
    },
  });
};
