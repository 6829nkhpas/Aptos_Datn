/**
 * @fileoverview Order Smart Contract Service
 * @description Functions to interact with order module
 */

import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { MODULES, DEFAULT_GAS_OPTIONS } from "@/constants";
import { aptos } from "@/lib/aptos";
import type {
  Order,
  PlaceOrderParams,
  UpdateOrderStatusParams,
  CancelOrderParams,
} from "@/lib/types/contracts";

// ============= Entry Functions (Write Operations) =============

/**
 * Place a new order
 */
export const placeOrder = (
  params: PlaceOrderParams
): InputTransactionData => {
  const { productAddress, quantity, shippingAddress, notes } = params;
  
  return {
    data: {
      function: `${MODULES.ORDER}::place_order`,
      functionArguments: [productAddress, quantity, shippingAddress, notes],
    },
    options: DEFAULT_GAS_OPTIONS,
  };
};

/**
 * Update order status
 */
export const updateOrderStatus = (
  params: UpdateOrderStatusParams
): InputTransactionData => {
  const { orderAddress, newStatus } = params;
  
  return {
    data: {
      function: `${MODULES.ORDER}::update_order_status`,
      functionArguments: [orderAddress, newStatus],
    },
    options: DEFAULT_GAS_OPTIONS,
  };
};

/**
 * Cancel order
 */
export const cancelOrder = (
  params: CancelOrderParams
): InputTransactionData => {
  const { orderAddress, reason } = params;
  
  return {
    data: {
      function: `${MODULES.ORDER}::cancel_order`,
      functionArguments: [orderAddress, reason],
    },
    options: DEFAULT_GAS_OPTIONS,
  };
};

/**
 * Update shipping address
 */
export const updateShippingAddress = (
  orderAddress: string,
  newAddress: string
): InputTransactionData => {
  return {
    data: {
      function: `${MODULES.ORDER}::update_shipping_address`,
      functionArguments: [orderAddress, newAddress],
    },
    options: DEFAULT_GAS_OPTIONS,
  };
};

/**
 * Mark order as paid
 */
export const markOrderPaid = (
  orderAddress: string
): InputTransactionData => {
  return {
    data: {
      function: `${MODULES.ORDER}::mark_order_paid`,
      functionArguments: [orderAddress],
    },
    options: DEFAULT_GAS_OPTIONS,
  };
};

// ============= View Functions (Read Operations) =============

/**
 * Get order details
 */
export const getOrder = async (
  orderAddress: string
): Promise<Order | null> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULES.ORDER}::get_order` as `${string}::${string}::${string}`,
        functionArguments: [orderAddress],
      },
    });

    if (!result || result.length === 0) {
      return null;
    }

    const [
      orderId,
      productAddress,
      buyerAddress,
      sellerAddress,
      quantity,
      totalPrice,
      shippingAddress,
      status,
      isPaid,
      createdAt,
      updatedAt,
      notes,
    ] = result as [
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      number,
      boolean,
      string,
      string,
      string
    ];

    return {
      orderAddress,
      orderId: parseInt(orderId),
      productAddress,
      buyerAddress,
      sellerAddress,
      quantity: parseInt(quantity),
      totalPrice: parseInt(totalPrice),
      shippingAddress,
      status,
      isPaid,
      createdAt: parseInt(createdAt),
      updatedAt: parseInt(updatedAt),
      notes,
    };
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
};

/**
 * Get buyer orders
 */
export const getBuyerOrders = async (
  buyerAddress: string
): Promise<string[]> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULES.ORDER}::get_buyer_orders` as `${string}::${string}::${string}`,
        functionArguments: [buyerAddress],
      },
    });

    return result[0] as string[];
  } catch (error) {
    console.error("Error fetching buyer orders:", error);
    return [];
  }
};

/**
 * Get seller orders
 */
export const getSellerOrders = async (
  sellerAddress: string
): Promise<string[]> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULES.ORDER}::get_seller_orders` as `${string}::${string}::${string}`,
        functionArguments: [sellerAddress],
      },
    });

    return result[0] as string[];
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    return [];
  }
};

/**
 * Get order status
 */
export const getOrderStatus = async (
  orderAddress: string
): Promise<number> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULES.ORDER}::get_order_status` as `${string}::${string}::${string}`,
        functionArguments: [orderAddress],
      },
    });

    return result[0] as number;
  } catch (error) {
    console.error("Error fetching order status:", error);
    return 0;
  }
};

/**
 * Check if order is paid
 */
export const isOrderPaid = async (
  orderAddress: string
): Promise<boolean> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULES.ORDER}::is_order_paid` as `${string}::${string}::${string}`,
        functionArguments: [orderAddress],
      },
    });

    return result[0] as boolean;
  } catch (error) {
    console.error("Error checking if order is paid:", error);
    return false;
  }
};

/**
 * Check if order can be cancelled
 */
export const canCancelOrder = async (
  orderAddress: string
): Promise<boolean> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULES.ORDER}::can_cancel_order` as `${string}::${string}::${string}`,
        functionArguments: [orderAddress],
      },
    });

    return result[0] as boolean;
  } catch (error) {
    console.error("Error checking if order can be cancelled:", error);
    return false;
  }
};
