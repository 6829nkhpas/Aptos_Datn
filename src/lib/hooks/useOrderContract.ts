/**
 * @fileoverview Order Blockchain Query Hooks
 * @description React Query hooks for order smart contract interactions
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { toast } from 'sonner';
import * as orderContract from '../contracts/order';
import type {
  PlaceOrderParams,
  UpdateOrderStatusParams,
  CancelOrderParams,
} from '../types/contracts';

// Query keys
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  detail: (address: string) => [...orderKeys.all, 'detail', address] as const,
  buyerOrders: (address: string) => [...orderKeys.all, 'buyer', address] as const,
  sellerOrders: (address: string) => [...orderKeys.all, 'seller', address] as const,
  status: (address: string) => [...orderKeys.all, 'status', address] as const,
};

/**
 * Hook to get order details
 */
export const useOrder = (orderAddress: string, enabled = true) => {
  return useQuery({
    queryKey: orderKeys.detail(orderAddress),
    queryFn: () => orderContract.getOrder(orderAddress),
    enabled: enabled && !!orderAddress,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Hook to get buyer's orders
 */
export const useBuyerOrders = (buyerAddress?: string) => {
  const { account } = useWallet();
  const buyer = buyerAddress || account?.address?.toString();

  return useQuery({
    queryKey: orderKeys.buyerOrders(buyer || ''),
    queryFn: () => orderContract.getBuyerOrders(buyer!),
    enabled: !!buyer,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook to get seller's orders
 */
export const useSellerOrders = (sellerAddress?: string) => {
  const { account } = useWallet();
  const seller = sellerAddress || account?.address?.toString();

  return useQuery({
    queryKey: orderKeys.sellerOrders(seller || ''),
    queryFn: () => orderContract.getSellerOrders(seller!),
    enabled: !!seller,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook to get order status
 */
export const useOrderStatus = (orderAddress: string) => {
  return useQuery({
    queryKey: orderKeys.status(orderAddress),
    queryFn: () => orderContract.getOrderStatus(orderAddress),
    enabled: !!orderAddress,
    staleTime: 1 * 60 * 1000,
  });
};

/**
 * Hook to place an order
 */
export const usePlaceOrder = () => {
  const queryClient = useQueryClient();
  const { account, signAndSubmitTransaction } = useWallet();

  return useMutation({
    mutationFn: async (params: PlaceOrderParams) => {
      if (!account) throw new Error('Wallet not connected');

      const transaction = orderContract.placeOrder(params);
      const response = await signAndSubmitTransaction(transaction);
      return response;
    },
    onSuccess: () => {
      if (account?.address) {
        queryClient.invalidateQueries({ 
          queryKey: orderKeys.buyerOrders(account.address.toString()) 
        });
      }
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      toast.success('Order placed successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to place order');
      console.error('Place order error:', error);
    },
  });
};

/**
 * Hook to update order status
 */
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  const { account, signAndSubmitTransaction } = useWallet();

  return useMutation({
    mutationFn: async (params: UpdateOrderStatusParams) => {
      if (!account) throw new Error('Wallet not connected');

      const transaction = orderContract.updateOrderStatus(params);
      const response = await signAndSubmitTransaction(transaction);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: orderKeys.detail(variables.orderAddress) 
      });
      queryClient.invalidateQueries({ 
        queryKey: orderKeys.status(variables.orderAddress) 
      });
      if (account?.address) {
        queryClient.invalidateQueries({ 
          queryKey: orderKeys.sellerOrders(account.address.toString()) 
        });
      }
      toast.success('Order status updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update order status');
      console.error('Update order status error:', error);
    },
  });
};

/**
 * Hook to cancel an order
 */
export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  const { account, signAndSubmitTransaction } = useWallet();

  return useMutation({
    mutationFn: async (params: CancelOrderParams) => {
      if (!account) throw new Error('Wallet not connected');

      const transaction = orderContract.cancelOrder(params);
      const response = await signAndSubmitTransaction(transaction);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: orderKeys.detail(variables.orderAddress) 
      });
      if (account?.address) {
        queryClient.invalidateQueries({ 
          queryKey: orderKeys.buyerOrders(account.address.toString()) 
        });
        queryClient.invalidateQueries({ 
          queryKey: orderKeys.sellerOrders(account.address.toString()) 
        });
      }
      toast.success('Order cancelled successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel order');
      console.error('Cancel order error:', error);
    },
  });
};

/**
 * Hook to update shipping address
 */
export const useUpdateShippingAddress = () => {
  const queryClient = useQueryClient();
  const { account, signAndSubmitTransaction } = useWallet();

  return useMutation({
    mutationFn: async ({ orderAddress, newAddress }: { orderAddress: string; newAddress: string }) => {
      if (!account) throw new Error('Wallet not connected');

      const transaction = orderContract.updateShippingAddress(orderAddress, newAddress);
      const response = await signAndSubmitTransaction(transaction);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: orderKeys.detail(variables.orderAddress) 
      });
      toast.success('Shipping address updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update shipping address');
      console.error('Update shipping address error:', error);
    },
  });
};

/**
 * Hook to mark order as paid
 */
export const useMarkOrderPaid = () => {
  const queryClient = useQueryClient();
  const { account, signAndSubmitTransaction } = useWallet();

  return useMutation({
    mutationFn: async (orderAddress: string) => {
      if (!account) throw new Error('Wallet not connected');

      const transaction = orderContract.markOrderPaid(orderAddress);
      const response = await signAndSubmitTransaction(transaction);
      return response;
    },
    onSuccess: (_, orderAddress) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderAddress) });
      toast.success('Order marked as paid!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mark order as paid');
      console.error('Mark order paid error:', error);
    },
  });
};
