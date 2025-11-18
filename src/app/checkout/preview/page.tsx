'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Package,
  Download,
  Home,
  ExternalLink,
  Clock,
  Truck,
  Shield
} from 'lucide-react';

export default function CheckoutPreviewPage() {
  const orderDetails = {
    orderId: '#ORD-2024-001234',
    transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    date: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    status: 'Processing',
    total: '600',
    items: [
      {
        id: '1',
        title: 'Premium Vintage Camera',
        price: '450',
        quantity: 1,
        seller: '0x1234...5678'
      },
      {
        id: '2',
        title: 'Designer Sunglasses',
        price: '150',
        quantity: 1,
        seller: '0x5678...1234'
      }
    ]
  };

  const timeline = [
    { label: 'Order Placed', completed: true, icon: CheckCircle2 },
    { label: 'Payment Confirmed', completed: true, icon: Shield },
    { label: 'Seller Notified', completed: true, icon: Package },
    { label: 'In Transit', completed: false, icon: Truck },
    { label: 'Delivered', completed: false, icon: CheckCircle2 }
  ];

  return (
    <div className="min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 rounded-full bg-[#C6D870]/10 flex items-center justify-center mx-auto mb-6 neo-outset">
            <CheckCircle2 className="w-12 h-12 text-[#C6D870]" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Order Confirmed!</h1>
          <p className="text-xl text-gray-400 mb-2">Thank you for your purchase</p>
          <p className="text-sm text-gray-500">Order {orderDetails.orderId}</p>
        </div>

        {/* Order Info Card */}
        <Card className="glass-neo p-8 border-gray-800 mb-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Order Details</h2>
              <p className="text-sm text-gray-400">{orderDetails.date}</p>
            </div>
            <Badge variant="lime" className="text-sm px-4 py-2">
              <Clock className="w-4 h-4 mr-2" />
              {orderDetails.status}
            </Badge>
          </div>

          {/* Order Items */}
          <div className="space-y-4 mb-8 pb-8 border-b border-gray-800">
            {orderDetails.items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 rounded-lg glass">
                <div className="w-20 h-20 rounded-lg bg-gray-700 shrink-0" />
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-400 font-mono mb-2">Seller: {item.seller}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Quantity: {item.quantity}</span>
                    <span className="text-[#C6D870] font-bold">{item.price} DATN</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between mb-8">
            <span className="text-xl font-semibold text-white">Total Paid</span>
            <span className="text-3xl font-bold text-[#C6D870]">{orderDetails.total} DATN</span>
          </div>

          {/* Transaction Hash */}
          <div className="p-4 rounded-lg glass">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-2">Transaction Hash</p>
                <p className="text-xs font-mono text-white break-all">{orderDetails.transactionHash}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-gray-700 text-white hover:bg-white/5 shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Order Timeline */}
        <Card className="glass-neo p-8 border-gray-800 mb-8">
          <h2 className="text-2xl font-bold text-white mb-8">Order Timeline</h2>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gray-700" />

            <div className="space-y-6">
              {timeline.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="relative flex items-start gap-4">
                    {/* Icon */}
                    <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all ${item.completed
                        ? 'bg-[#C6D870] text-black'
                        : 'bg-gray-700 text-gray-400'
                      }`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-1">
                      <p className={`font-semibold ${item.completed ? 'text-white' : 'text-gray-400'
                        }`}>
                        {item.label}
                      </p>
                      {item.completed && (
                        <p className="text-sm text-gray-400 mt-1">Completed</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Next Steps */}
        <Card className="glass-neo p-8 border-gray-800 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">What happens next?</h2>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-lg glass">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Seller Notification</h3>
                <p className="text-sm text-gray-400">The seller has been notified and will prepare your items for shipment.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg glass">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Escrow Protection</h3>
                <p className="text-sm text-gray-400">Your payment is held securely in escrow until you confirm delivery.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg glass">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Track Your Order</h3>
                <p className="text-sm text-gray-400">You will receive tracking information once the seller ships your order.</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            size="lg"
            variant="outline"
            className="flex-1 border-gray-700 text-white hover:bg-white/5"
            asChild
          >
            <Link href="/order">
              <Package className="w-5 h-5 mr-2" />
              View All Orders
            </Link>
          </Button>

          <Button
            size="lg"
            className="flex-1 bg-[#C6D870] text-black hover:bg-[#B5C760]"
            asChild
          >
            <Link href="/">
              <Home className="w-5 h-5 mr-2" />
              Continue Shopping
            </Link>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="border-gray-700 text-white hover:bg-white/5"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Receipt
          </Button>
        </div>
      </div>
    </div>
  );
}
