/**
 * @fileoverview Smart Contract Type Definitions
 * @description TypeScript interfaces for Aptos Move smart contracts
 */

// ============= User Profile Types =============

export interface UserProfile {
  name: string;
  walletAddress: string;
  country: string;
  role: number; // 1 = Buyer, 2 = Seller
  email: string;
  physicalAddress: string;
  bio: string;
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
}

export interface RegisterProfileParams {
  name: string;
  country: string;
  role: number;
  email: string;
  address: string;
  bio: string;
}

export interface UpdateProfileParams {
  profileAddress: string;
  name?: string;
  country?: string;
  email?: string;
  address?: string;
  bio?: string;
}

// ============= Product Types =============

export interface Product {
  productAddress: string;
  title: string;
  description: string;
  price: number; // in octas
  quantity: number;
  soldQuantity: number;
  imageUrls: string[];
  category: string;
  isAvailable: boolean;
  isDeleted: boolean;
  seller: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateProductParams {
  title: string;
  description: string;
  price: number; // in octas
  quantity: number;
  imageUrls: string[];
  category: string;
}

export interface UpdateProductParams {
  productAddress: string;
  title?: string;
  description?: string;
  price?: number;
  imageUrls?: string[];
  category?: string;
}

export interface UpdateInventoryParams {
  productAddress: string;
  additionalQuantity: number;
}

// ============= Order Types =============

export interface Order {
  orderAddress: string;
  orderId: number;
  productAddress: string;
  buyerAddress: string;
  sellerAddress: string;
  quantity: number;
  totalPrice: number; // in octas
  shippingAddress: string;
  status: number;
  isPaid: boolean;
  createdAt: number;
  updatedAt: number;
  notes: string;
}

export interface PlaceOrderParams {
  productAddress: string;
  quantity: number;
  shippingAddress: string;
  notes: string;
}

export interface UpdateOrderStatusParams {
  orderAddress: string;
  newStatus: number;
}

export interface CancelOrderParams {
  orderAddress: string;
  reason: string;
}

// ============= Escrow Types =============

export interface EscrowOrder {
  escrowOrderAddress: string;
  orderId: number;
  productAddress: string;
  buyerAddress: string;
  sellerAddress: string;
  quantity: number;
  totalPrice: number; // in octas
  lockedFunds: number; // in octas
  shippingAddress: string;
  status: number;
  deliveryCode: string; // 6-digit code
  receivingCode: string; // 4-digit code
  transactionHash: string;
  createdAt: number;
  deliveredAt: number;
  confirmedAt: number;
}

export interface InitiateTradeParams {
  productAddress: string;
  quantity: number;
  shippingAddress: string;
  transactionHash: string;
}

export interface DeliverOrderParams {
  escrowOrderAddress: string;
  deliveryCode: string;
}

export interface ConfirmDeliveryParams {
  escrowOrderAddress: string;
  receivingCode: string;
}

export interface CancelEscrowParams {
  escrowOrderAddress: string;
  reason: string;
}
