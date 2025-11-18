/**
 * @fileoverview Test cases for Escrow Smart Contract Service
 * @description Comprehensive tests for escrow contract functions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as escrowContract from '../escrow';
import { aptos } from '@/lib/aptos';
import { MODULES, ESCROW_STATUS } from '@/constants';
import type { InitiateTradeParams, DeliverOrderParams, ConfirmDeliveryParams, EscrowOrder } from '@/lib/types/contracts';

// Mock the aptos client
vi.mock('@/lib/aptos', () => ({
  aptos: {
    view: vi.fn(),
  },
}));

describe('Escrow Contract Service', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============= Entry Functions (Write Operations) =============

  describe('Entry Functions', () => {
    
    it('should create initiateTradeAndLockFunds transaction data', () => {
      const params: InitiateTradeParams = {
        productAddress: '0xproduct123',
        quantity: 2,
        shippingAddress: '123 Main St, City, Country',
        transactionHash: '0xtxhash123456789',
      };

      const result = escrowContract.initiateTradeAndLockFunds(params);

      expect(result).toEqual({
        data: {
          function: `${MODULES.ESCROW}::initiate_trade_and_lock_funds`,
          functionArguments: [
            params.productAddress,
            params.quantity,
            params.shippingAddress,
            params.transactionHash,
          ],
        },
      });
    });

    it('should create deliverOrder transaction data', () => {
      const params: DeliverOrderParams = {
        escrowOrderAddress: '0xescrow123',
        deliveryCode: '123456',
      };

      const result = escrowContract.deliverOrder(params);

      expect(result).toEqual({
        data: {
          function: `${MODULES.ESCROW}::deliver_order`,
          functionArguments: [params.escrowOrderAddress, params.deliveryCode],
        },
      });
    });

    it('should create confirmDeliveryAndReleaseFunds transaction data', () => {
      const params: ConfirmDeliveryParams = {
        escrowOrderAddress: '0xescrow123',
        receivingCode: '1234',
      };

      const result = escrowContract.confirmDeliveryAndReleaseFunds(params);

      expect(result).toEqual({
        data: {
          function: `${MODULES.ESCROW}::confirm_delivery_and_release_funds`,
          functionArguments: [params.escrowOrderAddress, params.receivingCode],
        },
      });
    });

    it('should create cancelEscrowOrder transaction data', () => {
      const result = escrowContract.cancelEscrowOrder({
        escrowOrderAddress: '0xescrow123',
        reason: 'Buyer changed mind',
      });

      expect(result).toEqual({
        data: {
          function: `${MODULES.ESCROW}::cancel_escrow_order`,
          functionArguments: ['0xescrow123', 'Buyer changed mind'],
        },
      });
    });
  });

  // ============= View Functions (Read Operations) =============

  describe('View Functions', () => {

    it('should fetch escrow order successfully', async () => {
      const mockEscrowOrder: EscrowOrder = {
        escrowOrderAddress: '0xescrow123',
        orderId: 1,
        productAddress: '0xproduct123',
        buyerAddress: '0xbuyer123',
        sellerAddress: '0xseller123',
        quantity: 2,
        totalPrice: 1998000000,
        lockedFunds: 1998000000,
        shippingAddress: '123 Main St',
        status: ESCROW_STATUS.LOCKED,
        deliveryCode: '123456',
        receivingCode: '1234',
        transactionHash: '0xtxhash123',
        createdAt: 1699999999,
        deliveredAt: 0,
        confirmedAt: 0,
      };

      vi.mocked(aptos.view).mockResolvedValue([
        mockEscrowOrder.orderId.toString(),
        mockEscrowOrder.productAddress,
        mockEscrowOrder.buyerAddress,
        mockEscrowOrder.sellerAddress,
        mockEscrowOrder.quantity.toString(),
        mockEscrowOrder.totalPrice.toString(),
        mockEscrowOrder.lockedFunds.toString(),
        mockEscrowOrder.shippingAddress,
        mockEscrowOrder.status,
        mockEscrowOrder.deliveryCode,
        mockEscrowOrder.receivingCode,
        mockEscrowOrder.transactionHash,
        mockEscrowOrder.createdAt.toString(),
        mockEscrowOrder.deliveredAt.toString(),
        mockEscrowOrder.confirmedAt.toString(),
      ]);

      const result = await escrowContract.getEscrowOrder('0xescrow123');

      expect(aptos.view).toHaveBeenCalledWith({
        payload: {
          function: `${MODULES.ESCROW}::get_escrow_order`,
          functionArguments: ['0xescrow123'],
        },
      });
      expect(result).toEqual(mockEscrowOrder);
    });

    it('should return null when escrow order not found', async () => {
      vi.mocked(aptos.view).mockResolvedValue([]);

      const result = await escrowContract.getEscrowOrder('0xescrow123');

      expect(result).toBeNull();
    });

    it('should return null when error occurs fetching escrow order', async () => {
      vi.mocked(aptos.view).mockRejectedValue(new Error('Network error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await escrowContract.getEscrowOrder('0xescrow123');

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });

    it('should fetch buyer escrow orders successfully', async () => {
      const mockOrders = ['0xescrow1', '0xescrow2', '0xescrow3'];

      vi.mocked(aptos.view).mockResolvedValue([mockOrders]);

      const result = await escrowContract.getBuyerEscrowOrders('0xbuyer123');

      expect(aptos.view).toHaveBeenCalledWith({
        payload: {
          function: `${MODULES.ESCROW}::get_buyer_escrow_orders`,
          functionArguments: ['0xbuyer123'],
        },
      });
      expect(result).toEqual(mockOrders);
    });

    it('should return empty array when buyer has no escrow orders', async () => {
      vi.mocked(aptos.view).mockResolvedValue([[]]);

      const result = await escrowContract.getBuyerEscrowOrders('0xbuyer123');

      expect(result).toEqual([]);
    });

    it('should fetch seller escrow orders successfully', async () => {
      const mockOrders = ['0xescrow4', '0xescrow5'];

      vi.mocked(aptos.view).mockResolvedValue([mockOrders]);

      const result = await escrowContract.getSellerEscrowOrders('0xseller123');

      expect(aptos.view).toHaveBeenCalledWith({
        payload: {
          function: `${MODULES.ESCROW}::get_seller_escrow_orders`,
          functionArguments: ['0xseller123'],
        },
      });
      expect(result).toEqual(mockOrders);
    });

    it('should fetch delivery code', async () => {
      vi.mocked(aptos.view).mockResolvedValue(['123456']);

      const result = await escrowContract.getDeliveryCode('0xescrow123');

      expect(aptos.view).toHaveBeenCalledWith({
        payload: {
          function: `${MODULES.ESCROW}::get_delivery_code`,
          functionArguments: ['0xescrow123'],
        },
      });
      expect(result).toBe('123456');
    });

    it('should return empty string when error fetching delivery code', async () => {
      vi.mocked(aptos.view).mockRejectedValue(new Error('Network error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await escrowContract.getDeliveryCode('0xescrow123');

      expect(result).toBe('');
      consoleSpy.mockRestore();
    });

    it('should fetch receiving code', async () => {
      vi.mocked(aptos.view).mockResolvedValue(['1234']);

      const result = await escrowContract.getReceivingCode('0xescrow123');

      expect(aptos.view).toHaveBeenCalledWith({
        payload: {
          function: `${MODULES.ESCROW}::get_receiving_code`,
          functionArguments: ['0xescrow123'],
        },
      });
      expect(result).toBe('1234');
    });

    it('should fetch escrow status', async () => {
      vi.mocked(aptos.view).mockResolvedValue([ESCROW_STATUS.DELIVERED]);

      const result = await escrowContract.getEscrowStatus('0xescrow123');

      expect(aptos.view).toHaveBeenCalledWith({
        payload: {
          function: `${MODULES.ESCROW}::get_escrow_status`,
          functionArguments: ['0xescrow123'],
        },
      });
      expect(result).toBe(ESCROW_STATUS.DELIVERED);
    });

    it('should fetch locked funds', async () => {
      vi.mocked(aptos.view).mockResolvedValue(['1998000000']);

      const result = await escrowContract.getLockedFunds('0xescrow123');

      expect(aptos.view).toHaveBeenCalledWith({
        payload: {
          function: `${MODULES.ESCROW}::get_locked_funds`,
          functionArguments: ['0xescrow123'],
        },
      });
      expect(result).toBe(1998000000);
    });

    it('should check if escrow is active', async () => {
      vi.mocked(aptos.view).mockResolvedValue([true]);

      const result = await escrowContract.isEscrowActive('0xescrow123');

      expect(aptos.view).toHaveBeenCalledWith({
        payload: {
          function: `${MODULES.ESCROW}::is_escrow_active`,
          functionArguments: ['0xescrow123'],
        },
      });
      expect(result).toBe(true);
    });

    it('should check if escrow can be cancelled', async () => {
      vi.mocked(aptos.view).mockResolvedValue([true]);

      const result = await escrowContract.canCancelEscrow('0xescrow123');

      expect(aptos.view).toHaveBeenCalledWith({
        payload: {
          function: `${MODULES.ESCROW}::can_cancel_escrow`,
          functionArguments: ['0xescrow123'],
        },
      });
      expect(result).toBe(true);
    });

    it('should return false when escrow cannot be cancelled', async () => {
      vi.mocked(aptos.view).mockResolvedValue([false]);

      const result = await escrowContract.canCancelEscrow('0xescrow123');

      expect(result).toBe(false);
    });
  });

  // ============= Edge Cases =============

  describe('Edge Cases', () => {

    it('should handle 6-digit delivery code', () => {
      const params: DeliverOrderParams = {
        escrowOrderAddress: '0xescrow123',
        deliveryCode: '999999',
      };

      const result = escrowContract.deliverOrder(params);

      expect(result.data.functionArguments[1]).toBe('999999');
    });

    it('should handle 4-digit receiving code', () => {
      const params: ConfirmDeliveryParams = {
        escrowOrderAddress: '0xescrow123',
        receivingCode: '0000',
      };

      const result = escrowContract.confirmDeliveryAndReleaseFunds(params);

      expect(result.data.functionArguments[1]).toBe('0000');
    });

    it('should handle all escrow statuses', () => {
      const statuses = [
        ESCROW_STATUS.INITIATED,
        ESCROW_STATUS.LOCKED,
        ESCROW_STATUS.DELIVERED,
        ESCROW_STATUS.CONFIRMED,
        ESCROW_STATUS.CANCELLED,
        ESCROW_STATUS.REFUNDED,
      ];

      statuses.forEach(status => {
        vi.mocked(aptos.view).mockResolvedValue([status]);
        
        escrowContract.getEscrowStatus('0xescrow123').then(result => {
          expect(result).toBe(status);
        });
      });
    });

    it('should handle empty transaction hash', () => {
      const params: InitiateTradeParams = {
        productAddress: '0xproduct123',
        quantity: 1,
        shippingAddress: '123 Main St',
        transactionHash: '',
      };

      const result = escrowContract.initiateTradeAndLockFunds(params);

      expect(result.data.functionArguments[3]).toBe('');
    });

    it('should handle long transaction hash', () => {
      const longHash = '0x' + 'a'.repeat(64);

      const params: InitiateTradeParams = {
        productAddress: '0xproduct123',
        quantity: 1,
        shippingAddress: '123 Main St',
        transactionHash: longHash,
      };

      const result = escrowContract.initiateTradeAndLockFunds(params);

      expect(result.data.functionArguments[3]).toBe(longHash);
    });

    it('should handle large locked funds amount', async () => {
      const largeAmount = '999999999999999'; // Very large amount in octas

      vi.mocked(aptos.view).mockResolvedValue([largeAmount]);

      const result = await escrowContract.getLockedFunds('0xescrow123');

      expect(result).toBe(parseInt(largeAmount));
    });

    it('should handle special characters in cancellation reason', () => {
      const reason = 'Product not as described! Expected "new" but received "used". Requesting full refund.';

      const result = escrowContract.cancelEscrowOrder({
        escrowOrderAddress: '0xescrow123',
        reason,
      });

      expect(result.data.functionArguments[1]).toBe(reason);
    });

    it('should handle zero timestamps for undelivered orders', async () => {
      const mockEscrowOrder = {
        escrowOrderAddress: '0xescrow123',
        orderId: 1,
        productAddress: '0xproduct123',
        buyerAddress: '0xbuyer123',
        sellerAddress: '0xseller123',
        quantity: 2,
        totalPrice: 1998000000,
        lockedFunds: 1998000000,
        shippingAddress: '123 Main St',
        status: ESCROW_STATUS.LOCKED,
        deliveryCode: '',
        receivingCode: '',
        transactionHash: '0xtxhash',
        createdAt: 1699999999,
        deliveredAt: 0, // Not delivered yet
        confirmedAt: 0, // Not confirmed yet
      };

      vi.mocked(aptos.view).mockResolvedValue([
        mockEscrowOrder.orderId.toString(),
        mockEscrowOrder.productAddress,
        mockEscrowOrder.buyerAddress,
        mockEscrowOrder.sellerAddress,
        mockEscrowOrder.quantity.toString(),
        mockEscrowOrder.totalPrice.toString(),
        mockEscrowOrder.lockedFunds.toString(),
        mockEscrowOrder.shippingAddress,
        mockEscrowOrder.status,
        mockEscrowOrder.deliveryCode,
        mockEscrowOrder.receivingCode,
        mockEscrowOrder.transactionHash,
        mockEscrowOrder.createdAt.toString(),
        mockEscrowOrder.deliveredAt.toString(),
        mockEscrowOrder.confirmedAt.toString(),
      ]);

      const result = await escrowContract.getEscrowOrder('0xescrow123');

      expect(result?.deliveredAt).toBe(0);
      expect(result?.confirmedAt).toBe(0);
    });
  });
});
