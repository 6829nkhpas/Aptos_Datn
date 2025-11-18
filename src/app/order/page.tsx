'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useBuyerOrders, useProduct } from '@/lib/hooks';
import { useAuth } from '@/lib/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { toast } from 'sonner';
import {
  Package,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Eye,
  Loader2,
  Download
} from 'lucide-react';

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { account } = useWallet();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch order addresses from blockchain
  const { data: orderAddresses, isLoading: ordersLoading, error: ordersError } = useBuyerOrders(account?.address?.toString());
  
  // For now, we'll show order addresses - in production, you'd fetch full order details
  // This would require multiple queries or an indexer
  const isLoading = ordersLoading;
  const error = ordersError;

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('Please login to view your orders');
      router.push('/');
    }
  }, [authLoading, isAuthenticated, router]);

  // Transform blockchain order addresses to UI format
  // Note: In production, you'd fetch full order details for each address
  // For now, we show placeholder data based on addresses
  const orders = useMemo(() => {
    if (!orderAddresses || orderAddresses.length === 0) return [];

    // TODO: Fetch full order details for each address using useOrder hook
    // This would require either:
    // 1. Multiple parallel queries (can be slow)
    // 2. An indexer that aggregates order data
    // For now, return placeholder data
    return orderAddresses.map((address, index) => ({
      id: address,
      date: new Date().toISOString(), // Would come from order data
      items: 1,
      total: '0', // Would come from order data
      status: 'processing', // Would come from order data
      products: [
        {
          title: 'Product', // Would come from product data
          image: ''
        }
      ],
      rawStatus: 'PROCESSING',
      category: 'General'
    }));
  }, [orderAddresses]);

  const filterOptions = [
    { value: 'all', label: 'All Orders', count: orders.length },
    { value: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'processing').length },
    { value: 'in-transit', label: 'In Transit', count: orders.filter(o => o.status === 'in-transit').length },
    { value: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
    { value: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length }
  ];

  const getStatusConfig = (status: string) => {
    const configs = {
      processing: { variant: 'warning' as const, icon: Clock, color: 'text-yellow-500' },
      shipped: { variant: 'default' as const, icon: Truck, color: 'text-blue-500' },
      'in-transit': { variant: 'default' as const, icon: Truck, color: 'text-blue-500' },
      delivered: { variant: 'success' as const, icon: CheckCircle2, color: 'text-green-500' },
      completed: { variant: 'success' as const, icon: CheckCircle2, color: 'text-green-500' },
      cancelled: { variant: 'error' as const, icon: XCircle, color: 'text-red-500' }
    };
    return configs[status as keyof typeof configs] || configs.processing;
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#C6D870] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your orders...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="glass-neo p-8 border-gray-800 max-w-md text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Failed to Load Orders</h3>
          <p className="text-gray-400 mb-6">
            {error instanceof Error ? error.message : 'Something went wrong'}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[#C6D870] text-black hover:bg-[#B5C760]"
          >
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">My Orders</h1>
          <p className="text-gray-400">Track and manage your purchases</p>
        </div>

        {/* Filters & Search */}
        <Card className="glass-neo p-6 border-gray-800 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 bg-black/50 border-gray-700 text-white"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto">
              <Filter className="w-5 h-5 text-gray-400 shrink-0" />
              {filterOptions.map((option) => (
                <Button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  size="sm"
                  variant={filter === option.value ? 'default' : 'outline'}
                  className={filter === option.value
                    ? 'bg-[#C6D870] text-black hover:bg-[#B5C760] shrink-0'
                    : 'border-gray-700 text-white hover:bg-white/5 shrink-0'
                  }
                >
                  {option.label} ({option.count})
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card className="glass-neo p-12 border-gray-800 text-center">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Orders Found</h3>
            <p className="text-gray-400 mb-6">
              {searchQuery ? 'Try adjusting your search' : 'You haven\'t placed any orders yet'}
            </p>
            <Button className="bg-[#C6D870] text-black hover:bg-[#B5C760]" asChild>
              <Link href="/search">Start Shopping</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;

              return (
                <Link key={order.id} href={`/order/${order.id}`}>
                  <Card className="glass-neo border-gray-800/50 hover:border-[#C6D870]/40 transition-all duration-300 group overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        {/* Left: Order ID & Date */}
                        <div className="flex items-center gap-4">
                          <div className="neo-flat w-12 h-12 rounded-xl flex items-center justify-center bg-white/5">
                            <Package className="w-6 h-6 text-[#C6D870]" />
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-white group-hover:text-[#C6D870] transition-colors">
                              {order.id}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {new Date(order.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Right: Status Badge */}
                        <Badge
                          variant={statusConfig.variant}
                          className="capitalize text-xs px-3 py-1"
                        >
                          <StatusIcon className="w-3 h-3 mr-1.5" />
                          {order.status.replace('-', ' ')}
                        </Badge>
                      </div>

                      {/* Middle: Product Preview & Items */}
                      <div className="flex items-center justify-between py-3 border-t border-gray-800/50">
                        <div className="flex items-center gap-3">
                          {/* Product Images */}
                          <div className="flex -space-x-3">
                            {order.products.slice(0, 3).map((product, idx) => (
                              <div
                                key={idx}
                                className="w-10 h-10 rounded-lg bg-linear-to-br from-gray-800 to-gray-900 border-2 border-black ring-1 ring-gray-700/50 shrink-0"
                                style={{ zIndex: 10 - idx }}
                              />
                            ))}
                            {order.products.length > 3 && (
                              <div className="w-10 h-10 rounded-lg bg-black/80 border-2 border-black ring-1 ring-gray-700/50 flex items-center justify-center shrink-0">
                                <span className="text-xs font-medium text-gray-400">+{order.products.length - 3}</span>
                              </div>
                            )}
                          </div>
                          <span className="text-sm text-gray-400">
                            {order.items} {order.items === 1 ? 'item' : 'items'}
                          </span>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <div className="text-xs text-gray-500 mb-0.5">Total</div>
                          <div className="text-lg font-bold text-[#C6D870]">{order.total} <span className="text-sm font-normal text-gray-400">DATN</span></div>
                        </div>
                      </div>

                      {/* Bottom: Quick Actions */}
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-800/50">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 h-9 text-xs text-gray-400 hover:text-white hover:bg-white/5"
                          onClick={(e) => e.preventDefault()}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1.5" />
                          View
                        </Button>

                        {order.status === 'in-transit' && (
                          <Button
                            size="sm"
                            className="flex-1 h-9 text-xs bg-[#C6D870]/10 text-[#C6D870] hover:bg-[#C6D870]/20 border border-[#C6D870]/20"
                            onClick={(e) => e.preventDefault()}
                          >
                            <Truck className="w-3.5 h-3.5 mr-1.5" />
                            Track
                          </Button>
                        )}

                        {order.status === 'delivered' && (
                          <Button
                            size="sm"
                            className="flex-1 h-9 text-xs bg-white/5 text-gray-300 hover:bg-white/10 border border-gray-700/50"
                            onClick={(e) => e.preventDefault()}
                          >
                            <Download className="w-3.5 h-3.5 mr-1.5" />
                            Invoice
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
