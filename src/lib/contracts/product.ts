/**
 * @fileoverview Product Smart Contract Service
 * @description Functions to interact with product module
 */

import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { MODULES, DEFAULT_GAS_OPTIONS } from "@/constants";
import { aptos } from "@/lib/aptos";
import type {
  Product,
  CreateProductParams,
  UpdateProductParams,
  UpdateInventoryParams,
} from "@/lib/types/contracts";

// ============= Entry Functions (Write Operations) =============

/**
 * Create a new product (Seller only)
 */
export const createProduct = (
  params: CreateProductParams
): InputTransactionData => {
  const { title, description, price, quantity, imageUrls, category } = params;
  
  return {
    data: {
      function: `${MODULES.PRODUCT}::create_product`,
      functionArguments: [title, description, price, quantity, imageUrls, category],
    },
    options: DEFAULT_GAS_OPTIONS,
  };
};

/**
 * Update product details
 */
export const updateProduct = (
  params: UpdateProductParams
): InputTransactionData => {
  const { productAddress, title, description, price, imageUrls, category } = params;
  
  return {
    data: {
      function: `${MODULES.PRODUCT}::update_product`,
      functionArguments: [
        productAddress,
        title || "",
        description || "",
        price || 0,
        imageUrls || [],
        category || "",
      ],
    },
    options: DEFAULT_GAS_OPTIONS,
  };
};

/**
 * Update product inventory
 */
export const updateInventory = (
  params: UpdateInventoryParams
): InputTransactionData => {
  const { productAddress, additionalQuantity } = params;
  
  return {
    data: {
      function: `${MODULES.PRODUCT}::update_inventory`,
      functionArguments: [productAddress, additionalQuantity],
    },
    options: DEFAULT_GAS_OPTIONS,
  };
};

/**
 * Set product availability
 */
export const setProductAvailability = (
  productAddress: string,
  isAvailable: boolean
): InputTransactionData => {
  return {
    data: {
      function: `${MODULES.PRODUCT}::set_product_availability`,
      functionArguments: [productAddress, isAvailable],
    },
    options: DEFAULT_GAS_OPTIONS,
  };
};

/**
 * Delete product (soft delete)
 */
export const deleteProduct = (
  productAddress: string
): InputTransactionData => {
  return {
    data: {
      function: `${MODULES.PRODUCT}::delete_product`,
      functionArguments: [productAddress],
    },
    options: DEFAULT_GAS_OPTIONS,
  };
};

// ============= View Functions (Read Operations) =============

/**
 * Get product details
 */
export const getProduct = async (
  productAddress: string
): Promise<Product | null> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULES.PRODUCT}::get_product` as `${string}::${string}::${string}`,
        functionArguments: [productAddress],
      },
    });

    if (!result || result.length === 0) {
      return null;
    }

    const [
      title,
      description,
      price,
      quantity,
      soldQuantity,
      imageUrls,
      category,
      isAvailable,
      isDeleted,
      seller,
      createdAt,
      updatedAt,
    ] = result as [
      string,
      string,
      string,
      string,
      string,
      string[],
      string,
      boolean,
      boolean,
      string,
      string,
      string
    ];

    return {
      productAddress,
      title,
      description,
      price: parseInt(price),
      quantity: parseInt(quantity),
      soldQuantity: parseInt(soldQuantity),
      imageUrls,
      category,
      isAvailable,
      isDeleted,
      seller,
      createdAt: parseInt(createdAt),
      updatedAt: parseInt(updatedAt),
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
};

/**
 * Get products by seller
 */
export const getSellerProducts = async (
  sellerAddress: string
): Promise<string[]> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULES.PRODUCT}::get_seller_products` as `${string}::${string}::${string}`,
        functionArguments: [sellerAddress],
      },
    });

    return result[0] as string[];
  } catch (error) {
    console.error("Error fetching seller products:", error);
    return [];
  }
};

/**
 * Get all products from global registry
 */
export const getAllProducts = async (): Promise<string[]> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULES.PRODUCT}::get_all_products` as `${string}::${string}::${string}`,
        functionArguments: [],
      },
    });

    return result[0] as string[];
  } catch (error) {
    console.error("Error fetching all products:", error);
    return [];
  }
};

/**
 * Check if product is available
 */
export const isProductAvailable = async (
  productAddress: string
): Promise<boolean> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULES.PRODUCT}::is_available` as `${string}::${string}::${string}`,
        functionArguments: [productAddress],
      },
    });

    return result[0] as boolean;
  } catch (error) {
    console.error("Error checking product availability:", error);
    return false;
  }
};

/**
 * Check if product has enough stock
 */
export const hasEnoughStock = async (
  productAddress: string,
  requestedQuantity: number
): Promise<boolean> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULES.PRODUCT}::has_enough_stock` as `${string}::${string}::${string}`,
        functionArguments: [productAddress, requestedQuantity],
      },
    });

    return result[0] as boolean;
  } catch (error) {
    console.error("Error checking stock:", error);
    return false;
  }
};

/**
 * Get product price
 */
export const getProductPrice = async (
  productAddress: string
): Promise<number> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULES.PRODUCT}::get_product_price` as `${string}::${string}::${string}`,
        functionArguments: [productAddress],
      },
    });

    return parseInt(result[0] as string);
  } catch (error) {
    console.error("Error fetching product price:", error);
    return 0;
  }
};

/**
 * Get available quantity
 */
export const getAvailableQuantity = async (
  productAddress: string
): Promise<number> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULES.PRODUCT}::get_available_quantity` as `${string}::${string}::${string}`,
        functionArguments: [productAddress],
      },
    });

    return parseInt(result[0] as string);
  } catch (error) {
    console.error("Error fetching available quantity:", error);
    return 0;
  }
};

/**
 * Get product seller
 */
export const getProductSeller = async (
  productAddress: string
): Promise<string | null> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULES.PRODUCT}::get_product_seller` as `${string}::${string}::${string}`,
        functionArguments: [productAddress],
      },
    });

    return result[0] as string;
  } catch (error) {
    console.error("Error fetching product seller:", error);
    return null;
  }
};
