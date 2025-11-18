'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAllProducts } from '@/lib/hooks/useProductContract';
import { Loader2 } from 'lucide-react';

// Type definition for product data from blockchain/indexer
type ProductListItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  isAvailable: boolean;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    role: string;
  };
};
import {
  Search,
  SlidersHorizontal,
  TrendingUp,
  Sparkles,
  Zap,
  Heart,
  Clock,
  Filter,
  X,
  ChevronDown,
  Package,
  Smartphone,
  Laptop,
  Watch,
  Headphones,
  Camera,
  Home as HomeIcon,
  Shirt,
  Dumbbell,
  Book,
  Gamepad2,
  Car
} from 'lucide-react';

const categories = [
  { name: 'All', icon: Package, color: 'text-gray-400', count: 234 },
  { name: 'Electronics', icon: Smartphone, color: 'text-blue-500', count: 45 },
  { name: 'Computers', icon: Laptop, color: 'text-purple-500', count: 32 },
  { name: 'Watches', icon: Watch, color: 'text-yellow-500', count: 28 },
  { name: 'Audio', icon: Headphones, color: 'text-green-500', count: 19 },
  { name: 'Cameras', icon: Camera, color: 'text-red-500', count: 15 },
  { name: 'Home', icon: HomeIcon, color: 'text-orange-500', count: 38 },
  { name: 'Fashion', icon: Shirt, color: 'text-pink-500', count: 42 },
  { name: 'Sports', icon: Dumbbell, color: 'text-cyan-500', count: 16 },
  { name: 'Books', icon: Book, color: 'text-amber-500', count: 23 },
  { name: 'Gaming', icon: Gamepad2, color: 'text-indigo-500', count: 21 },
  { name: 'Automotive', icon: Car, color: 'text-teal-500', count: 18 }
];

const priceRanges = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under 100 DATN', min: 0, max: 100 },
  { label: '100 - 500 DATN', min: 100, max: 500 },
  { label: '500 - 1000 DATN', min: 500, max: 1000 },
  { label: 'Over 1000 DATN', min: 1000, max: Infinity }
];

const conditions = ['All', 'New', 'Like New', 'Good', 'Fair'] as const;

