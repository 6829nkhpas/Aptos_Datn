/**
 * @fileoverview Web3 Type Definitions
 * @description Type definitions for Aptos wallet (Petra) and blockchain interactions
 */

// Petra Wallet Provider Type
export type WalletProviderType = 'petra';

// Petra Wallet Connection Response
export interface PetraConnectionResponse {
  address: string;
  publicKey: string;
}

// Petra Wallet Sign Message Response
export interface PetraSignMessageResponse {
  signature: string;
  fullMessage: string;
  address: string;
  application: string;
  chainId: number;
  message: string;
  nonce: string;
  prefix: string;
}

// Petra Wallet Network Info
export interface PetraNetworkInfo {
  name: string;
  chainId: string;
}

// Local Wallet State (for React state management)
export interface WalletState {
  address: string | null;
  publicKey: string | null;
  chainId: number | null;
  network: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

// Wallet Event Callbacks
export interface WalletEventCallbacks {
  onAccountsChanged?: (account: { address: string } | null) => void;
  onChainChanged?: (network: { name: string }) => void;
  onDisconnect?: () => void;
}
