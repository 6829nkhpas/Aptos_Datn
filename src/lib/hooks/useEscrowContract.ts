/**
 * @fileoverview Escrow Blockchain Query Hooks
 * @description React Query hooks for escrow smart contract interactions
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { toast } from 'sonner';
import * as escrowContract from '../contracts/escrow';
import type {
  InitiateTradeParams,
  DeliverOrderParams,
  ConfirmDeliveryParams,
  CancelEscrowParams,
} from '../types/contracts';

// Query keys
export const escrowKeys = {
  all: ['escrow'] as const,
  lists: () => [...escrowKeys.all, 'list'] as const,
  detail: (address: string) => [...escrowKeys.all, 'detail', address] as const,
  buyerEscrows: (address: string) => [...escrowKeys.all, 'buyer', address] as const,
  sellerEscrows: (address: string) => [...escrowKeys.all, 'seller', address] as const,
  status: (address: string) => [...escrowKeys.all, 'status', address] as const,
  deliveryCode: (address: string) => [...escrowKeys.all, 'deliveryCode', address] as const,
  receivingCode: (address: string) => [...escrowKeys.all, 'receivingCode', address] as const,
};

/**
 * Hook to get escrow order details
 */
export const useEscrowOrder = (escrowOrderAddress: string, enabled = true) => {
  return useQuery({
    queryKey: escrowKeys.detail(escrowOrderAddress),
    queryFn: () => escrowContract.getEscrowOrder(escrowOrderAddress),
    enabled: enabled && !!escrowOrderAddress,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Hook to get buyer's escrow orders
 */
export const useBuyerEscrowOrders = (buyerAddress?: string) => {
  const { account } = useWallet();
  const buyer = buyerAddress || account?.address?.toString();

  return useQuery({
    queryKey: escrowKeys.buyerEscrows(buyer || ''),
    queryFn: () => escrowContract.getBuyerEscrowOrders(buyer!),
    enabled: !!buyer,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook to get seller's escrow orders
 */
export const useSellerEscrowOrders = (sellerAddress?: string) => {
  const { account } = useWallet();
  const seller = sellerAddress || account?.address?.toString();

  return useQuery({
    queryKey: escrowKeys.sellerEscrows(seller || ''),
    queryFn: () => escrowContract.getSellerEscrowOrders(seller!),
    enabled: !!seller,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook to get delivery code (Seller only)
 */
export const useDeliveryCode = (escrowOrderAddress: string) => {
  return useQuery({
    queryKey: escrowKeys.deliveryCode(escrowOrderAddress),
    queryFn: () => escrowContract.getDeliveryCode(escrowOrderAddress),
    enabled: !!escrowOrderAddress,
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook to get receiving code (Buyer only)
 */
export const useReceivingCode = (escrowOrderAddress: string) => {
  return useQuery({
    queryKey: escrowKeys.receivingCode(escrowOrderAddress),
    queryFn: () => escrowContract.getReceivingCode(escrowOrderAddress),
    enabled: !!escrowOrderAddress,
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook to get escrow status
 */
export const useEscrowStatus = (escrowOrderAddress: string) => {
  return useQuery({
    queryKey: escrowKeys.status(escrowOrderAddress),
    queryFn: () => escrowContract.getEscrowStatus(escrowOrderAddress),
    enabled: !!escrowOrderAddress,
    staleTime: 1 * 60 * 1000,
  });
};

/**
 * Hook to initiate trade and lock funds
 */
export const useInitiateTrade = () => {
  const queryClient = useQueryClient();
  const { account, signAndSubmitTransaction } = useWallet();

  return useMutation({
    mutationFn: async (params: InitiateTradeParams) => {
      if (!account) throw new Error('Wallet not connected');

      const transaction = escrowContract.initiateTradeAndLockFunds(params);
      const response = await signAndSubmitTransaction(transaction);
      return response;
    },
    onSuccess: () => {
      if (account?.address) {
        queryClient.invalidateQueries({ 
          queryKey: escrowKeys.buyerEscrows(account.address.toString()) 
        });
      }
      queryClient.invalidateQueries({ queryKey: escrowKeys.lists() });
      toast.success('Trade initiated and funds locked successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to initiate trade');
      console.error('Initiate trade error:', error);
    },
  });
};

/**
 * Hook to deliver order (Seller)
 */
export const useDeliverOrder = () => {
  const queryClient = useQueryClient();
  const { account, signAndSubmitTransaction } = useWallet();

  return useMutation({
    mutationFn: async (params: DeliverOrderParams) => {
      if (!account) throw new Error('Wallet not connected');

      const transaction = escrowContract.deliverOrder(params);
      const response = await signAndSubmitTransaction(transaction);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: escrowKeys.detail(variables.escrowOrderAddress) 
      });
      queryClient.invalidateQueries({ 
        queryKey: escrowKeys.status(variables.escrowOrderAddress) 
      });
      if (account?.address) {
        queryClient.invalidateQueries({ 
          queryKey: escrowKeys.sellerEscrows(account.address.toString()) 
        });
      }
      toast.success('Order marked as delivered!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to deliver order');
      console.error('Deliver order error:', error);
    },
  });
};

/**
 * Hook to confirm delivery and release funds (Buyer)
 */
export const useConfirmDelivery = () => {
  const queryClient = useQueryClient();
  const { account, signAndSubmitTransaction } = useWallet();

  return useMutation({
    mutationFn: async (params: ConfirmDeliveryParams) => {
      if (!account) throw new Error('Wallet not connected');

      const transaction = escrowContract.confirmDeliveryAndReleaseFunds(params);
      const response = await signAndSubmitTransaction(transaction);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: escrowKeys.detail(variables.escrowOrderAddress) 
      });
      queryClient.invalidateQueries({ 
        queryKey: escrowKeys.status(variables.escrowOrderAddress) 
      });
      if (account?.address) {
        queryClient.invalidateQueries({ 
          queryKey: escrowKeys.buyerEscrows(account.address.toString()) 
        });
      }
      toast.success('Delivery confirmed and funds released!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to confirm delivery');
      console.error('Confirm delivery error:', error);
    },
  });
};

/**
 * Hook to cancel escrow order
 */
export const useCancelEscrow = () => {
  const queryClient = useQueryClient();
  const { account, signAndSubmitTransaction } = useWallet();

  return useMutation({
    mutationFn: async (params: CancelEscrowParams) => {
      if (!account) throw new Error('Wallet not connected');

      const transaction = escrowContract.cancelEscrowOrder(params);
      const response = await signAndSubmitTransaction(transaction);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: escrowKeys.detail(variables.escrowOrderAddress) 
      });
      if (account?.address) {
        queryClient.invalidateQueries({ 
          queryKey: escrowKeys.buyerEscrows(account.address.toString()) 
        });
        queryClient.invalidateQueries({ 
          queryKey: escrowKeys.sellerEscrows(account.address.toString()) 
        });
      }
      toast.success('Escrow order cancelled and funds refunded!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel escrow');
      console.error('Cancel escrow error:', error);
    },
  });
};
