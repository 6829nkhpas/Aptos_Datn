"use client";

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/providers/AuthProvider';
import { useSellerEscrowOrders, useEscrowOrder, useUserProfile } from '@/lib/hooks';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import Link from 'next/link';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Loader2,
  Package,
  Calendar,
  ArrowUpRight
} from 'lucide-react';

export default function SellerPaymentsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { account } = useWallet();
  
  // Fetch seller's profile and escrow orders from blockchain
  const { data: profileData } = useUserProfile(account?.address?.toString());
  const { data: escrowOrderAddresses = [], isLoading: escrowLoading } = useSellerEscrowOrders(account?.address?.toString());

  // Map blockchain profile data
  const user = useMemo(() => {
    if (!profileData || !account) return null;
    return {
      name: profileData.name,
      wallet: account.address?.toString() || '',
    };
  }, [profileData, account]);

  // Calculate payment statistics from escrow orders
  // Note: In production, you'd fetch full details for each escrow order
  // For now, showing count and basic info
  const paymentStats = useMemo(() => {
    return {
      totalEscrows: escrowOrderAddresses.length,
      // Would need to fetch each escrow order to calculate:
      // - completed (status = confirmed/completed)
      // - pending (status = locked/delivered)
      // - total earnings (sum of completed order amounts)
    };
  }, [escrowOrderAddresses]);

  if (authLoading || escrowLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#C6D870] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading payment information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Payments & Earnings</h1>
          <p className="text-gray-400">
            Track your escrow orders and earnings from {user?.name || 'your account'}
          </p>
        </div>

        {/* Payment Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-neo p-6 border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-[#C6D870]/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#C6D870]" />
              </div>
              <Badge variant="outline" className="border-[#C6D870] text-[#C6D870]">
                Blockchain
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">
              {paymentStats.totalEscrows}
            </h3>
            <p className="text-sm text-gray-400">Total Escrow Orders</p>
            <p className="text-xs text-gray-500 mt-2">
              Tracked on Aptos blockchain
            </p>
          </Card>

          <Card className="glass-neo p-6 border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">
              0 APT
            </h3>
            <p className="text-sm text-gray-400">Completed Payments</p>
            <p className="text-xs text-gray-500 mt-2">
              Requires fetching full escrow details
            </p>
          </Card>

          <Card className="glass-neo p-6 border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">
              0 APT
            </h3>
            <p className="text-sm text-gray-400">Pending Release</p>
            <p className="text-xs text-gray-500 mt-2">
              Funds in active escrows
            </p>
          </Card>
        </div>

        {/* Escrow Orders List */}
        <Card className="glass-neo p-6 border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-[#C6D870]" />
              Escrow Orders
            </h2>
          </div>

          {escrowOrderAddresses.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Escrow Orders Yet</h3>
              <p className="text-gray-400 mb-6">
                Escrow orders appear here when buyers purchase your products with escrow protection
              </p>
              <Link href="/seller/products">
                <button className="px-6 py-3 bg-[#C6D870] text-black rounded-lg font-semibold hover:bg-[#B5C760] transition-colors">
                  View Your Products
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mb-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-blue-400">
                  💡 <strong>Note:</strong> Showing escrow order addresses. Click on each to view full payment details including amount, status, and transaction history.
                </p>
              </div>
              
              {escrowOrderAddresses.map((escrowAddress) => (
                <EscrowOrderCard key={escrowAddress} escrowAddress={escrowAddress} />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// Component to display individual escrow order with details
function EscrowOrderCard({ escrowAddress }: { escrowAddress: string }) {
  const { data: escrowData, isLoading } = useEscrowOrder(escrowAddress);

  const statusMap: Record<number, { label: string; color: string; variant: 'default' | 'success' | 'warning' }> = {
    0: { label: 'Locked', color: 'text-yellow-500', variant: 'warning' },
    1: { label: 'Delivered', color: 'text-blue-500', variant: 'default' },
    2: { label: 'Confirmed', color: 'text-green-500', variant: 'success' },
    3: { label: 'Cancelled', color: 'text-red-500', variant: 'default' },
  };

  if (isLoading) {
    return (
      <div className="p-4 rounded-lg glass">
        <Loader2 className="w-5 h-5 text-[#C6D870] animate-spin" />
      </div>
    );
  }

  if (!escrowData) {
    return (
      <Link href={`/order/${escrowAddress}`}>
        <div className="p-4 rounded-lg glass hover:bg-white/5 transition-colors cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-white font-medium">Escrow Order #{escrowAddress.slice(0, 8)}...</p>
              <p className="text-sm text-gray-400 mt-1">Click to view details</p>
            </div>
            <ArrowUpRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </Link>
    );
  }

  const status = statusMap[escrowData.status] || statusMap[0];

  return (
    <Link href={`/order/${escrowAddress}`}>
      <div className="p-4 rounded-lg glass hover:bg-white/5 transition-colors cursor-pointer">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <p className="text-white font-medium">Order #{escrowData.orderId}</p>
              <Badge variant={status.variant} className={status.color}>
                {status.label}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <p className="text-xs text-gray-400">Amount</p>
                <p className="text-lg font-bold text-[#C6D870]">
                  {(escrowData.totalPrice / 100000000).toFixed(4)} APT
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Quantity</p>
                <p className="text-white">{escrowData.quantity} items</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>{new Date(escrowData.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <ArrowUpRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </Link>
  );
}
