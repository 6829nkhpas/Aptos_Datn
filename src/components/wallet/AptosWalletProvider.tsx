/**
 * @fileoverview Aptos Wallet Provider
 * @description Configures and provides Aptos wallet adapter context
 */

'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import { NETWORK } from '@/constants';

interface AptosWalletProviderProps {
  children: ReactNode;
}

export function AptosWalletProvider({ children }: AptosWalletProviderProps) {
  const [mounted, setMounted] = useState(false);

  // Ensure component only renders on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // For local network, use 'devnet' - it has better compatibility with local nodes
  // The actual contract calls will use localhost:8080 from aptos.ts configuration
  const walletNetwork = NETWORK === 'local' ? 'devnet' : NETWORK;

  // Don't render wallet provider until mounted (client-side only)
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <AptosWalletAdapterProvider
      autoConnect={false}
      dappConfig={{
        network: walletNetwork as any,
        // Skip keyless verification for local networks
        aptosConnectDappId: undefined,
      }}
      onError={(error) => {
        // Filter out keyless account errors for local development
        if (error.message?.includes('keyless_account') || error.message?.includes('Groth16VerificationKey')) {
          console.warn('Keyless account feature not available on local network - this is expected');
          return;
        }
        console.error('Wallet adapter error:', error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}

export default AptosWalletProvider;
