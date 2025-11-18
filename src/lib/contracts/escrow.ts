/**
 * @fileoverview Escrow Smart Contract Service
 * @description Functions to interact with escrow module
 */

import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { MODULES, DEFAULT_GAS_OPTIONS } from "@/constants";
import { aptos } from "@/lib/aptos";
import type {
  EscrowOrder,
  InitiateTradeParams,
  DeliverOrderParams,
  ConfirmDeliveryParams,
  CancelEscrowParams,
} from "@/lib/types/contracts";

// ============= Entry Functions (Write Operations) =============

/**
 * Initiate trade and lock funds
 */
export const initiateTradeAndLockFunds = (
  params: InitiateTradeParams
): InputTransactionData => {
  const { productAddress, quantity, shippingAddress, transactionHash } = params;
  
  return {
    data: {
      function: `${MODULES.ESCROW}::initiate_trade_and_lock_funds`,
      functionArguments: [productAddress, quantity, shippingAddress, transactionHash],
    },
    options: DEFAULT_GAS_OPTIONS,
  };
};

/**
 * Deliver order with delivery code
 */
export const deliverOrder = (
  params: DeliverOrderParams
): InputTransactionData => {
  const { escrowOrderAddress, deliveryCode } = params;
  
  return {
    data: {
      function: `${MODULES.ESCROW}::deliver_order`,
      functionArguments: [escrowOrderAddress, deliveryCode],
    },
    options: DEFAULT_GAS_OPTIONS,
  };
};

/**
 * Confirm delivery and release funds
 */
export const confirmDeliveryAndReleaseFunds = (
  params: ConfirmDeliveryParams
): InputTransactionData => {
  const { escrowOrderAddress, receivingCode } = params;
  
  return {
    data: {
      function: `${MODULES.ESCROW}::confirm_delivery_and_release_funds`,
      functionArguments: [escrowOrderAddress, receivingCode],
    },
    options: DEFAULT_GAS_OPTIONS,
  };
};

/**
 * Cancel escrow order
 */
export const cancelEscrowOrder = (
  params: CancelEscrowParams
): InputTransactionData => {
  const { escrowOrderAddress, reason } = params;
  
  return {
    data: {
      function: `${MODULES.ESCROW}::cancel_escrow_order`,
      functionArguments: [escrowOrderAddress, reason],
    },
    options: DEFAULT_GAS_OPTIONS,
  };
};

// ============= View Functions (Read Operations) =============

/**
 * Get escrow order details
 */
export const getEscrowOrder = async (
  escrowOrderAddress: string
): Promise<EscrowOrder | null> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULES.ESCROW}::get_escrow_order` as `${string}::${string}::${string}`,
        functionArguments: [escrowOrderAddress],
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
      lockedFunds,
      shippingAddress,
      status,
      deliveryCode,
      receivingCode,
      transactionHash,
      createdAt,
      deliveredAt,
      confirmedAt,
    ] = result as [
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      number,
      string,
      string,
      string,
      string,
      string,
      string
    ];

    return {
      escrowOrderAddress,
      orderId: parseInt(orderId),
      productAddress,
      buyerAddress,
      sellerAddress,
      quantity: parseInt(quantity),
      totalPrice: parseInt(totalPrice),
      lockedFunds: parseInt(lockedFunds),
      shippingAddress,
      status,
      deliveryCode,
      receivingCode,
      transactionHash,
      createdAt: parseInt(createdAt),
      deliveredAt: parseInt(deliveredAt),
      confirmedAt: parseInt(confirmedAt),
    };
  } catch (error) {
    console.error("Error fetching escrow order:", error);
    return null;
  }
};

/**
 * Get buyer escrow orders
 */
export const getBuyerEscrowOrders = async (
  buyerAddress: string
): Promise<string[]> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULES.ESCROW}::get_buyer_escrow_orders` as `${string}::${string}::${string}`,
        functionArguments: [buyerAddress],
      },
    });

    return result[0] as string[];
  } catch (error) {
    console.error("Error fetching buyer escrow orders:", error);
    return [];
  }
};

/**
 * Get seller escrow orders
 */
export const getSellerEscrowOrders = async (
  sellerAddress: string
): Promise<string[]> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULES.ESCROW}::get_seller_escrow_orders` as `${string}::${string}::${string}`,
        functionArguments: [sellerAddress],
      },
    });

    return result[0] as string[];
  } catch (error) {
    console.error("Error fetching seller escrow orders:", error);
    return [];
  }
};

/**
 * Get delivery code
 */
export const getDeliveryCode = async (
  escrowOrderAddress: string
): Promise<string> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULES.ESCROW}::get_delivery_code` as `${string}::${string}::${string}`,
        functionArguments: [escrowOrderAddress],
      },
    });

    return result[0] as string;
  } catch (error) {
    console.error("Error fetching delivery code:", error);
    return "";
  }
};

/**
 * Get receiving code
 */
export const getReceivingCode = async (
  escrowOrderAddress: string
): Promise<string> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULES.ESCROW}::get_receiving_code` as `${string}::${string}::${string}`,
        functionArguments: [escrowOrderAddress],
      },
    });

    return result[0] as string;
  } catch (error) {
    console.error("Error fetching receiving code:", error);
    return "";
  }
};

/**
 * Get escrow status
 */
export const getEscrowStatus = async (
  escrowOrderAddress: string
): Promise<number> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULES.ESCROW}::get_escrow_status` as `${string}::${string}::${string}`,
        functionArguments: [escrowOrderAddress],
      },
    });

    return result[0] as number;
  } catch (error) {
    console.error("Error fetching escrow status:", error);
    return 0;
  }
};

/**
 * Get locked funds amount
 */
export const getLockedFunds = async (
  escrowOrderAddress: string
): Promise<number> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULES.ESCROW}::get_locked_funds` as `${string}::${string}::${string}`,
        functionArguments: [escrowOrderAddress],
      },
    });

    return parseInt(result[0] as string);
  } catch (error) {
    console.error("Error fetching locked funds:", error);
    return 0;
  }
};

/**
 * Check if escrow is active
 */
export const isEscrowActive = async (
  escrowOrderAddress: string
): Promise<boolean> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULES.ESCROW}::is_escrow_active` as `${string}::${string}::${string}`,
        functionArguments: [escrowOrderAddress],
      },
    });

    return result[0] as boolean;
  } catch (error) {
    console.error("Error checking if escrow is active:", error);
    return false;
  }
};

/**
 * Check if escrow can be cancelled
 */
export const canCancelEscrow = async (
  escrowOrderAddress: string
): Promise<boolean> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULES.ESCROW}::can_cancel_escrow` as `${string}::${string}::${string}`,
        functionArguments: [escrowOrderAddress],
      },
    });

    return result[0] as boolean;
  } catch (error) {
    console.error("Error checking if escrow can be cancelled:", error);
    return false;
  }
};
