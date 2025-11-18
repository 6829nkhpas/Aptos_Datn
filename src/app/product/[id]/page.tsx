'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProduct } from '@/lib/hooks';
import {
  Loader2,
  Package,
  ShoppingCart,
  Heart,
  Share2,
  Clock,
  Shield,
  Truck,
  User,
  MessageCircle,
  AlertCircle,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import Image from 'next/image';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch product details from blockchain
  const { data: productData, isLoading, error } = useProduct(id);

  // Map blockchain product data to UI format
  const product = React.useMemo(() => {
    if (!productData) return null;
    return {
      id: productData.productAddress,
      name: productData.title,
      description: productData.description,
      price: productData.price / 100000000, // Convert octas to APT (number)
      images: productData.imageUrls,
      category: productData.category,
      quantity: productData.quantity,
      soldQuantity: productData.soldQuantity,
      isAvailable: productData.isAvailable,
      seller: productData.seller,
      createdAt: new Date(productData.createdAt).toISOString(),
      updatedAt: new Date(productData.updatedAt).toISOString(),
      user: {
        name: 'Seller', // Would need to fetch from profile contract
        wallet: productData.seller,
        role: 'Seller'
      }
    };
  }, [productData]);

  // Related products - requires indexer to implement properly
  // For now, return empty array
  const relatedProducts: any[] = [];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days ago`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#C6D870] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading product...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Product not found</h3>
          <p className="text-gray-400 mb-6">The product you&apos;re looking for doesn&apos;t exist</p>
          <Link href="/product">
            <Button className="bg-[#C6D870] text-black hover:bg-[#B5C760]">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const features = [
    { icon: Shield, label: 'Verified Seller', color: 'text-green-500' },
    { icon: Truck, label: 'Fast Shipping', color: 'text-blue-500' },
    { icon: CheckCircle, label: 'Authentic Product', color: 'text-[#C6D870]' },
    { icon: AlertCircle, label: 'Secure Transaction', color: 'text-yellow-500' }
  ];

  return (
    <div className="min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-[#C6D870] cursor-pointer">Home</Link>
          <span>/</span>
          <Link href="/product" className="hover:text-[#C6D870] cursor-pointer">{product.category}</Link>
          <span>/</span>
          <span className="text-white">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <Card className="glass-neo p-4 border-gray-800">
              <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden mb-4 relative">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    <Package className="w-24 h-24 text-gray-600" />
                  </div>
                )}
                {/* Favorite Badge */}
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="absolute top-4 right-4 p-3 rounded-full glass hover:bg-white/10 transition-all z-10"
                >
                  <Heart className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                </button>
              </div>

              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.slice(0, 4).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden transition-all relative ${selectedImage === index
                        ? 'ring-2 ring-[#C6D870] ring-offset-2 ring-offset-black'
                        : 'opacity-50 hover:opacity-100'
                        }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Features */}
            <Card className="glass-neo p-4 border-gray-800">
              <div className="grid grid-cols-2 gap-4">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg glass">
                      <Icon className={`w-5 h-5 ${feature.color}`} />
                      <span className="text-sm text-white">{feature.label}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Right - Details */}
          <div className="space-y-6">
            <Card className="glass-neo p-6 border-gray-800">
              {/* Title & Status */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-2">{product.name}</h1>
                  <div className="flex items-center gap-3">
                    <Badge variant="lime" className="capitalize">{product.category}</Badge>
                    <Badge variant="outline" className={product.isAvailable ? "border-green-500 text-green-500" : "border-red-500 text-red-500"}>
                      {product.isAvailable ? 'Available' : 'Sold Out'}
                    </Badge>
                    {product.quantity && product.quantity < 5 && (
                      <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                        Only {product.quantity} left
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-700 text-white hover:bg-white/5"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-800">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Package className="w-4 h-4" />
                  <span>Stock: {product.quantity || 0}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(product.createdAt)}</span>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <p className="text-sm text-gray-400 mb-1">Price</p>
                <p className="text-4xl font-bold text-white">
                  {product.price.toFixed(2)} <span className="text-2xl text-[#C6D870]">DATN</span>
                </p>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                <p className="text-gray-300 leading-relaxed">{product.description}</p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  size="lg"
                  className="bg-[#C6D870] text-black hover:bg-[#B5C760] font-semibold"
                  onClick={() => {
                    // Navigate to checkout with product data
                    const checkoutData = {
                      productId: id,
                      productName: product.name,
                      price: product.price,
                      quantity: 1,
                      seller: product.seller,
                      image: product.images?.[0] || ''
                    };
                    // Store in sessionStorage for checkout page
                    sessionStorage.setItem('checkoutProduct', JSON.stringify(checkoutData));
                    router.push('/checkout');
                  }}
                  disabled={!product.isAvailable || product.quantity === 0}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {product.isAvailable && product.quantity > 0 ? 'Buy Now' : 'Out of Stock'}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#C6D870] text-[#C6D870] hover:bg-[#C6D870]/10"
                  onClick={() => {
                    // TODO: Implement chat/messaging feature
                    alert('Contact seller feature coming soon!');
                  }}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Contact Seller
                </Button>
              </div>
            </Card>

            {/* Seller Info */}
            {product.user && (
              <Card className="glass-neo p-6 border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4">Seller Information</h3>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-linear-to-br from-[#C6D870] to-[#A5B560] flex items-center justify-center text-2xl font-bold text-black shrink-0">
                    {product.user.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-1">{product.user.name}</h4>
                    <p className="text-sm text-gray-400 font-mono mb-3">{product.user.wallet.slice(0, 6)}...{product.user.wallet.slice(-4)}</p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <Badge variant="outline" className="border-[#C6D870]/30 text-[#C6D870]">
                          {product.user.role}
                        </Badge>
                        <p className="text-xs text-gray-400 mt-1">Role</p>
                      </div>
                      <div>
                        <p className="text-white font-semibold mb-1">{formatDate(product.createdAt)}</p>
                        <p className="text-xs text-gray-400">Listed</p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-gray-700 text-white hover:bg-white/5"
                    >
                      <User className="w-4 h-4 mr-2" />
                      View Profile
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-[#C6D870]" />
              Related Products
            </h2>
            <Button
              variant="outline"
              className="border-gray-700 text-white hover:bg-white/5"
            >
              View All
            </Button>
          </div>

          {relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relProduct) => (
                <Link key={relProduct.id} href={`/product/${relProduct.id}`}>
                  <Card className="glass-neo p-4 border-gray-800 hover:border-[#C6D870]/30 transition-all group cursor-pointer">
                    <div className="aspect-square bg-gray-700 rounded-lg mb-4 overflow-hidden relative">
                      {relProduct.images && relProduct.images.length > 0 ? (
                        <Image
                          src={relProduct.images[0]}
                          alt={relProduct.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-500 group-hover:scale-110 transition-transform">
                          <Package className="w-16 h-16" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-white font-semibold mb-2 group-hover:text-[#C6D870] transition-colors line-clamp-1">
                      {relProduct.name}
                    </h3>
                    <p className="text-[#C6D870] font-bold">{relProduct.price.toFixed(2)} DATN</p>
                    <p className="text-xs text-gray-400 mt-1">{relProduct.category}</p>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No related products found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
