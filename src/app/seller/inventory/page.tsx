"use client";

import React, { useMemo } from 'react';
import { useSellerProductsQuery } from '@/lib/hooks';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

export default function SellerInventoryPage() {
  const { account } = useWallet();
  const { data: myProducts = [], isLoading } = useSellerProductsQuery(account?.address?.toString());

  // Filter out null products
  const validProducts = myProducts.filter(p => p !== null);

  // Calculate inventory statistics
  const inventoryStats = useMemo(() => {
    const totalProducts = validProducts.length;
    const totalQuantity = validProducts.reduce((sum, p) => sum + (p?.quantity || 0), 0);
    const totalValue = validProducts.reduce((sum, p) => sum + ((p?.price || 0) * (p?.quantity || 0)), 0);
    const lowStockItems = validProducts.filter(p => (p?.quantity || 0) < 10 && (p?.quantity || 0) > 0).length;
    const outOfStockItems = validProducts.filter(p => (p?.quantity || 0) === 0).length;
    const availableItems = validProducts.filter(p => p?.isAvailable).length;

    return { totalProducts, totalQuantity, totalValue, lowStockItems, outOfStockItems, availableItems };
  }, [validProducts]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Inventory Management</h1>
          <p className="text-gray-400 text-sm mt-1">Track and manage your product stock</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-xl bg-linear-to-br from-[#C6D870]/10 to-[#C6D870]/5 border border-[#C6D870]/20 backdrop-blur-sm">
          <div className="text-xs text-gray-400 uppercase tracking-wide">Total Products</div>
          <div className="text-2xl font-bold text-white mt-1">{inventoryStats.totalProducts}</div>
        </div>
        <div className="p-4 rounded-xl bg-linear-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 backdrop-blur-sm">
          <div className="text-xs text-gray-400 uppercase tracking-wide">Total Units</div>
          <div className="text-2xl font-bold text-white mt-1">{inventoryStats.totalQuantity}</div>
        </div>
        <div className="p-4 rounded-xl bg-linear-to-br from-green-500/10 to-green-500/5 border border-green-500/20 backdrop-blur-sm">
          <div className="text-xs text-gray-400 uppercase tracking-wide">Total Value</div>
          <div className="text-2xl font-bold text-white mt-1">${inventoryStats.totalValue.toFixed(2)}</div>
        </div>
        <div className="p-4 rounded-xl bg-linear-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 backdrop-blur-sm">
          <div className="text-xs text-gray-400 uppercase tracking-wide">Available</div>
          <div className="text-2xl font-bold text-white mt-1">{inventoryStats.availableItems}</div>
        </div>
        <div className="p-4 rounded-xl bg-linear-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20 backdrop-blur-sm">
          <div className="text-xs text-gray-400 uppercase tracking-wide">Low Stock</div>
          <div className="text-2xl font-bold text-white mt-1">{inventoryStats.lowStockItems}</div>
        </div>
        <div className="p-4 rounded-xl bg-linear-to-br from-red-500/10 to-red-500/5 border border-red-500/20 backdrop-blur-sm">
          <div className="text-xs text-gray-400 uppercase tracking-wide">Out of Stock</div>
          <div className="text-2xl font-bold text-white mt-1">{inventoryStats.outOfStockItems}</div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="rounded-xl border border-gray-800 bg-[#0b0b0b]/80 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Loading inventory...</div>
          ) : validProducts.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No inventory items found.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-[#1a1a1a] border-b border-gray-800">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Product</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Price</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Quantity</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Value</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Stock Level</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {validProducts.map((product) => {
                  if (!product) return null;
                  const stockValue = (product.price || 0) * (product.quantity || 0);
                  const isLowStock = (product.quantity || 0) < 10 && (product.quantity || 0) > 0;
                  const isOutOfStock = (product.quantity || 0) === 0;

                  return (
                    <tr key={product.productAddress} className="hover:bg-white/5 transition-colors">
                      {/* Product Info */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-900 shrink-0">
                            {product.imageUrls && product.imageUrls.length > 0 ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={product.imageUrls[0]} alt={product.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No img</div>
                            )}
                          </div>
                          <div>
                            <div className="text-white font-medium text-sm">{product.title}</div>
                            <div className="text-xs text-gray-500 mt-0.5">ID: {product.productAddress?.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#C6D870]/10 text-[#C6D870] border border-[#C6D870]/20">
                          {product.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-4 text-right">
                        <span className="text-white font-semibold">${((product.price || 0) / 100000000).toFixed(2)} APT</span>
                      </td>

                      {/* Quantity */}
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center justify-center w-16 px-3 py-1 rounded-lg text-sm font-bold ${isOutOfStock ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          isLowStock ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            'bg-green-500/20 text-green-400 border border-green-500/30'
                          }`}>
                          {product.quantity || 0}
                        </span>
                      </td>

                      {/* Stock Value */}
                      <td className="px-4 py-4 text-right">
                        <span className="text-gray-300 font-medium">${stockValue.toFixed(2)}</span>
                      </td>

                      {/* Availability Status */}
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${product.isAvailable
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                          }`}>
                          {product.isAvailable ? '● Active' : '○ Inactive'}
                        </span>
                      </td>

                      {/* Stock Level Indicator */}
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${isOutOfStock ? 'bg-red-500' :
                                  isLowStock ? 'bg-yellow-500' :
                                    'bg-green-500'
                                  }`}
                                style={{ width: `${Math.min(((product.quantity || 0) / 50) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                          <span className={`text-xs font-medium ${isOutOfStock ? 'text-red-400' :
                            isLowStock ? 'text-yellow-400' :
                              'text-green-400'
                            }`}>
                            {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                          </span>
                        </div>
                      </td>

                      {/* Last Updated */}
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-400">
                          {new Date((product.updatedAt || 0) * 1000).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-gray-600 mt-0.5">
                          {new Date((product.updatedAt || 0) * 1000).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-6 text-xs text-gray-400 px-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>In Stock (≥10 units)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span>Low Stock (&lt;10 units)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>Out of Stock (0 units)</span>
        </div>
      </div>
    </div>
  );
}
