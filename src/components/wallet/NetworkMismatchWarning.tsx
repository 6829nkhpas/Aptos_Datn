/**
 * @fileoverview Network Mismatch Warning Component
 * @description Detects and warns when wallet network doesn't match app network
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { NETWORK } from '@/constants';

export function NetworkMismatchWarning() {
  const { connected, network } = useWallet();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!connected) {
      setShowWarning(false);
      return;
    }

    // Check if wallet network matches app network
    const isLocalApp = NETWORK === 'local';
    const walletNetwork = network?.name?.toLowerCase() || '';

    // For local app, wallet should NOT be on mainnet/testnet
    if (isLocalApp && (walletNetwork === 'mainnet' || walletNetwork === 'testnet')) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [connected, network]);

  if (!showWarning) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black px-4 py-3 shadow-lg">
      <div className="container mx-auto flex items-start gap-3">
        <div className="flex-shrink-0 text-2xl">⚠️</div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">
            Network Mismatch Detected
          </h3>
          <p className="text-sm mb-2">
            Your wallet is connected to <strong>{network?.name || 'Mainnet'}</strong>, but this app is configured for <strong>Local Network</strong>.
            Transactions will fail with "Module not found" errors.
          </p>
          <details className="text-xs bg-yellow-600 bg-opacity-20 p-2 rounded">
            <summary className="cursor-pointer font-semibold mb-1">
              How to fix this (Click to expand)
            </summary>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Open your Petra wallet extension</li>
              <li>Click the network dropdown (currently showing "{network?.name || 'Mainnet'}")</li>
              <li>Select "Settings" → "Network"</li>
              <li>Add a custom network:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li><strong>Name:</strong> Local Aptos Node</li>
                  <li><strong>RPC URL:</strong> http://localhost:8080</li>
                  <li><strong>Chain ID:</strong> 4</li>
                </ul>
              </li>
              <li>Switch to the "Local Aptos Node" network</li>
              <li>Refresh this page</li>
            </ol>
          </details>
        </div>
        <button
          onClick={() => setShowWarning(false)}
          className="flex-shrink-0 text-xl font-bold hover:text-red-700"
          aria-label="Dismiss warning"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
