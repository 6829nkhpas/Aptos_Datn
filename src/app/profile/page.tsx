'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { User as UserIcon, Mail, Wallet, ShoppingBag, Package, DollarSign, Edit3, Save, X, Activity, MapPin, Clock, Loader2, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/providers/AuthProvider';
import { useUserProfile, useUpdateProfile, useBuyerOrders, useSellerProducts, useOrder, useProduct } from '@/lib/hooks';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { account } = useWallet();
  
  // Fetch user profile from blockchain
  const { data: profileData, isLoading: profileLoading } = useUserProfile(account?.address?.toString());
  
  // Fetch orders and products based on role
  const { data: orderAddresses = [], isLoading: ordersLoading } = useBuyerOrders(account?.address?.toString());
  const { data: productAddresses = [], isLoading: productsLoading } = useSellerProducts(account?.address?.toString());
  
  const updateProfileMutation = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', country: '' });

  // Map blockchain profile data to UI format
  const user = React.useMemo(() => {
    if (!profileData || !account) return null;
    
    const roleMap: Record<number, string> = {
      1: 'BUYER',
      2: 'SELLER',
    };

    return {
      name: profileData.name,
      email: profileData.email,
      country: profileData.country,
      wallet: account.address?.toString() || '',
      role: roleMap[profileData.role] || 'BUYER',
      createdAt: new Date(profileData.createdAt).toISOString(),
      isActive: profileData.isActive,
      bio: profileData.bio,
      physicalAddress: profileData.physicalAddress,
    };
  }, [profileData, account]);

  // Update form data when user profile loads
  React.useEffect(() => {
    if (user) {
      setFormData({ name: user.name, country: user.country });
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('Please login to view your profile');
      router.push('/');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.country.trim()) {
      toast.error('All fields are required');
      return;
    }
    if (!account?.address) {
      toast.error('Wallet not connected');
      return;
    }
    
    try {
      await updateProfileMutation.mutateAsync({
        profileAddress: account.address.toString(),
        name: formData.name,
        country: formData.country,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Update profile error:', error);
    }
  };

  if (authLoading || profileLoading || !user) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='w-12 h-12 text-[#C6D870] animate-spin mx-auto mb-4' />
          <p className='text-gray-400'>Loading profile...</p>
        </div>
      </div>
    );
  }

  const formatWallet = (addr: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className='min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-3xl md:text-4xl font-bold text-white mb-2'>My Profile</h1>
          <p className='text-gray-400'>Manage your account and track your activity</p>
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-1 space-y-6'>
            <Card className='glass-neo p-6 border-gray-800'>
              <div className='relative'>
                <div className='relative w-32 h-32 mx-auto mb-4'>
                  <div className='w-full h-full rounded-full bg-gradient-to-br from-[#C6D870] to-[#A5B560] flex items-center justify-center text-4xl font-bold text-black'>
                    {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </div>
                </div>
                <button onClick={() => setIsEditing(!isEditing)} disabled={updateProfileMutation.isPending} className='absolute top-0 right-0 p-2 rounded-lg glass hover:bg-white/10 text-white transition-colors disabled:opacity-50'>
                  {isEditing ? <X className='w-5 h-5' /> : <Edit3 className='w-5 h-5' />}
                </button>
              </div>
              <div className='text-center mb-6'>
                <Badge className='bg-[#C6D870] text-black'>{user.role}</Badge>
              </div>
              <div className='space-y-4'>
                <div>
                  <label className='text-sm text-gray-400 mb-1 block'>Name</label>
                  {isEditing ? (
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className='bg-black/50 border-gray-700 text-white' placeholder='Enter your name' />
                  ) : (
                    <div className='flex items-center gap-2 text-white'><UserIcon className='w-4 h-4 text-[#C6D870]' /><span>{user.name}</span></div>
                  )}
                </div>
                <div>
                  <label className='text-sm text-gray-400 mb-1 block'>Email</label>
                  <div className='flex items-center gap-2 text-white'><Mail className='w-4 h-4 text-[#C6D870]' /><span className='text-sm'>{user.email}</span></div>
                </div>
                <div>
                  <label className='text-sm text-gray-400 mb-1 block'>Country</label>
                  {isEditing ? (
                    <Input value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className='bg-black/50 border-gray-700 text-white' placeholder='Enter your country' />
                  ) : (
                    <div className='flex items-center gap-2 text-white'><MapPin className='w-4 h-4 text-[#C6D870]' /><span>{user.country}</span></div>
                  )}
                </div>
                <div>
                  <label className='text-sm text-gray-400 mb-1 block'>Wallet Address</label>
                  <div className='flex items-center gap-2 text-white'><Wallet className='w-4 h-4 text-[#C6D870]' /><span className='text-sm font-mono'>{formatWallet(user.wallet)}</span></div>
                </div>
                {user.createdAt && (
                  <div>
                    <label className='text-sm text-gray-400 mb-1 block'>Member Since</label>
                    <div className='flex items-center gap-2 text-white'><Clock className='w-4 h-4 text-[#C6D870]' /><span className='text-sm'>{formatDate(user.createdAt)}</span></div>
                  </div>
                )}
                {isEditing && (
                  <div className='flex gap-2 pt-2'>
                    <Button onClick={handleSave} disabled={updateProfileMutation.isPending} className='flex-1 bg-[#C6D870] text-black hover:bg-[#B5C760]'>{updateProfileMutation.isPending ? <><Loader2 className='w-4 h-4 mr-2 animate-spin' />Saving...</> : <><Save className='w-4 h-4 mr-2' />Save</>}</Button>
                    <Button onClick={() => { setFormData({ name: user.name || '', country: user.country || '' }); setIsEditing(false); }} disabled={updateProfileMutation.isPending} variant='outline' className='flex-1'>Cancel</Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
          <div className='lg:col-span-2 space-y-6'>
            <div className='grid grid-cols-3 gap-4'>
              {(ordersLoading || productsLoading) ? (
                <div className='col-span-3 text-center py-8'><Loader2 className='w-8 h-8 text-[#C6D870] animate-spin mx-auto' /></div>
              ) : (
                [
                  { 
                    label: user.role === 'SELLER' ? 'Active Listings' : 'Total Orders', 
                    value: user.role === 'SELLER' ? productAddresses.length : orderAddresses.length, 
                    icon: user.role === 'SELLER' ? Package : ShoppingBag, 
                    color: 'text-blue-500', 
                    bg: 'bg-blue-500/10' 
                  },
                  { 
                    label: user.role === 'SELLER' ? 'Total Earned' : 'Total Spent', 
                    value: '0', // Would need to sum from orders/products
                    suffix: 'APT', 
                    icon: DollarSign, 
                    color: 'text-[#C6D870]', 
                    bg: 'bg-[#C6D870]/10' 
                  },
                  { 
                    label: 'Active', 
                    value: user.isActive ? 'Yes' : 'No', 
                    icon: Activity, 
                    color: 'text-green-500', 
                    bg: 'bg-green-500/10' 
                  },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={i} className='glass-neo p-4 border-gray-800 hover:border-[#C6D870]/30 transition-all'>
                      <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}><Icon className={`w-5 h-5 ${stat.color}`} /></div>
                      <p className='text-2xl font-bold text-white mb-1'>{stat.value}{stat.suffix && <span className='text-sm ml-1 text-gray-400'>{stat.suffix}</span>}</p>
                      <p className='text-xs text-gray-400'>{stat.label}</p>
                    </Card>
                  );
                })
              )}
            </div>
            <Card className='glass-neo p-6 border-gray-800'>
              <div className='flex items-center justify-between mb-6'>
                <h3 className='text-xl font-semibold text-white flex items-center gap-2'><ShoppingBag className='w-6 h-6 text-[#C6D870]' />Recent Orders</h3>
                <Link href='/order'><Button size='sm' variant='outline' className='border-[#C6D870] text-[#C6D870] hover:bg-[#C6D870] hover:text-black'>View All<ChevronRight className='w-4 h-4 ml-1' /></Button></Link>
              </div>
              {ordersLoading ? (
                <div className='text-center py-8'><Loader2 className='w-8 h-8 text-[#C6D870] animate-spin mx-auto mb-4' /><p className='text-gray-400'>Loading orders...</p></div>
              ) : orderAddresses && orderAddresses.length > 0 ? (
                <div className='space-y-4'>
                  {orderAddresses.slice(0, 5).map((orderAddress) => (
                    <Link key={orderAddress} href={`/order/${orderAddress}`}>
                      <div className='flex items-start gap-4 p-4 rounded-lg glass hover:bg-white/5 transition-colors cursor-pointer'>
                        <div className='w-16 h-16 rounded-lg bg-gray-700 shrink-0 overflow-hidden flex items-center justify-center'>
                          <Package className='w-8 h-8 text-gray-500' />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-white font-medium truncate'>Order #{orderAddress.slice(0, 8)}...</p>
                          <p className='text-sm text-gray-400 mt-1'>View details</p>
                          <div className='flex items-center justify-between mt-2'>
                            <span className='text-[#C6D870] font-semibold text-sm'>Click to view</span>
                          </div>
                        </div>
                        <Badge variant='default' className='shrink-0'>View</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className='text-center py-8'><ShoppingBag className='w-12 h-12 text-gray-600 mx-auto mb-4' /><p className='text-gray-400'>No orders yet</p><Link href='/product'><Button size='sm' className='mt-4 bg-[#C6D870] text-black hover:bg-[#B5C760]'>Browse Products</Button></Link></div>
              )}
            </Card>
            {user.role === 'SELLER' && (
              <Card className='glass-neo p-6 border-gray-800'>
                <div className='flex items-center justify-between mb-6'>
                  <h3 className='text-xl font-semibold text-white flex items-center gap-2'><Package className='w-6 h-6 text-[#C6D870]' />Active Listings</h3>
                  <Link href='/product'><Button size='sm' variant='outline' className='border-[#C6D870] text-[#C6D870] hover:bg-[#C6D870] hover:text-black'>View All<ChevronRight className='w-4 h-4 ml-1' /></Button></Link>
                </div>
                {productsLoading ? (
                  <div className='text-center py-8'><Loader2 className='w-8 h-8 text-[#C6D870] animate-spin mx-auto mb-4' /><p className='text-gray-400'>Loading products...</p></div>
                ) : productAddresses && productAddresses.length > 0 ? (
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {productAddresses.slice(0, 4).map((productAddress) => (
                      <Link key={productAddress} href={`/product/${productAddress}`}>
                        <div className='p-4 rounded-lg glass hover:bg-white/5 transition-colors cursor-pointer'>
                          <div className='flex gap-4'>
                            <div className='w-20 h-20 rounded-lg bg-gray-700 shrink-0 overflow-hidden flex items-center justify-center'>
                              <Package className='w-8 h-8 text-gray-500' />
                            </div>
                            <div className='flex-1 min-w-0'>
                              <h4 className='text-white font-medium mb-1 truncate'>Product #{productAddress.slice(0, 8)}...</h4>
                              <p className='text-sm text-gray-400 mb-2'>View details</p>
                              <div className='flex items-center justify-between'>
                                <span className='text-[#C6D870] font-semibold text-sm'>Click to view</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-8'><Package className='w-12 h-12 text-gray-600 mx-auto mb-4' /><p className='text-gray-400'>No products listed yet</p><Link href='/seller/products'><Button size='sm' className='mt-4 bg-[#C6D870] text-black hover:bg-[#B5C760]'>Create Listing</Button></Link></div>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
