/**
 * @fileoverview Product Blockchain Query Hooks
 * @description React Query hooks for product smart contract interactions
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { toast } from 'sonner';
import * as productContract from '../contracts/product';
import type {
  CreateProductParams,
  UpdateProductParams,
  UpdateInventoryParams,
} from '../types/contracts';

// Query keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  detail: (address: string) => [...productKeys.all, 'detail', address] as const,
  sellerProducts: (address: string) => [...productKeys.all, 'seller', address] as const,
  availability: (address: string) => [...productKeys.all, 'availability', address] as const,
  stock: (address: string, quantity: number) => [...productKeys.all, 'stock', address, quantity] as const,
  price: (address: string) => [...productKeys.all, 'price', address] as const,
};

/**
 * Hook to get product details
 */
export const useProduct = (productAddress: string, enabled = true) => {
  return useQuery({
    queryKey: productKeys.detail(productAddress),
    queryFn: () => productContract.getProduct(productAddress),
    enabled: enabled && !!productAddress,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Type for product list items (matches UI requirements)
type ProductListItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  isAvailable: boolean;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    role: string;
  };
};

/**
 * Hook to get all products from the global registry
 */
export const useAllProducts = () => {
  return useQuery<ProductListItem[]>({
    queryKey: productKeys.lists(),
    queryFn: async (): Promise<ProductListItem[]> => {
      try {
        // Fetch all product addresses from global registry
        const productAddresses = await productContract.getAllProducts();
        
        if (!productAddresses || productAddresses.length === 0) {
          return [];
        }

        // Fetch details for each product in parallel
        const productPromises = productAddresses.map((address: string) => 
          productContract.getProduct(address)
        );
        
        const products = await Promise.all(productPromises);
        
        // Transform to ProductListItem format
        return products
          .filter((product): product is NonNullable<typeof product> => 
            product !== null && !product.isDeleted && product.isAvailable
          )
          .map(product => ({
            id: product.productAddress,
            name: product.title,
            description: product.description,
            price: product.price,
            images: product.imageUrls,
            category: product.category,
            isAvailable: product.isAvailable,
            quantity: product.quantity,
            createdAt: product.createdAt.toString(),
            updatedAt: product.updatedAt.toString(),
            user: {
              name: 'Seller', // TODO: Fetch seller profile
              role: 'seller',
            },
          }));
      } catch (error) {
        console.error('Error fetching all products:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to get seller's products
 */
export const useSellerProducts = (sellerAddress?: string) => {
  const { account } = useWallet();
  const seller = sellerAddress || account?.address?.toString();

  return useQuery({
    queryKey: productKeys.sellerProducts(seller || ''),
    queryFn: () => productContract.getSellerProducts(seller!),
    enabled: !!seller,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to check product availability
 */
export const useProductAvailability = (productAddress: string) => {
  return useQuery({
    queryKey: productKeys.availability(productAddress),
    queryFn: () => productContract.isProductAvailable(productAddress),
    enabled: !!productAddress,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Hook to check stock availability
 */
export const useStockAvailability = (productAddress: string, quantity: number) => {
  return useQuery({
    queryKey: productKeys.stock(productAddress, quantity),
    queryFn: () => productContract.hasEnoughStock(productAddress, quantity),
    enabled: !!productAddress && quantity > 0,
    staleTime: 1 * 60 * 1000,
  });
};

/**
 * Hook to get product price
 */
export const useProductPrice = (productAddress: string) => {
  return useQuery({
    queryKey: productKeys.price(productAddress),
    queryFn: () => productContract.getProductPrice(productAddress),
    enabled: !!productAddress,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to create a product
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const { account, signAndSubmitTransaction } = useWallet();

  return useMutation({
    mutationFn: async (params: CreateProductParams) => {
      if (!account) throw new Error('Wallet not connected');

      const transaction = productContract.createProduct(params);
      const response = await signAndSubmitTransaction(transaction);
      return response;
    },
    onSuccess: () => {
      if (account?.address) {
        queryClient.invalidateQueries({ 
          queryKey: productKeys.sellerProducts(account.address.toString()) 
        });
      }
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success('Product created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create product');
      console.error('Create product error:', error);
    },
  });
};

/**
 * Hook to update a product
 */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const { account, signAndSubmitTransaction } = useWallet();

  return useMutation({
    mutationFn: async (params: UpdateProductParams) => {
      if (!account) throw new Error('Wallet not connected');

      const transaction = productContract.updateProduct(params);
      const response = await signAndSubmitTransaction(transaction);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: productKeys.detail(variables.productAddress) 
      });
      if (account?.address) {
        queryClient.invalidateQueries({ 
          queryKey: productKeys.sellerProducts(account.address.toString()) 
        });
      }
      toast.success('Product updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update product');
      console.error('Update product error:', error);
    },
  });
};

/**
 * Hook to update inventory
 */
export const useUpdateInventory = () => {
  const queryClient = useQueryClient();
  const { account, signAndSubmitTransaction } = useWallet();

  return useMutation({
    mutationFn: async (params: UpdateInventoryParams) => {
      if (!account) throw new Error('Wallet not connected');

      const transaction = productContract.updateInventory(params);
      const response = await signAndSubmitTransaction(transaction);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: productKeys.detail(variables.productAddress) 
      });
      toast.success('Inventory updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update inventory');
      console.error('Update inventory error:', error);
    },
  });
};

/**
 * Hook to set product availability
 */
export const useSetProductAvailability = () => {
  const queryClient = useQueryClient();
  const { account, signAndSubmitTransaction } = useWallet();

  return useMutation({
    mutationFn: async ({ productAddress, isAvailable }: { productAddress: string; isAvailable: boolean }) => {
      if (!account) throw new Error('Wallet not connected');

      const transaction = productContract.setProductAvailability(productAddress, isAvailable);
      const response = await signAndSubmitTransaction(transaction);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: productKeys.detail(variables.productAddress) 
      });
      queryClient.invalidateQueries({ 
        queryKey: productKeys.availability(variables.productAddress) 
      });
      toast.success(`Product ${variables.isAvailable ? 'enabled' : 'disabled'} successfully!`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update availability');
      console.error('Set availability error:', error);
    },
  });
};

/**
 * Hook to delete a product
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const { account, signAndSubmitTransaction } = useWallet();

  return useMutation({
    mutationFn: async (productAddress: string) => {
      if (!account) throw new Error('Wallet not connected');

      const transaction = productContract.deleteProduct(productAddress);
      const response = await signAndSubmitTransaction(transaction);
      return response;
    },
    onSuccess: (_, productAddress) => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productAddress) });
      if (account?.address) {
        queryClient.invalidateQueries({ 
          queryKey: productKeys.sellerProducts(account.address.toString()) 
        });
      }
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success('Product deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete product');
      console.error('Delete product error:', error);
    },
  });
};
