/**
 * @fileoverview Test cases for Order Smart Contract Service
 * @description Comprehensive tests for order contract functions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as orderContract from '../order';
import { aptos } from '@/lib/aptos';
import { MODULES, ORDER_STATUS } from '@/constants';
import type { PlaceOrderParams, UpdateOrderStatusParams, Order } from '@/lib/types/contracts';

// Mock the aptos client
vi.mock('@/lib/aptos', () => ({
  aptos: {
    view: vi.fn(),
  },
}));

describe('Order Contract Service', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============= Entry Functions (Write Operations) =============

  describe('Entry Functions', () => {
    
    it('should create placeOrder transaction data', () => {
      const params: PlaceOrderParams = {
        productAddress: '0xproduct123',
        quantity: 2,
        shippingAddress: '123 Main St, City, Country',
        notes: 'Please handle with care',
      };

      const result = orderContract.placeOrder(params);

      expect(result).toEqual({
        data: {
          function: `${MODULES.ORDER}::place_order`,
          functionArguments: [
            params.productAddress,
            params.quantity,
            params.shippingAddress,
            params.notes,
          ],
        },
      });
    });

    it('should create updateOrderStatus transaction data', () => {
      const params: UpdateOrderStatusParams = {
        orderAddress: '0xorder123',
        newStatus: ORDER_STATUS.SHIPPED,
      };

      const result = orderContract.updateOrderStatus(params);

      expect(result).toEqual({
        data: {
          function: `${MODULES.ORDER}::update_order_status`,
          functionArguments: [params.orderAddress, params.newStatus],
        },
      });
    });

    it('should create cancelOrder transaction data', () => {
      const result = orderContract.cancelOrder({
        orderAddress: '0xorder123',
        reason: 'Customer requested cancellation',
      });

      expect(result).toEqual({
        data: {
          function: `${MODULES.ORDER}::cancel_order`,
          functionArguments: ['0xorder123', 'Customer requested cancellation'],
        },
      });
    });

    it('should create updateShippingAddress transaction data', () => {
      const result = orderContract.updateShippingAddress(
        '0xorder123',
        '456 Oak Ave, New City'
      );

      expect(result).toEqual({
        data: {
          function: `${MODULES.ORDER}::update_shipping_address`,
          functionArguments: ['0xorder123', '456 Oak Ave, New City'],
        },
      });
    });

    it('should create markOrderPaid transaction data', () => {
      const result = orderContract.markOrderPaid('0xorder123');

      expect(result).toEqual({
        data: {
          function: `${MODULES.ORDER}::mark_order_paid`,
          functionArguments: ['0xorder123'],
        },
      });
    });
  });

  // ============= View Functions (Read Operations) =============

  describe('View Functions', () => {

    it('should fetch order successfully', async () => {
      const mockOrder: Order = {
        orderAddress: '0xorder123',
        orderId: 1,
        productAddress: '0xproduct123',
        buyerAddress: '0xbuyer123',
        sellerAddress: '0xseller123',
        quantity: 2,
        totalPrice: 1998000000,
        shippingAddress: '123 Main St',
        status: ORDER_STATUS.PENDING,
        isPaid: false,
        createdAt: 1699999999,
        updatedAt: 1699999999,
        notes: 'Handle with care',
      };

      vi.mocked(aptos.view).mockResolvedValue([
        mockOrder.orderId.toString(),
        mockOrder.productAddress,
        mockOrder.buyerAddress,
        mockOrder.sellerAddress,
        mockOrder.quantity.toString(),
        mockOrder.totalPrice.toString(),
        mockOrder.shippingAddress,
        mockOrder.status,
        mockOrder.isPaid,
        mockOrder.createdAt.toString(),
        mockOrder.updatedAt.toString(),
        mockOrder.notes,
      ]);

      const result = await orderContract.getOrder('0xorder123');

      expect(aptos.view).toHaveBeenCalledWith({
        payload: {
          function: `${MODULES.ORDER}::get_order`,
          functionArguments: ['0xorder123'],
        },
      });
      expect(result).toEqual(mockOrder);
    });

    it('should return null when order not found', async () => {
      vi.mocked(aptos.view).mockResolvedValue([]);

      const result = await orderContract.getOrder('0xorder123');

      expect(result).toBeNull();
    });

    it('should return null when error occurs fetching order', async () => {
      vi.mocked(aptos.view).mockRejectedValue(new Error('Network error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await orderContract.getOrder('0xorder123');

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });

    it('should fetch buyer orders successfully', async () => {
      const mockOrders = ['0xorder1', '0xorder2', '0xorder3'];

      vi.mocked(aptos.view).mockResolvedValue([mockOrders]);

      const result = await orderContract.getBuyerOrders('0xbuyer123');

      expect(aptos.view).toHaveBeenCalledWith({
        payload: {
          function: `${MODULES.ORDER}::get_buyer_orders`,
          functionArguments: ['0xbuyer123'],
        },
      });
      expect(result).toEqual(mockOrders);
    });

    it('should return empty array when buyer has no orders', async () => {
      vi.mocked(aptos.view).mockResolvedValue([[]]);

      const result = await orderContract.getBuyerOrders('0xbuyer123');

      expect(result).toEqual([]);
    });

    it('should fetch seller orders successfully', async () => {
      const mockOrders = ['0xorder4', '0xorder5'];

      vi.mocked(aptos.view).mockResolvedValue([mockOrders]);

      const result = await orderContract.getSellerOrders('0xseller123');

      expect(aptos.view).toHaveBeenCalledWith({
        payload: {
          function: `${MODULES.ORDER}::get_seller_orders`,
          functionArguments: ['0xseller123'],
        },
      });
      expect(result).toEqual(mockOrders);
    });

    it('should fetch order status', async () => {
      vi.mocked(aptos.view).mockResolvedValue([ORDER_STATUS.SHIPPED]);

      const result = await orderContract.getOrderStatus('0xorder123');

      expect(aptos.view).toHaveBeenCalledWith({
        payload: {
          function: `${MODULES.ORDER}::get_order_status`,
          functionArguments: ['0xorder123'],
        },
      });
      expect(result).toBe(ORDER_STATUS.SHIPPED);
    });

    it('should check if order is paid', async () => {
      vi.mocked(aptos.view).mockResolvedValue([true]);

      const result = await orderContract.isOrderPaid('0xorder123');

      expect(aptos.view).toHaveBeenCalledWith({
        payload: {
          function: `${MODULES.ORDER}::is_order_paid`,
          functionArguments: ['0xorder123'],
        },
      });
      expect(result).toBe(true);
    });

    it('should check if order can be cancelled', async () => {
      vi.mocked(aptos.view).mockResolvedValue([true]);

      const result = await orderContract.canCancelOrder('0xorder123');

      expect(aptos.view).toHaveBeenCalledWith({
        payload: {
          function: `${MODULES.ORDER}::can_cancel_order`,
          functionArguments: ['0xorder123'],
        },
      });
      expect(result).toBe(true);
    });

    it('should return false when order cannot be cancelled', async () => {
      vi.mocked(aptos.view).mockResolvedValue([false]);

      const result = await orderContract.canCancelOrder('0xorder123');

      expect(result).toBe(false);
    });
  });

  // ============= Edge Cases =============

  describe('Edge Cases', () => {

    it('should handle order with zero quantity (edge case)', () => {
      const params: PlaceOrderParams = {
        productAddress: '0xproduct123',
        quantity: 0,
        shippingAddress: '123 Main St',
        notes: '',
      };

      const result = orderContract.placeOrder(params);

      expect(result.data.functionArguments[1]).toBe(0);
    });

    it('should handle large quantities', () => {
      const params: PlaceOrderParams = {
        productAddress: '0xproduct123',
        quantity: 1000000,
        shippingAddress: '123 Main St',
        notes: 'Bulk order',
      };

      const result = orderContract.placeOrder(params);

      expect(result.data.functionArguments[1]).toBe(1000000);
    });

    it('should handle empty notes', () => {
      const params: PlaceOrderParams = {
        productAddress: '0xproduct123',
        quantity: 1,
        shippingAddress: '123 Main St',
        notes: '',
      };

      const result = orderContract.placeOrder(params);

      expect(result.data.functionArguments[3]).toBe('');
    });

    it('should handle all order statuses', () => {
      const statuses = [
        ORDER_STATUS.PENDING,
        ORDER_STATUS.CONFIRMED,
        ORDER_STATUS.PROCESSING,
        ORDER_STATUS.SHIPPED,
        ORDER_STATUS.DELIVERED,
        ORDER_STATUS.CANCELLED,
        ORDER_STATUS.REFUNDED,
      ];

      statuses.forEach(status => {
        const result = orderContract.updateOrderStatus({
          orderAddress: '0xorder123',
          newStatus: status,
        });

        expect(result.data.functionArguments[1]).toBe(status);
      });
    });

    it('should handle long shipping addresses', () => {
      const longAddress = 'Unit 12345, Building A, Floor 99, Complex XYZ, Street Name That Is Very Long, District, City, Province, Country, Postal Code 123456';

      const result = orderContract.updateShippingAddress('0xorder123', longAddress);

      expect(result.data.functionArguments[1]).toBe(longAddress);
    });

    it('should handle special characters in notes', () => {
      const params: PlaceOrderParams = {
        productAddress: '0xproduct123',
        quantity: 1,
        shippingAddress: '123 Main St',
        notes: 'Please deliver between 9am-5pm. Contact: +1-555-0123. Email: buyer@example.com',
      };

      const result = orderContract.placeOrder(params);

      expect(result.data.functionArguments[3]).toBe(params.notes);
    });
  });
});
