/**
 * @fileoverview Test cases for Product Smart Contract Service
 * @description Comprehensive tests for product contract functions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as productContract from '../product';
import { aptos } from '@/lib/aptos';
import { MODULES } from '@/constants';
import type { CreateProductParams, UpdateProductParams, Product } from '@/lib/types/contracts';

// Mock the aptos client
vi.mock('@/lib/aptos', () => ({
  aptos: {
    view: vi.fn(),
  },
}));

describe('Product Contract Service', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============= Entry Functions (Write Operations) =============

  describe('Entry Functions', () => {
    
    it('should create createProduct transaction data', () => {
      const params: CreateProductParams = {
        title: 'iPhone 15 Pro',
        description: 'Latest iPhone with A17 chip',
        price: 999000000, // 9.99 APT in octas
        quantity: 10,
        imageUrls: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
        category: 'Electronics',
      };

      const result = productContract.createProduct(params);

      expect(result).toEqual({
        data: {
          function: `${MODULES.PRODUCT}::create_product`,
          functionArguments: [
            params.title,
            params.description,
            params.price,
            params.quantity,
            params.imageUrls,
            params.category,
          ],
        },
      });
    });

    it('should create updateProduct transaction data with all fields', () => {
      const params: UpdateProductParams = {
        productAddress: '0xproduct123',
        title: 'iPhone 15 Pro Max',
        description: 'Updated description',
        price: 1099000000,
        imageUrls: ['https://example.com/new-image.jpg'],
        category: 'Smartphones',
      };

      const result = productContract.updateProduct(params);

      expect(result.data.functionArguments).toEqual([
        '0xproduct123',
        'iPhone 15 Pro Max',
        'Updated description',
        1099000000,
        ['https://example.com/new-image.jpg'],
        'Smartphones',
      ]);
    });

    it('should create updateProduct transaction data with empty optional fields', () => {
      const params: UpdateProductParams = {
        productAddress: '0xproduct123',
      };

      const result = productContract.updateProduct(params);

      expect(result.data.functionArguments).toEqual([
        '0xproduct123',
        '',
        '',
        0,
        [],
        '',
      ]);
    });

    it('should create updateInventory transaction data', () => {
      const result = productContract.updateInventory({
        productAddress: '0xproduct123',
        additionalQuantity: 50,
      });

      expect(result).toEqual({
        data: {
          function: `${MODULES.PRODUCT}::update_inventory`,
          functionArguments: ['0xproduct123', 50],
        },
      });
    });

    it('should create setProductAvailability transaction data', () => {
      const result = productContract.setProductAvailability('0xproduct123', false);

      expect(result).toEqual({
        data: {
          function: `${MODULES.PRODUCT}::set_product_availability`,
          functionArguments: ['0xproduct123', false],
        },
      });
    });

    it('should create deleteProduct transaction data', () => {
      const result = productContract.deleteProduct('0xproduct123');

      expect(result).toEqual({
        data: {
          function: `${MODULES.PRODUCT}::delete_product`,
          functionArguments: ['0xproduct123'],
        },
      });
    });
  });

  // ============= View Functions (Read Operations) =============

  describe('View Functions', () => {

    it('should fetch product successfully', async () => {
      const mockProduct: Product = {
        productAddress: '0xproduct123',
        title: 'iPhone 15 Pro',
        description: 'Latest iPhone',
        price: 999000000,
        quantity: 100,
        soldQuantity: 10,
        imageUrls: ['https://example.com/image.jpg'],
        category: 'Electronics',
        isAvailable: true,
        isDeleted: false,
        seller: '0xseller123',
        createdAt: 1699999999,
        updatedAt: 1699999999,
      };

      vi.mocked(aptos.view).mockResolvedValue([
        mockProduct.title,
        mockProduct.description,
        mockProduct.price.toString(),
        mockProduct.quantity.toString(),
        mockProduct.soldQuantity.toString(),
        mockProduct.imageUrls,
        mockProduct.category,
        mockProduct.isAvailable,
        mockProduct.isDeleted,
        mockProduct.seller,
        mockProduct.createdAt.toString(),
        mockProduct.updatedAt.toString(),
      ]);

      const result = await productContract.getProduct('0xproduct123');

      expect(aptos.view).toHaveBeenCalledWith({
        payload: {
          function: `${MODULES.PRODUCT}::get_product`,
          functionArguments: ['0xproduct123'],
        },
      });
      expect(result).toEqual(mockProduct);
    });

    it('should return null when product not found', async () => {
      vi.mocked(aptos.view).mockResolvedValue([]);

      const result = await productContract.getProduct('0xproduct123');

      expect(result).toBeNull();
    });

    it('should return null when error occurs fetching product', async () => {
      vi.mocked(aptos.view).mockRejectedValue(new Error('Network error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await productContract.getProduct('0xproduct123');

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });

    it('should fetch seller products successfully', async () => {
      const mockProducts = ['0xproduct1', '0xproduct2', '0xproduct3'];

      vi.mocked(aptos.view).mockResolvedValue([mockProducts]);

      const result = await productContract.getSellerProducts('0xseller123');

      expect(aptos.view).toHaveBeenCalledWith({
        payload: {
          function: `${MODULES.PRODUCT}::get_seller_products`,
          functionArguments: ['0xseller123'],
        },
      });
      expect(result).toEqual(mockProducts);
    });

    it('should return empty array when seller has no products', async () => {
      vi.mocked(aptos.view).mockResolvedValue([[]]);

      const result = await productContract.getSellerProducts('0xseller123');

      expect(result).toEqual([]);
    });

    it('should check if product is available', async () => {
      vi.mocked(aptos.view).mockResolvedValue([true]);

      const result = await productContract.isProductAvailable('0xproduct123');

      expect(aptos.view).toHaveBeenCalledWith({
        payload: {
          function: `${MODULES.PRODUCT}::is_available`,
          functionArguments: ['0xproduct123'],
        },
      });
      expect(result).toBe(true);
    });

    it('should check if product has enough stock', async () => {
      vi.mocked(aptos.view).mockResolvedValue([true]);

      const result = await productContract.hasEnoughStock('0xproduct123', 5);

      expect(aptos.view).toHaveBeenCalledWith({
        payload: {
          function: `${MODULES.PRODUCT}::has_enough_stock`,
          functionArguments: ['0xproduct123', 5],
        },
      });
      expect(result).toBe(true);
    });

    it('should return false when not enough stock', async () => {
      vi.mocked(aptos.view).mockResolvedValue([false]);

      const result = await productContract.hasEnoughStock('0xproduct123', 1000);

      expect(result).toBe(false);
    });

    it('should fetch product price', async () => {
      vi.mocked(aptos.view).mockResolvedValue(['999000000']);

      const result = await productContract.getProductPrice('0xproduct123');

      expect(aptos.view).toHaveBeenCalledWith({
        payload: {
          function: `${MODULES.PRODUCT}::get_product_price`,
          functionArguments: ['0xproduct123'],
        },
      });
      expect(result).toBe(999000000);
    });

    it('should fetch available quantity', async () => {
      vi.mocked(aptos.view).mockResolvedValue(['90']);

      const result = await productContract.getAvailableQuantity('0xproduct123');

      expect(aptos.view).toHaveBeenCalledWith({
        payload: {
          function: `${MODULES.PRODUCT}::get_available_quantity`,
          functionArguments: ['0xproduct123'],
        },
      });
      expect(result).toBe(90);
    });

    it('should fetch product seller', async () => {
      vi.mocked(aptos.view).mockResolvedValue(['0xseller123']);

      const result = await productContract.getProductSeller('0xproduct123');

      expect(aptos.view).toHaveBeenCalledWith({
        payload: {
          function: `${MODULES.PRODUCT}::get_product_seller`,
          functionArguments: ['0xproduct123'],
        },
      });
      expect(result).toBe('0xseller123');
    });

    it('should return null when error fetching seller', async () => {
      vi.mocked(aptos.view).mockRejectedValue(new Error('Network error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await productContract.getProductSeller('0xproduct123');

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });
  });

  // ============= Edge Cases =============

  describe('Edge Cases', () => {

    it('should handle zero price', () => {
      const params: CreateProductParams = {
        title: 'Free Item',
        description: 'Giveaway',
        price: 0,
        quantity: 1,
        imageUrls: [],
        category: 'Free',
      };

      const result = productContract.createProduct(params);

      expect(result.data.functionArguments[2]).toBe(0);
    });

    it('should handle large quantities', () => {
      const result = productContract.updateInventory({
        productAddress: '0xproduct123',
        additionalQuantity: 1000000,
      });

      expect(result.data.functionArguments[1]).toBe(1000000);
    });

    it('should handle multiple image URLs', () => {
      const imageUrls = Array.from({ length: 10 }, (_, i) => 
        `https://example.com/image${i}.jpg`
      );

      const params: CreateProductParams = {
        title: 'Product',
        description: 'Description',
        price: 100000000,
        quantity: 1,
        imageUrls,
        category: 'Test',
      };

      const result = productContract.createProduct(params);

      expect(result.data.functionArguments[4]).toEqual(imageUrls);
    });

    it('should handle special characters in product title', () => {
      const params: CreateProductParams = {
        title: 'Product™ & Co. "Special" Edition',
        description: 'Test',
        price: 100000000,
        quantity: 1,
        imageUrls: [],
        category: 'Test',
      };

      const result = productContract.createProduct(params);

      expect(result.data.functionArguments[0]).toBe(params.title);
    });
  });
});
