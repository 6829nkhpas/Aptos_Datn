/**
 * @fileoverview Wallet Connect Modal - Blockchain Only
 * @description Connect Petra wallet and check blockchain profile
 */

'use client';

import { RegistrationForm } from '@/components/auth/RegistrationForm';
import { useUserProfile } from '@/lib/hooks/useProfileContract';
import { cn } from '@/lib/utils';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { ArrowRight, Info, Wallet, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const walletProviders = [
  {
    id: 'Petra',
    name: 'Petra Wallet',
    Icon: Wallet,
    description: 'Connect with Petra wallet for Aptos',
  },
];

export const WalletConnectModal: React.FC<WalletConnectModalProps> = ({
  isOpen,
  onClose,
  className,
}) => {
  const router = useRouter();
  const { connect, account, connected, disconnect } = useWallet();
  const [showRegistration, setShowRegistration] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const walletAddress = account?.address?.toString();
  const { data: profile, isLoading: profileLoading } = useUserProfile(walletAddress);

  const handleConnect = async (walletName: string) => {
    setSelectedProvider(walletName);
    setIsConnecting(true);
    try {
      await connect(walletName);
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('Wallet connected! Checking your profile...');
      setCheckingProfile(true);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      toast.error(errorMessage);
      console.error('Connection error:', error);
    } finally {
      setSelectedProvider(null);
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    if (connected && walletAddress && !profileLoading && checkingProfile) {
      setCheckingProfile(false);
      setSelectedProvider(null);

      if (!profile) {
        toast.info('No profile found. Please register to continue.');
        setShowRegistration(true);
      } else {
        // Profile exists - auto login
        const roleName = profile.role === 2 ? 'seller' : 'buyer';
        toast.success(`Welcome back, ${profile.name}!`);
        onClose();

        // Redirect based on role
        if (profile.role === 2) {
          // Seller - go to seller dashboard
          setTimeout(() => router.push('/seller'), 300);
        } else {
          // Buyer - go to products
          setTimeout(() => router.push('/product'), 300);
        }
      }
    }
  }, [connected, walletAddress, profile, profileLoading, checkingProfile, onClose, router]);

  const handleRegistrationSuccess = () => {
    setShowRegistration(false);
    toast.success('Registration successful! Welcome to DATN!');
    onClose();
    setTimeout(() => router.push('/product'), 300);
  };

  const handleRegistrationCancel = async () => {
    setShowRegistration(false);
    await disconnect();
    toast.info('Registration cancelled. Wallet disconnected.');
  };

  if (!isOpen) return null;

  if (showRegistration && connected) {
    return (
      <RegistrationForm
        onSuccess={handleRegistrationSuccess}
        onCancel={handleRegistrationCancel}
      />
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className={cn('bg-white dark:bg-gray-950 rounded-xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-800 animate-in fade-in zoom-in duration-200', className)} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <div>
              <h2 className="text-xl font-bold text-black dark:text-white">Connect Wallet</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Connect with Petra wallet to access DATN Marketplace</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors" disabled={isConnecting}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-3">
            {walletProviders.map((provider) => (
              <button
                key={provider.id}
                onClick={() => handleConnect(provider.id)}
                disabled={isConnecting || connected}
                className={cn('w-full p-4 rounded-lg border border-gray-200 dark:border-gray-800 flex items-center gap-4 text-left transition-all duration-200 hover:border-[#C6D870] hover:bg-[#C6D870]/10 disabled:opacity-50 disabled:cursor-not-allowed group', isConnecting && selectedProvider === provider.id && 'border-[#C6D870] bg-[#C6D870]/10')}
              >
                <div className="w-10 h-10 rounded-lg bg-[#C6D870]/20 flex items-center justify-center">
                  <provider.Icon className="w-5 h-5 text-[#C6D870]" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-black dark:text-white group-hover:text-[#C6D870]">{provider.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{provider.description}</div>
                </div>
                {isConnecting && selectedProvider === provider.id ? (
                  <div className="w-5 h-5 border-2 border-gray-200 border-t-[#C6D870] rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#C6D870] transition-colors" />
                )}
              </button>
            ))}
          </div>
          <div className="px-6 pb-6">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-[#C6D870] shrink-0" />
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  <p className="font-medium text-black dark:text-white mb-1">New to wallets?</p>
                  <p>Learn how to create and secure your wallet before isConnecting.</p>
                  <a href="https://petra.app/" target="_blank" rel="noopener noreferrer" className="text-[#C6D870] hover:underline mt-1 inline-block">Get Petra Wallet →</a>
                </div>
              </div>
            </div>
          </div>
          {(isConnecting || profileLoading || checkingProfile) && (
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-[#C6D870] rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm font-medium text-black dark:text-white">{isConnecting ? 'isConnecting...' : 'Loading profile...'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{isConnecting ? 'Check your wallet for approval' : 'Checking blockchain data'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WalletConnectModal;
