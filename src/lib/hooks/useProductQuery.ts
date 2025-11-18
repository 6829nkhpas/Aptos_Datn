/**
 * @fileoverview Product Query Hooks
 * @description React Query hooks for fetching and managing products
 */

import { useQuery } from '@tanstack/react-query';
import { getProduct, getSellerProducts } from '@/lib/contracts/product';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

/**
 * Hook to fetch all products for a seller
 */
export const useSellerProducts = (sellerAddress?: string) => {
  const { account } = useWallet();
  const addressToUse = sellerAddress || account?.address?.toString();

  return useQuery({
    queryKey: ['seller-products', addressToUse],
    queryFn: async () => {
      if (!addressToUse) return [];
      
      const productAddresses = await getSellerProducts(addressToUse);
      
      // Fetch full details for each product
      const products = await Promise.all(
        productAddresses.map(address => getProduct(address))
      );
      
      return products.filter(p => p !== null && !p.isDeleted);
    },
    enabled: !!addressToUse,
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Hook to fetch a single product
 */
export const useProductQuery = (productAddress: string) => {
  return useQuery({
    queryKey: ['product', productAddress],
    queryFn: () => getProduct(productAddress),
    enabled: !!productAddress,
    staleTime: 30000,
  });
};

/**
 * Hook to fetch multiple products
 * This is a placeholder - in a real app you'd need an indexer or event listener
 * to track all product addresses
 */
export const useProducts = () => {
  // For now, this returns empty array
  // You'll need to implement an indexer or event tracking system
  // to get all product addresses created on the blockchain
  
  return useQuery({
    queryKey: ['all-products'],
    queryFn: async () => {
      // This would need to query an indexer or database
      // that tracks all product creation events
      console.warn('useProducts: This requires an indexer to track all products');
      return [];
    },
    staleTime: 60000, // 1 minute
  });
};
