/**
 * @fileoverview Smart Contract Hooks Index
 * @description Centralized exports for all blockchain hooks
 */

// Profile hooks
export {
  profileKeys,
  useUserProfile,
  useIsBuyer,
  useIsSeller,
  useIsProfileActive,
  useUserDetails,
  useRegisterProfile,
  useUpdateProfile,
  useDeactivateProfile,
  useReactivateProfile,
} from './useProfileContract';

// Product hooks
export {
  productKeys,
  useProduct,
  useSellerProducts,
  useProductAvailability,
  useStockAvailability,
  useProductPrice,
  useCreateProduct,
  useUpdateProduct,
  useUpdateInventory,
  useSetProductAvailability,
  useDeleteProduct,
} from './useProductContract';

// Order hooks
export {
  orderKeys,
  useOrder,
  useBuyerOrders,
  useSellerOrders,
  useOrderStatus,
  usePlaceOrder,
  useUpdateOrderStatus,
  useCancelOrder,
  useUpdateShippingAddress,
  useMarkOrderPaid,
} from './useOrderContract';

// Escrow hooks
export {
  escrowKeys,
  useEscrowOrder,
  useBuyerEscrowOrders,
  useSellerEscrowOrders,
  useDeliveryCode,
  useReceivingCode,
  useEscrowStatus,
  useInitiateTrade,
  useDeliverOrder,
  useConfirmDelivery,
  useCancelEscrow,
} from './useEscrowContract';

// Product Query hooks
export {
  useSellerProducts as useSellerProductsQuery,
  useProductQuery,
  useProducts,
} from './useProductQuery';
