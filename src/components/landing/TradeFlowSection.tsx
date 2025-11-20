'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  Lock, 
  Package, 
  CheckCircle, 
  User, 
  Store, 
  ShieldCheck,
  ArrowRight,
  Database,
  Layers,
  Code,
  Wallet,
  FileText,
  TrendingUp
} from 'lucide-react';

type TabType = 'flow' | 'architecture' | 'modules';

export const TradeFlowSection = ({ className }: { className?: string }) => {
  const [activeTab, setActiveTab] = useState<TabType>('flow');

  return (
    <section className={cn('py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-black', className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-black dark:text-white mb-3">
            Complete Trade Flow & Architecture
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Understand how our decentralized marketplace ensures secure, transparent transactions using blockchain technology
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8 gap-2">
          <button
            onClick={() => setActiveTab('flow')}
            className={cn(
              "px-6 py-3 rounded-lg font-medium transition-all",
              activeTab === 'flow' 
                ? "bg-[#C6D870] text-black shadow-lg" 
                : "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
            )}
          >
            Escrow Flow
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={cn(
              "px-6 py-3 rounded-lg font-medium transition-all",
              activeTab === 'architecture' 
                ? "bg-[#C6D870] text-black shadow-lg" 
                : "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
            )}
          >
            Architecture
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={cn(
              "px-6 py-3 rounded-lg font-medium transition-all",
              activeTab === 'modules' 
                ? "bg-[#C6D870] text-black shadow-lg" 
                : "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
            )}
          >
            Smart Contracts
          </button>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          {activeTab === 'flow' && <EscrowFlowContent />}
          {activeTab === 'architecture' && <ArchitectureContent />}
          {activeTab === 'modules' && <ModulesContent />}
        </div>
      </div>
    </section>
  );
};

// Escrow Flow Content
const EscrowFlowContent = () => {
  const flowSteps = [
    {
      step: 1,
      icon: Lock,
      title: 'Initiate Trade & Lock Funds',
      buyer: 'Clicks "Buy Now"',
      system: 'Generates 6-digit delivery code (seller) & 4-digit receiving code (buyer)',
      action: "Buyer's funds withdrawn and locked in escrow",
      status: 'HOLDING',
      color: 'bg-blue-500',
    },
    {
      step: 2,
      icon: Package,
      title: 'Deliver Order',
      buyer: 'Waits for delivery',
      system: 'Validates delivery code',
      action: 'Seller ships product & enters 6-digit code',
      status: 'DELIVERED',
      color: 'bg-purple-500',
    },
    {
      step: 3,
      icon: CheckCircle,
      title: 'Confirm & Release Funds',
      buyer: 'Receives product & enters 4-digit code',
      system: 'Validates code & releases funds',
      action: 'Funds automatically transferred to seller',
      status: 'COMPLETED',
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Flow Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {flowSteps.map((step, index) => (
          <div key={step.step} className="relative">
            <Card className="p-6 h-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 hover:border-[#C6D870] transition-all">
              {/* Step Number */}
              <div className={cn("absolute -top-4 -right-4 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg", step.color)}>
                {step.step}
              </div>
              
              {/* Icon */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#C6D870] rounded-lg flex items-center justify-center">
                  <step.icon className="w-6 h-6 text-black" />
                </div>
                <h3 className="font-bold text-lg text-black dark:text-white">{step.title}</h3>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-600 dark:text-gray-400"><strong>Buyer:</strong> {step.buyer}</p>
                </div>
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-600 dark:text-gray-400"><strong>System:</strong> {step.system}</p>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-600 dark:text-gray-400"><strong>Action:</strong> {step.action}</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <span className={cn("px-3 py-1 rounded-full text-xs font-medium text-white", step.color)}>
                  Status: {step.status}
                </span>
              </div>
            </Card>

            {/* Arrow */}
            {index < flowSteps.length - 1 && (
              <div className="hidden md:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                <ArrowRight className="w-6 h-6 text-[#C6D870]" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Alternative Path */}
      <Card className="p-6 bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-900">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-lg text-black dark:text-white mb-2">Alternative: Cancel Order</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Before delivery (HOLDING status), buyer or seller can cancel. Funds automatically refunded to buyer. Status changes to CANCELLED.
            </p>
          </div>
        </div>
      </Card>

      {/* Journey Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-2 border-blue-200 dark:border-blue-900">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-xl text-black dark:text-white">Buyer Journey</h3>
          </div>
          <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>1. Connect Wallet & Register Profile (Buyer)</li>
            <li>2. Browse & Select Product</li>
            <li>3. Click "Buy Now" & Approve Transaction</li>
            <li>4. Funds Locked in Escrow</li>
            <li>5. Receive 4-digit Receiving Code</li>
            <li>6. Track Order Status</li>
            <li>7. Receive Product</li>
            <li>8. Enter Receiving Code</li>
            <li>9. Funds Released to Seller</li>
          </ol>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-2 border-green-200 dark:border-green-900">
          <div className="flex items-center gap-3 mb-4">
            <Store className="w-8 h-8 text-green-600 dark:text-green-400" />
            <h3 className="font-bold text-xl text-black dark:text-white">Seller Journey</h3>
          </div>
          <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>1. Connect Wallet & Register Profile (Seller)</li>
            <li>2. Create Product Listing</li>
            <li>3. Receive Order Notification</li>
            <li>4. Confirm & Process Order</li>
            <li>5. Receive 6-digit Delivery Code</li>
            <li>6. Ship Product to Buyer</li>
            <li>7. Enter Delivery Code</li>
            <li>8. Wait for Buyer Confirmation</li>
            <li>9. Receive Payment in Wallet</li>
          </ol>
        </Card>
      </div>
    </div>
  );
};

// Architecture Content
const ArchitectureContent = () => {
  return (
    <div className="space-y-8">
      {/* System Overview */}
      <Card className="p-8 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800">
        <h3 className="font-bold text-2xl text-black dark:text-white mb-6 text-center">System Architecture</h3>
        
        <div className="space-y-6">
          {/* Frontend Layer */}
          <div className="relative">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <Code className="w-6 h-6" />
                <h4 className="font-bold text-xl">Frontend Layer (Next.js)</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/10 p-4 rounded">
                  <p className="font-semibold mb-2">Buyer UI</p>
                  <p className="text-sm opacity-90">Browse, Purchase, Track Orders</p>
                </div>
                <div className="bg-white/10 p-4 rounded">
                  <p className="font-semibold mb-2">Seller UI</p>
                  <p className="text-sm opacity-90">Manage Products, Orders, Payments</p>
                </div>
                <div className="bg-white/10 p-4 rounded">
                  <p className="font-semibold mb-2">Admin UI</p>
                  <p className="text-sm opacity-90">Platform Management</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <ArrowRight className="w-6 h-6 text-[#C6D870] transform rotate-90 my-2" />
            </div>
          </div>

          {/* Wallet Adapter */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5" />
              <p className="font-semibold">Aptos Wallet Adapter (Petra, Martian, Pontem)</p>
            </div>
          </div>
          
          <div className="flex justify-center">
            <ArrowRight className="w-6 h-6 text-[#C6D870] transform rotate-90 my-2" />
          </div>

          {/* Blockchain Layer */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <Layers className="w-6 h-6" />
              <h4 className="font-bold text-xl">Aptos Blockchain Layer</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/10 p-4 rounded">
                <p className="font-semibold mb-2">UserProfile Module</p>
                <p className="text-sm opacity-90">Registration & Role Management</p>
              </div>
              <div className="bg-white/10 p-4 rounded">
                <p className="font-semibold mb-2">Product Module</p>
                <p className="text-sm opacity-90">Listings & Inventory</p>
              </div>
              <div className="bg-white/10 p-4 rounded">
                <p className="font-semibold mb-2">Order Module</p>
                <p className="text-sm opacity-90">Order Tracking & Status</p>
              </div>
              <div className="bg-white/10 p-4 rounded">
                <p className="font-semibold mb-2">Escrow Module</p>
                <p className="text-sm opacity-90">Secure Payment Processing</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="w-6 h-6 text-[#C6D870] transform rotate-90 my-2" />
          </div>

          {/* Indexer Layer */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6" />
              <h4 className="font-bold text-xl">Custom Indexer (Rust + PostgreSQL)</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 p-4 rounded">
                <p className="text-sm opacity-90">Process blockchain events in real-time</p>
              </div>
              <div className="bg-white/10 p-4 rounded">
                <p className="text-sm opacity-90">Store indexed data for fast queries</p>
              </div>
              <div className="bg-white/10 p-4 rounded">
                <p className="text-sm opacity-90">Provide REST API for frontend</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Events Flow */}
      <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-700">
        <h4 className="font-bold text-xl text-black dark:text-white mb-4">Blockchain Events Flow</h4>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-950 rounded">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">Smart Contract emits events → Indexer processes → Database stores → Frontend fetches</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-5">
            <div className="p-2 bg-white dark:bg-gray-950 rounded text-gray-600 dark:text-gray-400">• ProfileCreatedEvent</div>
            <div className="p-2 bg-white dark:bg-gray-950 rounded text-gray-600 dark:text-gray-400">• ProductCreatedEvent</div>
            <div className="p-2 bg-white dark:bg-gray-950 rounded text-gray-600 dark:text-gray-400">• FundsLockedEvent</div>
            <div className="p-2 bg-white dark:bg-gray-950 rounded text-gray-600 dark:text-gray-400">• FundsReleasedEvent</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Modules Content
const ModulesContent = () => {
  const modules = [
    {
      name: 'UserProfile Module',
      file: 'user_profile.move',
      color: 'bg-blue-500',
      icon: User,
      features: [
        'User registration with role selection (Buyer/Seller)',
        'Profile information management',
        'Profile activation/deactivation',
        'Role-based access control',
      ],
      functions: [
        'register_profile()',
        'update_profile()',
        'is_seller()',
        'profile_exists()',
      ],
      events: ['ProfileCreatedEvent', 'ProfileUpdatedEvent', 'ProfileDeactivatedEvent'],
    },
    {
      name: 'Product Module',
      file: 'product.move',
      color: 'bg-green-500',
      icon: Package,
      features: [
        'Product creation (seller-only)',
        'Inventory management (add/reduce stock)',
        'Product availability toggle',
        'Global product registry',
      ],
      functions: [
        'create_product()',
        'update_inventory()',
        'get_all_products()',
        'has_enough_stock()',
      ],
      events: ['ProductCreatedEvent', 'InventoryUpdatedEvent', 'ProductAvailabilityChangedEvent'],
    },
    {
      name: 'Order Module',
      file: 'order.move',
      color: 'bg-purple-500',
      icon: FileText,
      features: [
        'Order placement (buyer-only)',
        'Order status tracking',
        'Order cancellation with conditions',
        'Payment tracking',
      ],
      functions: [
        'place_order()',
        'update_order_status()',
        'cancel_order()',
        'get_buyer_orders()',
      ],
      events: ['OrderPlacedEvent', 'OrderStatusUpdatedEvent', 'PaymentConfirmedEvent'],
    },
    {
      name: 'Escrow Module',
      file: 'escrow.move',
      color: 'bg-orange-500',
      icon: ShieldCheck,
      features: [
        'Escrow-based payment protection',
        '6-digit delivery code generation',
        '4-digit receiving code generation',
        'Automatic fund release & refund',
      ],
      functions: [
        'initiate_trade_and_lock_funds()',
        'deliver_order()',
        'confirm_delivery_and_release_funds()',
        'cancel_escrow_order()',
      ],
      events: ['TradeInitiatedEvent', 'FundsLockedEvent', 'FundsReleasedEvent', 'EscrowCancelledEvent'],
    },
  ];

  return (
    <div className="space-y-6">
      {modules.map((module, index) => (
        <Card key={index} className="p-6 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 hover:border-[#C6D870] transition-all">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0", module.color)}>
              <module.icon className="w-6 h-6" />
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="mb-4">
                <h3 className="font-bold text-xl text-black dark:text-white mb-1">{module.name}</h3>
                <code className="text-sm text-gray-500 dark:text-gray-400">{module.file}</code>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Features */}
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Key Features</h4>
                  <ul className="space-y-1">
                    {module.features.map((feature, i) => (
                      <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <span className="text-[#C6D870] mt-1">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Functions */}
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Main Functions</h4>
                  <ul className="space-y-1">
                    {module.functions.map((func, i) => (
                      <li key={i} className="text-xs font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {func}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Events */}
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Events Emitted</h4>
                  <ul className="space-y-1">
                    {module.events.map((event, i) => (
                      <li key={i} className="text-xs text-gray-600 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded">
                        {event}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}

      {/* Module Interaction Flow */}
      <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-700">
        <h4 className="font-bold text-xl text-black dark:text-white mb-4 text-center">Module Interaction Flow</h4>
        <div className="flex flex-col items-center space-y-3 text-sm text-gray-700 dark:text-gray-300">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded w-full text-center">
            <strong>User Profile Module</strong> (Foundation)
          </div>
          <ArrowRight className="w-5 h-5 text-[#C6D870] transform rotate-90" />
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded w-full text-center">
            <strong>Product Module</strong> (Sellers create products)
          </div>
          <ArrowRight className="w-5 h-5 text-[#C6D870] transform rotate-90" />
          <div className="flex gap-4 w-full">
            <div className="flex-1 p-3 bg-purple-100 dark:bg-purple-900/30 rounded text-center">
              <strong>Order Module</strong> (Buyers place orders)
            </div>
            <div className="flex-1 p-3 bg-orange-100 dark:bg-orange-900/30 rounded text-center">
              <strong>Escrow Module</strong> (Secure payments)
            </div>
          </div>
          <p className="text-center text-xs mt-4">
            All modules verify user roles and permissions before executing transactions
          </p>
        </div>
      </Card>
    </div>
  );
};

export default TradeFlowSection;