const sortOptions = [
  { label: 'Most Recent', value: 'recent' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'Highest Rated', value: 'rating' }
];

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode] = useState<'grid'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [sortBy, setSortBy] = useState('recent');

  // Fetch products from blockchain
  const { data: blockchainProducts, isLoading, error } = useAllProducts();

  // Transform blockchain products to match the UI format
  const products: ProductListItem[] = useMemo(() => {
    if (!blockchainProducts) return [];
    // When indexer is implemented, blockchain products will already be in the right format
    return blockchainProducts;
  }, [blockchainProducts]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const priceRange = priceRanges[selectedPriceRange];
      const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
      const matchesCondition = selectedCondition === 'All'; // Condition filter can be removed or adjusted

      return matchesCategory && matchesSearch && matchesPrice && matchesCondition;
    });
  }, [products, selectedCategory, searchQuery, selectedPriceRange, selectedCondition]);



  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#C6D870] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading products...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Failed to load products</h3>
          <p className="text-gray-400 mb-6">Please try again later</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[#C6D870] text-black hover:bg-[#B5C760]"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // No products (indexer not implemented)
  if (!isLoading && products.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-4">
          <Package className="w-20 h-20 text-[#C6D870] mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-white mb-3">Product Listing Coming Soon!</h3>
          <p className="text-gray-400 mb-4">
            The product marketplace is being migrated to use blockchain data directly.
          </p>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-left mb-6">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-[#C6D870]" />
              Migration in Progress
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>✅ Wallet connection with Petra</li>
              <li>✅ User registration on blockchain</li>
              <li>✅ Smart contracts deployed (Profile, Product, Order, Escrow)</li>
              <li>⏳ Product indexer integration (in progress)</li>
              <li>⏳ Seller product listings (coming soon)</li>
            </ul>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            In the meantime, sellers can create products via the seller dashboard,
            and buyers will be able to browse them once the indexer is integrated.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/seller">
              <Button className="bg-[#C6D870] text-black hover:bg-[#B5C760]">
                Go to Seller Dashboard
              </Button>
            </Link>
            <Button
              variant="outline"
              className="border-gray-700 text-white hover:bg-white/5"
              onClick={() => window.location.href = '/'}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Explore Products</h1>
          <p className="text-gray-400">Discover amazing items from verified sellers</p>
        </div>

        {/* Search & View Controls */}
        <Card className="glass-neo p-4 border-gray-800/50 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products, categories, sellers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 bg-black/50 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="neo-inset px-4 py-2 bg-black/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#C6D870] cursor-pointer"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Filters Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="border-gray-700 text-white hover:bg-white/5"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Categories Grid */}
        <div className="mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.name;

              return (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`glass-neo p-4 border rounded-xl transition-all group ${isSelected
                    ? 'border-[#C6D870] bg-[#C6D870]/10'
                    : 'border-gray-800/50 hover:border-[#C6D870]/30'
                    }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`neo-flat w-12 h-12 rounded-xl flex items-center justify-center ${isSelected ? 'bg-[#C6D870]/20' : 'bg-white/5'
                      }`}>
                      <Icon className={`w-6 h-6 ${isSelected ? 'text-[#C6D870]' : category.color}`} />
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-medium ${isSelected ? 'text-[#C6D870]' : 'text-white group-hover:text-[#C6D870]'
                        }`}>
                        {category.name}
                      </p>
                      <p className="text-xs text-gray-500">{category.count}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="glass-neo p-5 border-gray-800/50 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Filter className="w-5 h-5 text-[#C6D870]" />
                Filters
              </h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Price Range */}
              <div>
                <label className="text-sm font-medium text-gray-400 mb-3 block">Price Range</label>
                <div className="space-y-2">
                  {priceRanges.map((range, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedPriceRange(index)}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all ${selectedPriceRange === index
                        ? 'bg-[#C6D870]/10 text-[#C6D870] border border-[#C6D870]/30'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-transparent'
                        }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div>
                <label className="text-sm font-medium text-gray-400 mb-3 block">Condition</label>
                <div className="space-y-2">
                  {conditions.map((condition) => (
                    <button
                      key={condition}
                      onClick={() => setSelectedCondition(condition)}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all ${selectedCondition === condition
                        ? 'bg-[#C6D870]/10 text-[#C6D870] border border-[#C6D870]/30'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-transparent'
                        }`}
                    >
                      {condition}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Filters */}
              <div>
                <label className="text-sm font-medium text-gray-400 mb-3 block">Quick Filters</label>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start border-gray-700 text-white hover:bg-white/5"
                  >
                    <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
                    Featured Items
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start border-gray-700 text-white hover:bg-white/5"
                  >
                    <TrendingUp className="w-4 h-4 mr-2 text-[#C6D870]" />
                    Trending Now
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start border-gray-700 text-white hover:bg-white/5"
                  >
                    <Zap className="w-4 h-4 mr-2 text-blue-500" />
                    New Arrivals
                  </Button>
                </div>
              </div>
            </div>

            {/* Reset Filters */}
            <div className="mt-6 pt-6 border-t border-gray-800/50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedPriceRange(0);
                  setSelectedCondition('All');
                  setSearchQuery('');
                }}
                className="border-gray-700 text-gray-400 hover:bg-white/5"
              >
                <X className="w-4 h-4 mr-2" />
                Reset All Filters
              </Button>
            </div>
          </Card>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-400">
            Showing <span className="text-white font-semibold">{filteredProducts.length}</span> products
            {selectedCategory !== 'All' && (
              <span> in <span className="text-[#C6D870]">{selectedCategory}</span></span>
            )}
          </p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card className="glass-neo p-12 border-gray-800/50 text-center">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Products Found</h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your filters or search query
            </p>
            <Button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedPriceRange(0);
                setSelectedCondition('All');
                setSearchQuery('');
              }}
              className="bg-[#C6D870] text-black hover:bg-[#B5C760]"
            >
              Clear Filters
            </Button>
          </Card>
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {filteredProducts.map((product) => {
              const formatDate = (dateStr: string) => {
                const date = new Date(dateStr);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - date.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return `${diffDays} days ago`;
              };

              return (
                <Link key={product.id} href={`/product/${product.id}`}>
                  <Card className={`glass-neo border-gray-800/50 hover:border-[#C6D870]/40 transition-all duration-300 group overflow-hidden h-full`}>
                    {/* Badges Overlay */}
                    {!product.isAvailable && (
                      <div className="absolute top-2 left-2 z-10">
                        <Badge className="bg-red-500/20 text-red-500 border-red-500/30">
                          Sold Out
                        </Badge>
                      </div>
                    )}
                    {product.isAvailable && product.quantity && product.quantity < 5 && (
                      <div className="absolute top-2 right-2 z-10">
                        <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                          <Zap className="w-3 h-3 mr-1" />
                          Low Stock
                        </Badge>
                      </div>
                    )}

                    {/* Image */}
                    <div className={`relative overflow-hidden h-48`}>
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-gray-800 to-gray-900 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                          <Package className="w-16 h-16 text-gray-600" />
                        </div>
                      )}

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="absolute bottom-3 right-3 neo-flat w-10 h-10 rounded-full flex items-center justify-center bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Heart className="w-5 h-5 text-white hover:text-red-500 hover:fill-red-500 transition-colors" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1">
                      {/* Title & Category */}
                      <div className="mb-2">
                        <h3 className="text-base font-semibold text-white group-hover:text-[#C6D870] transition-colors line-clamp-1 mb-2">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs border-[#C6D870]/30 text-[#C6D870]">
                            {product.category}
                          </Badge>
                          {product.isAvailable ? (
                            <Badge variant="outline" className="text-xs border-green-500 text-green-500">
                              Available
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs border-red-500 text-red-500">
                              Unavailable
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Description - Only in grid view */}
                      {viewMode === 'grid' && (
                        <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                          {product.description}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Package className="w-3.5 h-3.5" />
                          <span>Stock: {product.quantity || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatDate(product.createdAt)}</span>
                        </div>
                      </div>

                      {/* Seller */}
                      {product.user && (
                        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-800/50">
                          <div className="w-6 h-6 rounded-full bg-linear-to-br from-[#C6D870] to-[#A5B560] flex items-center justify-center text-xs font-bold text-black shrink-0">
                            {product.user.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-400 truncate">{product.user.name}</p>
                            <Badge variant="outline" className="text-xs border-[#C6D870]/30 text-[#C6D870] mt-1">
                              {product.user.role}
                            </Badge>
                          </div>
                        </div>
                      )}

                      {/* Price & Action */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">Price</p>
                          <p className="text-lg font-bold text-white">
                            {product.price.toFixed(2)} <span className="text-sm font-normal text-[#C6D870]">DATN</span>
                          </p>
                        </div>
                        <Button
                          size="sm"
                          className="bg-[#C6D870] text-black hover:bg-[#B5C760]"
                          disabled={!product.isAvailable}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          {product.isAvailable ? 'Buy Now' : 'Sold Out'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {/* Load More */}
        {filteredProducts.length > 0 && (
          <div className="mt-12 text-center">
            <Button
              variant="outline"
              size="lg"
              className="border-gray-700 text-white hover:bg-white/5"
            >
              <ChevronDown className="w-5 h-5 mr-2" />
              Load More Products
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
