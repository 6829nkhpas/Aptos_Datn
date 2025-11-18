'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOrder, useProduct } from '@/lib/hooks';
import { useAuth } from '@/lib/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Package,
  Truck,
  CheckCircle2,
  Calendar,
  User,
  Mail,
  MessageCircle,
  AlertCircle,
  ExternalLink,
  ArrowLeft,
  Loader2,
  XCircle,
  Clock,
  ShoppingBag
} from 'lucide-react';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Fetch order from blockchain
  const { data: orderData, isLoading: orderLoading, error: orderError } = useOrder(id, !authLoading && isAuthenticated);
  
  // Fetch product details if order exists
  const { data: productData } = useProduct(orderData?.productAddress || '', !!orderData?.productAddress);

  // Map blockchain data to UI format
  type UIOrder = {
    id: string;
    status: string;
    createdAt: string;
    deliveryCode?: string;
    product: {
      id: string;
      name: string;
      description: string;
      price: string;
      images: string[];
      category: string;
      quantity: number;
    };
    buyer: {
      name: string;
      email?: string;
      wallet: string;
    };
    transaction?: {
      txHash?: string;
      status?: string;
    };
  };

  const order: UIOrder | null = React.useMemo(() => {
    if (!orderData) return null;
    
    const statusMap: Record<number, string> = {
      0: 'PROCESSING',
      1: 'SHIPPED',
      2: 'DELIVERED',
      3: 'COMPLETED',
      4: 'CANCELLED',
    };

    return {
      id: orderData.orderAddress,
      status: statusMap[orderData.status] || 'PROCESSING',
      createdAt: new Date(orderData.createdAt).toISOString(),
      deliveryCode: undefined, // Not in basic order, available in escrow
      product: {
        id: orderData.productAddress,
        name: productData?.title || 'Loading...',
        description: productData?.description || '',
        price: (orderData.totalPrice / 100000000).toFixed(2), // Convert octas to APT
        images: productData?.imageUrls || [],
        category: productData?.category || 'General',
        quantity: orderData.quantity,
      },
      buyer: {
        name: 'Buyer', // Would need to fetch from profile contract
        email: undefined,
        wallet: orderData.buyerAddress,
      },
      transaction: {
        txHash: undefined, // Not stored in order struct
        status: orderData.isPaid ? 'confirmed' : 'pending',
      },
    };
  }, [orderData, productData]);

  const isLoading = orderLoading;
  const error = orderError;

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('Please login to view order details');
      router.push('/');
    }
  }, [authLoading, isAuthenticated, router]);

  // Status configuration
  const getStatusConfig = (status: string) => {
    const configs = {
      PROCESSING: { variant: 'warning' as const, icon: Clock, label: 'Processing', color: 'text-yellow-500' },
      SHIPPED: { variant: 'default' as const, icon: Truck, label: 'In Transit', color: 'text-blue-500' },
      DELIVERED: { variant: 'success' as const, icon: CheckCircle2, label: 'Delivered', color: 'text-green-500' },
      COMPLETED: { variant: 'success' as const, icon: CheckCircle2, label: 'Completed', color: 'text-green-500' },
      CANCELLED: { variant: 'error' as const, icon: XCircle, label: 'Cancelled', color: 'text-red-500' }
    };
    return configs[status as keyof typeof configs] || configs.PROCESSING;
  };

  // Generate timeline based on order status
  const getTimeline = (status: string, createdAt: string) => {
    const baseTimeline = [
      { status: 'Order Placed', date: createdAt, completed: true },
      { status: 'Payment Confirmed', date: createdAt, completed: true },
      { status: 'Processing', date: '', completed: status !== 'PROCESSING' },
      { status: 'Shipped', date: '', completed: status === 'SHIPPED' || status === 'DELIVERED' || status === 'COMPLETED' },
      { status: 'Delivered', date: '', completed: status === 'DELIVERED' || status === 'COMPLETED' },
      { status: 'Completed', date: '', completed: status === 'COMPLETED' }
    ];

    if (status === 'CANCELLED') {
      return [
        { status: 'Order Placed', date: createdAt, completed: true },
        { status: 'Cancelled', date: '', completed: true }
      ];
    }

    return baseTimeline;
  };

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#C6D870] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading order details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="glass-neo p-8 border-gray-800 max-w-md text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Order Not Found</h3>
          <p className="text-gray-400 mb-6">
            {error instanceof Error ? error.message : 'This order does not exist or you do not have permission to view it.'}
          </p>
          <Button
            onClick={() => router.push('/order')}
            className="bg-[#C6D870] text-black hover:bg-[#B5C760]"
          >
            Back to Orders
          </Button>
        </Card>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;
  const timeline = getTimeline(order.status, order.createdAt);

  return (
    <div className="min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Button
          variant="outline"
          className="mb-6 border-gray-700 text-white hover:bg-white/5"
          asChild
        >
          <Link href="/order">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Link>
        </Button>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Order Details</h1>
            <div className="flex items-center gap-3">
              <p className="text-gray-400">Order #{id.slice(0, 8)}</p>
              <Badge variant={statusConfig.variant} className={statusConfig.color}>
                {statusConfig.label}
              </Badge>
            </div>
          </div>
          <div className="flex gap-3">
            {order.deliveryCode && (
              <div className="px-4 py-2 rounded-lg glass border border-gray-700">
                <p className="text-xs text-gray-400">Delivery Code</p>
                <p className="text-lg font-bold text-[#C6D870]">{order.deliveryCode}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Status Timeline */}
            <Card className="glass-neo p-6 border-gray-800">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <StatusIcon className="w-6 h-6 text-[#C6D870]" />
                    Order Status
                  </h2>
                  <p className="text-sm text-gray-400">
                    Ordered on {new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div className="relative">
                <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gray-700" />
                <div className="space-y-6">
                  {timeline.map((item, index) => (
                    <div key={index} className="relative flex items-start gap-4">
                      <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all ${item.completed
                        ? 'bg-[#C6D870] text-black'
                        : 'bg-gray-700 text-gray-400'
                        }`}>
                        {item.completed && <CheckCircle2 className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 pt-2">
                        <p className={`font-semibold ${item.completed ? 'text-white' : 'text-gray-400'}`}>
                          {item.status}
                        </p>
                        {item.date && (
                          <p className="text-sm text-gray-400 mt-1">
                            {new Date(item.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Order Items */}
            {/* Product Information */}
            <Card className="glass-neo p-6 border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-[#C6D870]" />
                Product Information
              </h2>

              <div className="p-4 rounded-lg glass">
                <div className="flex gap-4">
                  {order.product.images?.[0] ? (
                    <Image
                      src={order.product.images[0]}
                      alt={order.product.name}
                      width={96}
                      height={96}
                      className="w-24 h-24 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-gray-700 flex items-center justify-center shrink-0">
                      <Package className="w-8 h-8 text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Link href={`/product/${order.product.id || ''}`} className="hover:text-[#C6D870] transition-colors">
                      <h3 className="text-white font-semibold mb-1">{order.product.name}</h3>
                    </Link>
                    {order.product.description && (
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">{order.product.description}</p>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <Badge variant="outline" className="border-gray-700 text-gray-300">
                          {order.product.category}
                        </Badge>
                      </div>
                      <div className="text-right">
                        {order.product.quantity && (
                          <p className="text-sm text-gray-400">Qty: {order.product.quantity}</p>
                        )}
                        <p className="text-lg font-bold text-[#C6D870]">{order.product.price} DATN</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Buyer Information */}
            {order.buyer && (
              <Card className="glass-neo p-6 border-gray-800">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <User className="w-6 h-6 text-[#C6D870]" />
                  Buyer Information
                </h2>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-[#C6D870] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Name</p>
                      <p className="text-white font-semibold">{order.buyer.name}</p>
                    </div>
                  </div>

                  {order.buyer.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-[#C6D870] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Email</p>
                        <p className="text-white font-semibold">{order.buyer.email}</p>
                      </div>
                    </div>
                  )}

                  {order.buyer.wallet && (
                    <div className="flex items-start gap-3">
                      <Package className="w-5 h-5 text-[#C6D870] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Wallet Address</p>
                        <p className="text-white font-mono text-sm break-all">{order.buyer.wallet}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="bg-black p-6 border-gray-800 sticky top-8">
              <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 pb-6 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[#C6D870]" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">Order Date</p>
                    <p className="text-white font-semibold">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-[#C6D870]" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">Order ID</p>
                    <p className="text-white font-mono text-sm break-all">{order.id}</p>
                  </div>
                </div>
              </div>

              {/* Price Information */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-800">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Product Price</span>
                  <span className="text-white font-medium">{order.product.price} DATN</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-lg font-semibold text-white">Total Amount</span>
                <span className="text-2xl font-bold text-[#C6D870]">{order.product.price} DATN</span>
              </div>

              {/* Transaction */}
              {order.transaction?.txHash && (
                <div className="p-4 rounded-lg glass">
                  <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Transaction Hash
                  </p>
                  <a
                    href={`https://etherscan.io/tx/${order.transaction.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-[#C6D870] hover:text-[#B5C760] break-all transition-colors"
                  >
                    {order.transaction.txHash}
                  </a>
                  {order.transaction.status && (
                    <div className="mt-2 pt-2 border-t border-gray-700">
                      <p className="text-xs text-gray-400">Status: <span className="text-white">{order.transaction.status}</span></p>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Help Card */}
            <Card className="glass-neo p-6 border-gray-800">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Need Help?</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Contact our support team for any order-related queries.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-gray-700 text-white hover:bg-white/5"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
