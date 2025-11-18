import type { Network } from "@aptos-labs/wallet-adapter-react";

export const NETWORK: Network =
  (process.env.NEXT_PUBLIC_APP_NETWORK as Network) ?? "testnet";
export const MODULE_ADDRESS = process.env.NEXT_PUBLIC_MODULE_ADDRESS || "0xCAFE";
export const APTOS_API_KEY = process.env.NEXT_PUBLIC_APTOS_API_KEY;

// Smart Contract Modules
export const MODULES = {
  USER_PROFILE: `${MODULE_ADDRESS}::user_profile`,
  PRODUCT: `${MODULE_ADDRESS}::product`,
  ORDER: `${MODULE_ADDRESS}::order`,
  ESCROW: `${MODULE_ADDRESS}::escrow`,
} as const;

// User Roles
export const USER_ROLES = {
  BUYER: 1,
  SELLER: 2,
} as const;

// Order Status
export const ORDER_STATUS = {
  PENDING: 1,
  CONFIRMED: 2,
  PROCESSING: 3,
  SHIPPED: 4,
  DELIVERED: 5,
  CANCELLED: 6,
  REFUNDED: 7,
} as const;

// Escrow Status
export const ESCROW_STATUS = {
  INITIATED: 1,
  LOCKED: 2,
  DELIVERED: 3,
  CONFIRMED: 4,
  CANCELLED: 5,
  REFUNDED: 6,
} as const;

// APT Token Configuration
export const APT_DECIMALS = 8;
export const APT_UNIT = 100_000_000; // 10^8

// Helper to convert APT to Octas (smallest unit)
export const toOctas = (apt: number): number => Math.floor(apt * APT_UNIT);

// Helper to convert Octas to APT
export const toAPT = (octas: number): number => octas / APT_UNIT;

// Transaction Gas Configuration
export const DEFAULT_GAS_OPTIONS = {
  maxGasAmount: 200000,  // Increased for complex transactions (product creation, orders, etc.)
  gasUnitPrice: 100,     // Standard gas price
} as const;
