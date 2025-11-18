'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, 
  CreditCard, 
  MapPin, 
  User,
  Mail,
  Phone,
  Wallet,
  ArrowRight,
  ShieldCheck,
  Lock,
  CheckCircle2
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    paymentMethod: 'wallet'
  });

  const cartItems = [
    {
      id: '1',
      title: 'Premium Vintage Camera',
      price: '450',
      quantity: 1,
      image: '/product-1.jpg',
      seller: '0x1234...5678'
    },
    {
      id: '2',
      title: 'Designer Sunglasses',
      price: '150',
      quantity: 1,
      image: '/product-2.jpg',
      seller: '0x5678...1234'
    }
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + parseInt(item.price) * item.quantity, 0);
  const platformFee = Math.floor(subtotal * 0.02); // 2% platform fee
  const total = subtotal + platformFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else {
      // Process payment
      router.push('/checkout/preview');
    }
  };

  return (
    <div className="min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Checkout</h1>
          <p className="text-gray-400">Complete your purchase securely</p>
        </div>

        {/* Progress Steps */}
        <Card className="glass-neo p-6 border-gray-800 mb-8">
          <div className="flex items-center justify-between relative">
            {/* Step 1 */}
            <div className="flex items-center gap-3 z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                step >= 1 ? 'bg-[#C6D870] text-black' : 'bg-gray-700 text-gray-400'
              }`}>
                {step > 1 ? <CheckCircle2 className="w-6 h-6" /> : '1'}
              </div>
              <div className="hidden sm:block">
                <p className={`font-semibold ${step >= 1 ? 'text-white' : 'text-gray-400'}`}>
                  Shipping Info
                </p>
                <p className="text-xs text-gray-500">Enter your details</p>
              </div>
            </div>

            {/* Connector Line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-700">
              <div 
                className="h-full bg-[#C6D870] transition-all duration-300"
                style={{ width: step === 1 ? '0%' : '100%' }}
              />
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-3 z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                step >= 2 ? 'bg-[#C6D870] text-black' : 'bg-gray-700 text-gray-400'
              }`}>
                2
              </div>
              <div className="hidden sm:block">
                <p className={`font-semibold ${step >= 2 ? 'text-white' : 'text-gray-400'}`}>
                  Payment
                </p>
                <p className="text-xs text-gray-500">Complete purchase</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              {step === 1 ? (
                <Card className="glass-neo p-6 border-gray-800">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-[#C6D870]" />
                    Shipping Information
                  </h2>

                  <div className="space-y-6">
                    {/* Name */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        Full Name *
                      </label>
                      <Input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="John Doe"
                        className="bg-black/50 border-gray-700 text-white"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="john@example.com"
                        className="bg-black/50 border-gray-700 text-white"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        <Phone className="w-4 h-4 inline mr-2" />
                        Phone Number *
                      </label>
                      <Input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="+1 (555) 000-0000"
                        className="bg-black/50 border-gray-700 text-white"
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Street Address *
                      </label>
                      <Input
                        type="text"
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        placeholder="123 Main Street"
                        className="bg-black/50 border-gray-700 text-white"
                      />
                    </div>

                    {/* City & ZIP */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">City *</label>
                        <Input
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                          placeholder="New York"
                          className="bg-black/50 border-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">ZIP Code *</label>
                        <Input
                          type="text"
                          required
                          value={formData.zipCode}
                          onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                          placeholder="10001"
                          className="bg-black/50 border-gray-700 text-white"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-[#C6D870] text-black hover:bg-[#B5C760] font-semibold"
                    >
                      Continue to Payment
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card className="glass-neo p-6 border-gray-800">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-[#C6D870]" />
                    Payment Method
                  </h2>

                  <div className="space-y-6">
                    {/* Wallet Payment */}
                    <div
                      onClick={() => setFormData({...formData, paymentMethod: 'wallet'})}
                      className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.paymentMethod === 'wallet'
                          ? 'border-[#C6D870] bg-[#C6D870]/5'
                          : 'border-gray-700 glass'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[#C6D870]/10 flex items-center justify-center">
                          <Wallet className="w-6 h-6 text-[#C6D870]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1">Crypto Wallet</h3>
                          <p className="text-sm text-gray-400 mb-3">Pay with your connected wallet using DATN tokens</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="lime">Recommended</Badge>
                            <Badge variant="outline" className="border-green-500 text-green-500">
                              <ShieldCheck className="w-3 h-3 mr-1" />
                              Secure
                            </Badge>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          formData.paymentMethod === 'wallet'
                            ? 'border-[#C6D870] bg-[#C6D870]'
                            : 'border-gray-600'
                        }`}>
                          {formData.paymentMethod === 'wallet' && (
                            <div className="w-2.5 h-2.5 rounded-full bg-black" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Security Note */}
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <Lock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-400 font-medium mb-1">Secure Transaction</p>
                        <p className="text-xs text-gray-400">
                          Your payment is secured by blockchain technology. All transactions are encrypted and verified.
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => setStep(1)}
                        className="flex-1 border-gray-700 text-white hover:bg-white/5"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        size="lg"
                        className="flex-1 bg-[#C6D870] text-black hover:bg-[#B5C760] font-semibold"
                      >
                        Complete Purchase
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </form>
          </div>

          {/* Right - Order Summary */}
          <div>
            <Card className="glass-neo p-6 border-gray-800 sticky top-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-[#C6D870]" />
                Order Summary
              </h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-800">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg bg-gray-700 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium text-sm mb-1 line-clamp-2">{item.title}</h3>
                      <p className="text-xs text-gray-400 font-mono mb-2">{item.seller}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Qty: {item.quantity}</span>
                        <span className="text-[#C6D870] font-semibold">{item.price} DATN</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-800">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white font-medium">{subtotal} DATN</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Platform Fee (2%)</span>
                  <span className="text-white font-medium">{platformFee} DATN</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-lg font-semibold text-white">Total</span>
                <span className="text-2xl font-bold text-[#C6D870]">{total} DATN</span>
              </div>

              {/* Security Badge */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <ShieldCheck className="w-5 h-5 text-green-400" />
                <p className="text-xs text-green-400">Secure Escrow Protection</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
