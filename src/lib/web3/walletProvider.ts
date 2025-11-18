/**
 * @fileoverview Wallet Provider Service
 * @description Core wallet connection and interaction logic using Petra Wallet (Aptos)
 */

import { WalletProviderType } from './types';

// Storage keys for wallet data
const STORAGE_KEYS = {
  WALLET_ADDRESS: 'aptos_wallet_address',
  WALLET_PUBLIC_KEY: 'aptos_wallet_public_key',
} as const;

// Petra Wallet types
interface PetraWallet {
  connect: () => Promise<{ address: string; publicKey: string }>;
  disconnect: () => Promise<void>;
  signMessage: (message: { message: string; nonce: string }) => Promise<{ 
    signature: string;
    fullMessage: string;
    address: string;
    application: string;
    chainId: number;
    message: string;
    nonce: string;
    prefix: string;
  }>;
  account: () => Promise<{ address: string; publicKey: string } | null>;
  network: () => Promise<{ name: string; chainId: string }>;
  isConnected: () => Promise<boolean>;
  onAccountChange: (callback: (account: { address: string } | null) => void) => void;
  onNetworkChange: (callback: (network: { name: string }) => void) => void;
}

declare global {
  interface Window {
    petra?: PetraWallet;
    aptos?: PetraWallet;
  }
}

export class WalletProviderService {
  private connectedAddress: string | null = null;
  private connectedPublicKey: string | null = null;

  /**
   * Check if Petra wallet is available
   */
  isWalletAvailable(_providerId: WalletProviderType): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window.petra || window.aptos);
  }

  /**
   * Get Petra wallet instance
   */
  private getPetraWallet(): PetraWallet {
    if (typeof window === 'undefined') {
      throw new Error('Window object not available');
    }

    const petra = window.petra || window.aptos;
    if (!petra) {
      throw new Error('Petra wallet is not installed. Please install Petra wallet extension.');
    }

    return petra;
  }

  /**
   * Connect to Petra wallet
   */
  async connect(_providerId: WalletProviderType): Promise<string> {
    try {
      const petra = this.getPetraWallet();

      // Connect to Petra wallet
      const response = await petra.connect();
      
      if (!response || !response.address) {
        throw new Error('No account returned from wallet');
      }

      this.connectedAddress = response.address;
      this.connectedPublicKey = response.publicKey;

      // Store in local storage
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, response.address);
        localStorage.setItem(STORAGE_KEYS.WALLET_PUBLIC_KEY, response.publicKey);
      }

      return response.address;
    } catch (error: unknown) {
      console.error('Error connecting wallet:', error);
      
      // Handle user rejection
      const err = error as { code?: number; message?: string };
      if (err.code === 4001 || err.message?.includes('User rejected') || err.message?.includes('User cancelled')) {
        throw new Error('Connection rejected by user');
      }
      
      throw new Error(err.message || 'Failed to connect wallet');
    }
  }

  /**
   * Disconnect wallet
   */
  async disconnect(): Promise<void> {
    try {
      const petra = this.getPetraWallet();
      await petra.disconnect();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
    
    this.connectedAddress = null;
    this.connectedPublicKey = null;
    
    // Clear local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS);
      localStorage.removeItem(STORAGE_KEYS.WALLET_PUBLIC_KEY);
    }
  }

  /**
   * Get current wallet address
   */
  async getAddress(): Promise<string | null> {
    try {
      if (this.connectedAddress) return this.connectedAddress;
      
      const petra = this.getPetraWallet();
      const account = await petra.account();
      
      if (account) {
        this.connectedAddress = account.address;
        this.connectedPublicKey = account.publicKey;
        return account.address;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting address:', error);
      return null;
    }
  }

  /**
   * Get wallet public key
   */
  async getPublicKey(): Promise<string | null> {
    try {
      if (this.connectedPublicKey) return this.connectedPublicKey;
      
      const petra = this.getPetraWallet();
      const account = await petra.account();
      
      if (account) {
        this.connectedPublicKey = account.publicKey;
        return account.publicKey;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting public key:', error);
      return null;
    }
  }

  /**
   * Get wallet balance (placeholder - Aptos balance fetching requires additional setup)
   */
  async getBalance(_address: string): Promise<string> {
    try {
      // For now, return placeholder
      // In production, you would fetch from Aptos blockchain
      return '0.0000';
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0.0000';
    }
  }

  /**
   * Get current network
   */
  async getChainId(): Promise<number | null> {
    try {
      const petra = this.getPetraWallet();
      const network = await petra.network();
      
      // Return 1 for mainnet, 2 for testnet
      return network.name === 'Mainnet' ? 1 : 2;
    } catch (error) {
      console.error('Error getting chain ID:', error);
      return null;
    }
  }

  /**
   * Sign message for authentication using Petra wallet
   */
  async signMessage(message: string, nonce: string): Promise<{ signature: string; fullMessage: string }> {
    try {
      const petra = this.getPetraWallet();
      
      if (!this.connectedAddress) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
      }

      // Sign message with Petra using the provided nonce
      const response = await petra.signMessage({
        message,
        nonce,
      });

      if (!response || !response.signature) {
        throw new Error('Failed to get signature from wallet');
      }

      // Return both signature and the fullMessage that was actually signed by Petra
      return {
        signature: response.signature,
        fullMessage: response.fullMessage, // This is what was actually signed
      };
    } catch (error: unknown) {
      console.error('Error signing message:', error);
      
      const err = error as { code?: string | number; message?: string };
      if (err.code === 'ACTION_REJECTED' || err.code === 4001 || err.message?.includes('rejected') || err.message?.includes('cancelled')) {
        throw new Error('Signature rejected by user');
      }
      
      throw new Error(err.message || 'Failed to sign message');
    }
  }

  /**
   * Setup event listeners for wallet events
   */
  setupEventListeners(callbacks: {
    onAccountsChanged?: (account: { address: string } | null) => void;
    onChainChanged?: (network: { name: string }) => void;
    onDisconnect?: () => void;
  }): void {
    try {
      const petra = this.getPetraWallet();

      if (callbacks.onAccountsChanged) {
        petra.onAccountChange(callbacks.onAccountsChanged);
      }

      if (callbacks.onChainChanged) {
        petra.onNetworkChange(callbacks.onChainChanged);
      }
    } catch (error) {
      console.error('Error setting up event listeners:', error);
    }
  }

  /**
   * Remove event listeners (placeholder - Petra doesn't have explicit remove listeners)
   */
  removeEventListeners(_callbacks: {
    onAccountsChanged?: (account: { address: string } | null) => void;
    onChainChanged?: (network: { name: string }) => void;
    onDisconnect?: () => void;
  }): void {
    // Petra wallet doesn't expose removeListener methods
    // Event listeners are automatically cleaned up on disconnect
  }

  /**
   * Check if wallet is connected
   */
  async isConnected(): Promise<boolean> {
    try {
      const petra = this.getPetraWallet();
      return await petra.isConnected();
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const walletProvider = new WalletProviderService();
export default walletProvider;
