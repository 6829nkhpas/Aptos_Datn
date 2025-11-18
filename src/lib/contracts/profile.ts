/**
 * @fileoverview User Profile Smart Contract Service
 * @description Functions to interact with user_profile module
 */

import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { MODULES, DEFAULT_GAS_OPTIONS } from "@/constants";
import { aptos } from "@/lib/aptos";
import type { 
  UserProfile, 
  RegisterProfileParams, 
  UpdateProfileParams 
} from "@/lib/types/contracts";

// ============= Helper Functions =============

/**
 * Pad address to 64 characters (excluding 0x prefix)
 * Aptos addresses must be exactly 64 hex characters
 */
const padAddress = (address: string): string => {
  // Remove 0x prefix if present
  const cleanAddress = address.startsWith('0x') ? address.slice(2) : address;
  // Pad with leading zeros to 64 characters
  const paddedAddress = cleanAddress.padStart(64, '0');
  // Return with 0x prefix
  return `0x${paddedAddress}`;
};

// ============= Entry Functions (Write Operations) =============

/**
 * Register a new user profile
 */
export const registerProfile = (
  params: RegisterProfileParams
): InputTransactionData => {
  const { name, country, role, email, address, bio } = params;
  
  return {
    data: {
      function: `${MODULES.USER_PROFILE}::register_profile`,
      functionArguments: [name, country, role, email, address, bio],
    },
    options: DEFAULT_GAS_OPTIONS,
  };
};

/**
 * Update user profile
 */
export const updateProfile = (
  params: UpdateProfileParams
): InputTransactionData => {
  const { profileAddress, name, country, email, address, bio } = params;
  
  return {
    data: {
      function: `${MODULES.USER_PROFILE}::update_profile`,
      functionArguments: [
        padAddress(profileAddress),
        name || "",
        country || "",
        email || "",
        address || "",
        bio || "",
      ],
    },
    options: DEFAULT_GAS_OPTIONS,
  };
};

/**
 * Deactivate user profile
 */
export const deactivateProfile = (
  profileAddress: string
): InputTransactionData => {
  return {
    data: {
      function: `${MODULES.USER_PROFILE}::deactivate_profile`,
      functionArguments: [padAddress(profileAddress)],
    },
    options: DEFAULT_GAS_OPTIONS,
  };
};

/**
 * Reactivate user profile
 */
export const reactivateProfile = (
  profileAddress: string
): InputTransactionData => {
  return {
    data: {
      function: `${MODULES.USER_PROFILE}::reactivate_profile`,
      functionArguments: [padAddress(profileAddress)],
    },
    options: DEFAULT_GAS_OPTIONS,
  };
};

// ============= View Functions (Read Operations) =============

/**
 * Get user profile
 */
export const getUserProfile = async (
  address: string
): Promise<UserProfile | null> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULES.USER_PROFILE}::get_profile` as `${string}::${string}::${string}`,
        functionArguments: [padAddress(address)],
      },
    });
    
    if (!result || result.length === 0) {
      return null;
    }

    // The Move contract returns a struct object with snake_case keys
    const profile = result[0] as any;
    
    // Transform snake_case to camelCase
    return {
      name: profile.name,
      walletAddress: profile.wallet_address,
      country: profile.country,
      role: profile.role,
      email: profile.email,
      physicalAddress: profile.physical_address,
      bio: profile.bio,
      createdAt: typeof profile.created_at === 'string' 
        ? parseInt(profile.created_at) 
        : profile.created_at,
      updatedAt: typeof profile.updated_at === 'string' 
        ? parseInt(profile.updated_at) 
        : profile.updated_at,
      isActive: profile.is_active,
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

/**
 * Check if user is a buyer
 */
export const isBuyer = async (address: string): Promise<boolean> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULES.USER_PROFILE}::is_buyer` as `${string}::${string}::${string}`,
        functionArguments: [padAddress(address)],
      },
    });
    return result[0] as boolean;
  } catch (error) {
    console.error("Error checking if user is buyer:", error);
    return false;
  }
};

/**
 * Check if user is a seller
 */
export const isSeller = async (address: string): Promise<boolean> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULES.USER_PROFILE}::is_seller` as `${string}::${string}::${string}`,
        functionArguments: [padAddress(address)],
      },
    });
    return result[0] as boolean;
  } catch (error) {
    console.error("Error checking if user is seller:", error);
    return false;
  }
};

/**
 * Check if profile is active
 */
export const isProfileActive = async (address: string): Promise<boolean> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULES.USER_PROFILE}::is_profile_active` as `${string}::${string}::${string}`,
        functionArguments: [padAddress(address)],
      },
    });
    return result[0] as boolean;
  } catch (error) {
    console.error("Error checking if profile is active:", error);
    return false;
  }
};

/**
 * Get user details (name, email, country)
 */
export const getUserDetails = async (
  address: string
): Promise<{ name: string; email: string; country: string } | null> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULES.USER_PROFILE}::get_user_details` as `${string}::${string}::${string}`,
        functionArguments: [padAddress(address)],
      },
    });
    
    const [name, email, country] = result as [string, string, string];
    
    return {
      name,
      email,
      country,
    };
  } catch (error) {
    console.error("Error fetching user details:", error);
    return null;
  }
};
