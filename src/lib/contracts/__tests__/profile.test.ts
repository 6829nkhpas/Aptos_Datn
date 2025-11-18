/**
 * @fileoverview Test cases for Profile Smart Contract Service
 * @description Comprehensive tests for user profile contract functions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as profileContract from '../profile';
import { aptos } from '@/lib/aptos';
import { MODULES, USER_ROLES } from '@/constants';
import type { RegisterProfileParams, UpdateProfileParams, UserProfile } from '@/lib/types/contracts';

// Mock the aptos client
vi.mock('@/lib/aptos', () => ({
  aptos: {
    view: vi.fn(),
  },
}));

describe('Profile Contract Service', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============= Entry Functions (Write Operations) =============

  describe('Entry Functions', () => {
    
    it('should create registerProfile transaction data', () => {
      const params: RegisterProfileParams = {
        name: 'John Doe',
        country: 'USA',
        role: USER_ROLES.BUYER,
        email: 'john@example.com',
        address: '123 Main St',
        bio: 'Tech enthusiast',
      };

      const result = profileContract.registerProfile(params);

      expect(result).toEqual({
        data: {
          function: `${MODULES.USER_PROFILE}::register_profile`,
          functionArguments: [
            'John Doe',
            'USA',
            USER_ROLES.BUYER,
            'john@example.com',
            '123 Main St',
            'Tech enthusiast',
          ],
        },
      });
    });

    it('should create updateProfile transaction data with all fields', () => {
      const params: UpdateProfileParams = {
        profileAddress: '0x123',
        name: 'Jane Doe',
        country: 'Canada',
        email: 'jane@example.com',
        address: '456 Oak Ave',
        bio: 'Designer',
      };

      const result = profileContract.updateProfile(params);

      expect(result).toEqual({
        data: {
          function: `${MODULES.USER_PROFILE}::update_profile`,
          functionArguments: [
            '0x123',
            'Jane Doe',
            'Canada',
            'jane@example.com',
            '456 Oak Ave',
            'Designer',
          ],
        },
      });
    });

    it('should create updateProfile transaction data with empty optional fields', () => {
      const params: UpdateProfileParams = {
        profileAddress: '0x123',
      };

      const result = profileContract.updateProfile(params);

      expect(result.data.functionArguments).toEqual([
        '0x123',
        '',
        '',
        '',
        '',
        '',
      ]);
    });

    it('should create deactivateProfile transaction data', () => {
      const result = profileContract.deactivateProfile('0x123');

      expect(result).toEqual({
        data: {
          function: `${MODULES.USER_PROFILE}::deactivate_profile`,
          functionArguments: ['0x123'],
        },
      });
    });

    it('should create reactivateProfile transaction data', () => {
      const result = profileContract.reactivateProfile('0x123');

      expect(result).toEqual({
        data: {
          function: `${MODULES.USER_PROFILE}::reactivate_profile`,
          functionArguments: ['0x123'],
        },
      });
    });
  });

  // ============= View Functions (Read Operations) =============

  describe('View Functions', () => {

    it('should fetch user profile successfully', async () => {
      const mockProfile: UserProfile = {
        name: 'John Doe',
        walletAddress: '0x123',
        country: 'USA',
        role: USER_ROLES.BUYER,
        email: 'john@example.com',
        physicalAddress: '123 Main St',
        bio: 'Tech enthusiast',
        createdAt: 1699999999,
        updatedAt: 1699999999,
        isActive: true,
      };

      vi.mocked(aptos.view).mockResolvedValue([
        mockProfile.name,
        mockProfile.walletAddress,
        mockProfile.country,
        mockProfile.role,
        mockProfile.email,
        mockProfile.physicalAddress,
        mockProfile.bio,
        mockProfile.createdAt.toString(),
        mockProfile.updatedAt.toString(),
        mockProfile.isActive,
      ]);

      const result = await profileContract.getUserProfile('0x123');

      expect(aptos.view).toHaveBeenCalledWith({
        payload: {
          function: `${MODULES.USER_PROFILE}::get_profile`,
          functionArguments: ['0x123'],
        },
      });
      expect(result).toEqual(mockProfile);
    });

    it('should return null when profile not found', async () => {
      vi.mocked(aptos.view).mockResolvedValue([]);

      const result = await profileContract.getUserProfile('0x123');

      expect(result).toBeNull();
    });

    it('should return null when error occurs fetching profile', async () => {
      vi.mocked(aptos.view).mockRejectedValue(new Error('Network error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await profileContract.getUserProfile('0x123');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching user profile:',
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });

    it('should check if user is a buyer', async () => {
      vi.mocked(aptos.view).mockResolvedValue([true]);

      const result = await profileContract.isBuyer('0x123');

      expect(aptos.view).toHaveBeenCalledWith({
        payload: {
          function: `${MODULES.USER_PROFILE}::is_buyer`,
          functionArguments: ['0x123'],
        },
      });
      expect(result).toBe(true);
    });

    it('should return false if isBuyer check fails', async () => {
      vi.mocked(aptos.view).mockRejectedValue(new Error('Network error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await profileContract.isBuyer('0x123');

      expect(result).toBe(false);
      consoleSpy.mockRestore();
    });

    it('should check if user is a seller', async () => {
      vi.mocked(aptos.view).mockResolvedValue([true]);

      const result = await profileContract.isSeller('0x123');

      expect(aptos.view).toHaveBeenCalledWith({
        payload: {
          function: `${MODULES.USER_PROFILE}::is_seller`,
          functionArguments: ['0x123'],
        },
      });
      expect(result).toBe(true);
    });

    it('should check if profile is active', async () => {
      vi.mocked(aptos.view).mockResolvedValue([true]);

      const result = await profileContract.isProfileActive('0x123');

      expect(aptos.view).toHaveBeenCalledWith({
        payload: {
          function: `${MODULES.USER_PROFILE}::is_profile_active`,
          functionArguments: ['0x123'],
        },
      });
      expect(result).toBe(true);
    });

    it('should fetch user details successfully', async () => {
      const mockDetails = {
        name: 'John Doe',
        email: 'john@example.com',
        country: 'USA',
      };

      vi.mocked(aptos.view).mockResolvedValue([
        mockDetails.name,
        mockDetails.email,
        mockDetails.country,
      ]);

      const result = await profileContract.getUserDetails('0x123');

      expect(aptos.view).toHaveBeenCalledWith({
        payload: {
          function: `${MODULES.USER_PROFILE}::get_user_details`,
          functionArguments: ['0x123'],
        },
      });
      expect(result).toEqual(mockDetails);
    });

    it('should return null when error occurs fetching user details', async () => {
      vi.mocked(aptos.view).mockRejectedValue(new Error('Network error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await profileContract.getUserDetails('0x123');

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });
  });

  // ============= Edge Cases =============

  describe('Edge Cases', () => {

    it('should handle special characters in profile data', () => {
      const params: RegisterProfileParams = {
        name: "O'Connor & Sons",
        country: 'Côte d\'Ivoire',
        role: USER_ROLES.SELLER,
        email: 'test+123@example.com',
        address: '123 "Main" Street, Apt #5',
        bio: 'Bio with <special> & {characters}',
      };

      const result = profileContract.registerProfile(params);

      expect(result.data.functionArguments).toContain(params.name);
      expect(result.data.functionArguments).toContain(params.bio);
    });

    it('should handle empty strings in update', () => {
      const params: UpdateProfileParams = {
        profileAddress: '0x123',
        name: '',
        email: '',
      };

      const result = profileContract.updateProfile(params);

      expect(result.data.functionArguments[1]).toBe('');
      expect(result.data.functionArguments[3]).toBe('');
    });

    it('should handle very long profile addresses', () => {
      const longAddress = '0x' + 'a'.repeat(64);
      const result = profileContract.deactivateProfile(longAddress);

      expect(result.data.functionArguments[0]).toBe(longAddress);
    });
  });
});
