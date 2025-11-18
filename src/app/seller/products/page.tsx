"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useCreateProduct, useUpdateProduct, useDeleteProduct, useSellerProducts, useProduct } from '@/lib/hooks';
import { useAuth } from '@/lib/providers/AuthProvider';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Loader2, Upload, X, AlertCircle } from 'lucide-react';

export default function SellerProductsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { account } = useWallet();
  
  const { data: productAddresses = [], isLoading: productsLoading } = useSellerProducts(account?.address?.toString());
  
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  const [form, setForm] = useState({
    title: '',
    price: '',
    description: '',
    quantity: '1',
    category: '',
    imageUrls: [] as string[]
  });
  const [editingProductAddress, setEditingProductAddress] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteConfirmAddress, setDeleteConfirmAddress] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const addImageUrl = () => {
    if (imageUrlInput.trim()) {
      setForm(prev => ({ ...prev, imageUrls: [...prev.imageUrls, imageUrlInput.trim()] }));
      setImageUrlInput('');
    }
  };

  const removeImageUrl = (index: number) => {
    setForm(prev => ({ ...prev, imageUrls: prev.imageUrls.filter((_, i) => i !== index) }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;
    const price = parseFloat(form.price);
    const quantity = parseInt(form.quantity);
    if (!form.title.trim() || isNaN(price) || price <= 0 || isNaN(quantity) || quantity < 1) return;
    
    setSubmitting(true);
    try {
      await createProductMutation.mutateAsync({
        title: form.title.trim(),
        description: form.description.trim(),
        price: Math.floor(price * 100000000),
        quantity: quantity,
        imageUrls: form.imageUrls.filter(url => url.trim()),
        category: form.category.trim() || 'General',
      });
      setForm({ title: '', price: '', description: '', quantity: '1', category: '', imageUrls: [] });
    } finally {
      setSubmitting(false);
    }
  };

  const stats = useMemo(() => ({ totalProducts: productAddresses.length, totalQuantity: 0, totalValue: 0 }), [productAddresses]);

  if (authLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#C6D870] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Manage Products</h1>
          <p className="text-gray-400">Create and manage your product listings on the blockchain</p>
        </div>
        
        <div className="mb-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-400">
              <strong>Note:</strong> This blockchain version uses image URLs. Upload your images to IPFS/Arweave first.
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 p-6 rounded-lg border border-gray-700 bg-[#0b0b0b]/60">
            <h2 className="text-lg font-semibold text-white mb-4">Create Product</h2>
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <div>
                <input 
                  value={form.title} 
                  onChange={e => setForm({ ...form, title: e.target.value })} 
                  placeholder="Product title" 
                  required 
                  className="w-full px-4 py-3 rounded-xl bg-white/4 text-white border border-white/6" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <input 
                  value={form.price} 
                  onChange={e => setForm({ ...form, price: e.target.value })} 
                  placeholder="Price (APT)" 
                  type="number" 
                  step="0.0001" 
                  required 
                  className="w-full px-4 py-3 rounded-xl bg-white/4 text-white border border-white/6" 
                />
                <input 
                  value={form.quantity} 
                  onChange={e => setForm({ ...form, quantity: e.target.value })} 
                  placeholder="Qty" 
                  type="number" 
                  min="1" 
                  required 
                  className="w-full px-4 py-3 rounded-xl bg-white/4 text-white border border-white/6" 
                />
              </div>
              
              <input 
                value={form.category} 
                onChange={e => setForm({ ...form, category: e.target.value })} 
                placeholder="Category" 
                className="w-full px-4 py-3 rounded-xl bg-white/4 text-white border border-white/6" 
              />
              
              <textarea 
                value={form.description} 
                onChange={e => setForm({ ...form, description: e.target.value })} 
                placeholder="Description" 
                className="w-full px-4 py-3 rounded-xl bg-white/4 text-white border border-white/6 h-24 resize-none" 
              />
              
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input 
                    value={imageUrlInput} 
                    onChange={e => setImageUrlInput(e.target.value)} 
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addImageUrl())} 
                    placeholder="Image URL" 
                    className="flex-1 px-4 py-2 rounded-xl bg-white/4 text-white border border-white/6 text-sm" 
                  />
                  <button 
                    type="button" 
                    onClick={addImageUrl} 
                    className="px-4 py-2 bg-[#C6D870] text-black rounded-lg text-sm font-semibold"
                  >
                    Add
                  </button>
                </div>
                {form.imageUrls.map((url, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/6">
                    <span className="flex-1 text-xs text-gray-300 truncate">{url}</span>
                    <button 
                      type="button" 
                      onClick={() => removeImageUrl(idx)} 
                      className="text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-white/3 border border-white/6 text-center">
                  <div className="text-xs text-gray-300">Items</div>
                  <div className="text-lg font-bold text-white">{stats.totalProducts}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/3 border border-white/6 text-center">
                  <div className="text-xs text-gray-300">Qty</div>
                  <div className="text-lg font-bold text-white">{stats.totalQuantity}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/3 border border-white/6 text-center">
                  <div className="text-xs text-gray-300">Value</div>
                  <div className="text-lg font-bold text-white">{stats.totalValue} APT</div>
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={submitting || createProductMutation.isPending} 
                className="px-6 py-3 rounded-2xl bg-linear-to-r from-[#C6D870] to-[#B5C760] text-black font-semibold disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Product'}
              </button>
            </form>
          </div>
          
          <div className="lg:col-span-2 p-6 rounded-lg border border-gray-700 bg-[#0b0b0b]/60">
            <h2 className="text-lg font-semibold text-white mb-4">Your Products</h2>
            {productsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#C6D870] animate-spin" />
              </div>
            ) : productAddresses.length === 0 ? (
              <div className="text-center py-12">
                <Upload className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No products yet!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {productAddresses.map(address => (
                  <ProductCard 
                    key={address} 
                    productAddress={address} 
                    onEdit={() => {
                      setEditingProductAddress(address);
                      setShowEditModal(true);
                    }} 
                    onDelete={() => setDeleteConfirmAddress(address)} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        
        {showEditModal && editingProductAddress && (
          <EditProductModal 
            productAddress={editingProductAddress} 
            onClose={() => {
              setShowEditModal(false);
              setEditingProductAddress(null);
            }} 
            updateMutation={updateProductMutation} 
          />
        )}
        
        {deleteConfirmAddress && (
          <DeleteConfirmDialog 
            productAddress={deleteConfirmAddress} 
            onClose={() => setDeleteConfirmAddress(null)} 
            deleteMutation={deleteProductMutation} 
          />
        )}
      </div>
    </div>
  );
}

function ProductCard({ 
  productAddress, 
  onEdit, 
  onDelete 
}: { 
  productAddress: string; 
  onEdit: () => void; 
  onDelete: () => void; 
}) {
  const { data: product, isLoading } = useProduct(productAddress);
  
  if (isLoading) {
    return (
      <div className="p-4 rounded-xl border border-gray-800 bg-[#0b0b0b] flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#C6D870] animate-spin" />
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="p-4 rounded-xl border border-gray-800 bg-[#0b0b0b]">
        <p className="text-gray-400 text-sm">Product #{productAddress.slice(0, 8)}...</p>
      </div>
    );
  }
  
  return (
    <div className="p-4 rounded-xl border border-gray-800 bg-linear-to-br from-[#0b0b0b] via-[#0b0b0b] to-[#1a1a1a] flex flex-col backdrop-blur-sm hover:border-[#C6D870]/30 transition-all">
      <div className="h-48 w-full bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center relative">
        {product.imageUrls && product.imageUrls.length > 0 ? (
          <img 
            src={product.imageUrls[0]} 
            alt={product.title} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="text-gray-600">No image</div>
        )}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${product.isAvailable ? 'bg-green-500/80' : 'bg-red-500/80'} text-white`}>
          {product.isAvailable ? 'Available' : 'Unavailable'}
        </div>
      </div>
      
      <div className="mt-4 flex-1 space-y-2">
        <div className="text-white font-semibold text-lg">{product.title}</div>
        <div className="text-xs text-gray-400 uppercase">{product.category}</div>
        {product.description && (
          <p className="text-sm text-gray-300 line-clamp-2">{product.description}</p>
        )}
        <div className="flex items-center justify-between pt-2">
          <div className="text-lg text-[#C6D870] font-bold">
            {(product.price / 100000000).toFixed(4)} APT
          </div>
          <div className="text-sm text-gray-400">
            Qty: <span className="text-white font-semibold">{product.quantity}</span>
          </div>
        </div>
        <div className="text-xs text-gray-500">Sold: {product.soldQuantity} units</div>
      </div>
      
      <div className="mt-4 flex gap-2">
        <button 
          onClick={onEdit} 
          className="flex-1 px-3 py-2 text-sm border border-[#C6D870] text-[#C6D870] rounded-lg hover:bg-[#C6D870]/10"
        >
          Edit
        </button>
        <button 
          onClick={onDelete} 
          className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function EditProductModal({ 
  productAddress, 
  onClose, 
  updateMutation 
}: { 
  productAddress: string; 
  onClose: () => void; 
  updateMutation: any; 
}) {
  const { data: product } = useProduct(productAddress);
  const [editForm, setEditForm] = useState({
    title: '',
    price: '',
    description: '',
    category: '',
    imageUrls: [] as string[]
  });
  
  useEffect(() => {
    if (product) {
      setEditForm({
        title: product.title,
        price: (product.price / 100000000).toString(),
        description: product.description,
        category: product.category,
        imageUrls: product.imageUrls
      });
    }
  }, [product]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(editForm.price);
    if (isNaN(price) || price <= 0) return;
    
    try {
      await updateMutation.mutateAsync({
        productAddress,
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        price: Math.floor(price * 100000000),
        imageUrls: editForm.imageUrls,
        category: editForm.category.trim()
      });
      onClose();
    } catch (error) {
      console.error(error);
    }
  };
  
  if (!product) return null;
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0b0b0b] border border-gray-800 rounded-2xl p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">Edit Product</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
            
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            value={editForm.title} 
            onChange={e => setEditForm({ ...editForm, title: e.target.value })} 
            required 
            className="w-full px-4 py-3 rounded-xl bg-white/4 text-white border border-white/6" 
            placeholder="Title" 
          />
          
          <div className="grid grid-cols-2 gap-4">
            <input 
              type="number" 
              step="0.0001" 
              value={editForm.price} 
              onChange={e => setEditForm({ ...editForm, price: e.target.value })} 
              required 
              className="w-full px-4 py-3 rounded-xl bg-white/4 text-white border border-white/6" 
              placeholder="Price" 
            />
            <input 
              value={editForm.category} 
              onChange={e => setEditForm({ ...editForm, category: e.target.value })} 
              className="w-full px-4 py-3 rounded-xl bg-white/4 text-white border border-white/6" 
              placeholder="Category" 
            />
          </div>
          
          <textarea 
            value={editForm.description} 
            onChange={e => setEditForm({ ...editForm, description: e.target.value })} 
            className="w-full px-4 py-3 rounded-xl bg-white/4 text-white border border-white/6 h-28 resize-none" 
            placeholder="Description" 
          />
          
          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-6 py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={updateMutation.isPending} 
              className="flex-1 px-6 py-3 rounded-xl bg-linear-to-r from-[#C6D870] to-[#B5C760] text-black font-semibold disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmDialog({ 
  productAddress, 
  onClose, 
  deleteMutation 
}: { 
  productAddress: string; 
  onClose: () => void; 
  deleteMutation: any; 
}) {
  const { data: product } = useProduct(productAddress);
  
  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(productAddress);
      onClose();
    } catch (error) {
      console.error(error);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0b0b0b] border border-gray-800 rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-white mb-4">Confirm Delete</h3>
        <p className="text-gray-300 mb-6">
          Delete <span className="text-[#C6D870] font-semibold">{product?.title || `#${productAddress.slice(0, 8)}...`}</span>?
        </p>
        <div className="flex gap-3">
          <button 
            onClick={onClose} 
            className="flex-1 px-6 py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </button>
          <button 
            onClick={handleDelete} 
            disabled={deleteMutation.isPending} 
            className="flex-1 px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50"
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
