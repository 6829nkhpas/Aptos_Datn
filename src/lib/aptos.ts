/**
 * @fileoverview Aptos Client Configuration
 * @description Singleton Aptos client for blockchain interactions
 */

import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { NETWORK, APTOS_API_KEY } from "@/constants";

// Configure Aptos client with local network support
const getAptosConfig = () => {
  // For local network, use custom endpoints
  if (NETWORK === "local") {
    return new AptosConfig({
      network: "custom" as Network,
      fullnode: "http://localhost:8080",
      faucet: "http://localhost:8081",
    });
  }
  
  // For other networks (testnet, mainnet, devnet)
  return new AptosConfig({
    network: NETWORK as Network,
    ...(APTOS_API_KEY && { clientConfig: { API_KEY: APTOS_API_KEY } }),
  });
};

const config = getAptosConfig();

// Export singleton instance
export const aptos = new Aptos(config);

// Helper to generate account address from string
export const getAccountAddress = (address: string) => {
  return address;
};

// Helper to check if address is valid
export const isValidAddress = (address: string): boolean => {
  try {
    return /^0x[a-fA-F0-9]{1,64}$/.test(address);
  } catch {
    return false;
  }
};
