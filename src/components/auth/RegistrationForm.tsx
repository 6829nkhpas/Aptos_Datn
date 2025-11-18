/**
 * @fileoverview User Registration Form
 * @description Form component for new user registration using smart contract
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRegisterProfile } from '@/lib/hooks/useProfileContract';
import { USER_ROLES } from '@/constants';
import { Globe, Mail, Store, User, UserCircle, FileText } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface RegistrationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RegistrationForm({
  onSuccess,
  onCancel,
}: RegistrationFormProps) {
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    country: string;
    address: string;
    bio: string;
    role: 1 | 2;
  }>({
    name: '',
    email: '',
    country: '',
    address: '',
    bio: '',
    role: USER_ROLES.BUYER,
  });

  // Use blockchain contract hook
  const registerMutation = useRegisterProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await registerMutation.mutateAsync({
        name: formData.name,
        country: formData.country,
        role: formData.role,
        email: formData.email,
        address: formData.address,
        bio: formData.bio,
      });
      onSuccess?.();
    } catch (error: any) {
      console.error('Registration error:', error);

      // Check if error is due to existing profile
      if (error?.message?.includes('User profile already exists') ||
        error?.message?.includes('PROFILE_ALREADY_EXISTS') ||
        error?.message?.includes('already exists')) {
        // Profile exists, treat as successful login
        console.log('Profile already exists, proceeding to app...');
        toast.success('Profile already exists! Logging you in...');
        onSuccess?.();
      } else {
        // Show error toast for other errors
        toast.error(error?.message || 'Registration failed. Please try again.');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const isValid =
    formData.name.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.country.trim() !== '' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <Card className="bg-black border border-[#C6D870] w-full max-w-md p-8 mx-4 h-[80vh] overflow-y-auto scrollbar-hide">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="neo-flat rounded-full p-4 bg-black">
              <UserCircle className="w-12 h-12 text-[#C6D870]" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Create Your Profile</h2>
          <p className="text-gray-400 text-sm">
            Register on the blockchain to start using DATN Marketplace
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm text-gray-300 font-medium flex items-center gap-2">
              <User className="w-4 h-4 text-[#C6D870]" />
              Full Name *
            </label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="glass-neo border-white/10 focus:border-[#C6D870] bg-black/40 text-white placeholder:text-gray-500"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm text-gray-300 font-medium flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#C6D870]" />
              Email Address *
            </label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              className="glass-neo border-white/10 focus:border-[#C6D870] bg-black/40 text-white placeholder:text-gray-500"
              required
            />
          </div>

          {/* Country */}
          <div className="space-y-2">
            <label className="text-sm text-gray-300 font-medium flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#C6D870]" />
              Country *
            </label>
            <Input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Enter your country"
              className="glass-neo border-white/10 focus:border-[#C6D870] bg-black/40 text-white placeholder:text-gray-500"
              required
            />
          </div>

          {/* Physical Address */}
          <div className="space-y-2">
            <label className="text-sm text-gray-300 font-medium flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#C6D870]" />
              Physical Address *
            </label>
            <Input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your address"
              className="glass-neo border-white/10 focus:border-[#C6D870] bg-black/40 text-white placeholder:text-gray-500"
              required
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="text-sm text-gray-300 font-medium flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#C6D870]" />
              Bio (Optional)
            </label>
            <Textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              className="glass-neo border-white/10 focus:border-[#C6D870] bg-black/40 text-white placeholder:text-gray-500 min-h-[80px]"
              rows={3}
            />
          </div>

          {/* Role Selection */}
          <div className="space-y-3">
            <label className="text-sm text-gray-300 font-medium">Choose Your Role *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, role: USER_ROLES.BUYER }))}
                className={`
                  neo-flat p-4 rounded-lg transition-all duration-200
                  ${formData.role === USER_ROLES.BUYER
                    ? 'bg-[#C6D870]/20 border-2 border-[#C6D870]'
                    : 'bg-black/40 border-2 border-white/10 hover:border-white/20'
                  }
                `}
              >
                <UserCircle
                  className={`w-8 h-8 mx-auto mb-2 ${formData.role === USER_ROLES.BUYER ? 'text-[#C6D870]' : 'text-gray-400'
                    }`}
                />
                <p
                  className={`text-sm font-medium ${formData.role === USER_ROLES.BUYER ? 'text-[#C6D870]' : 'text-gray-300'
                    }`}
                >
                  Buyer
                </p>
                <p className="text-xs text-gray-500 mt-1">Browse & purchase products</p>
              </button>

              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, role: USER_ROLES.SELLER }))}
                className={`
                  neo-flat p-4 rounded-lg transition-all duration-200
                  ${formData.role === USER_ROLES.SELLER
                    ? 'bg-[#C6D870]/20 border-2 border-[#C6D870]'
                    : 'bg-black/40 border-2 border-white/10 hover:border-white/20'
                  }
                `}
              >
                <Store
                  className={`w-8 h-8 mx-auto mb-2 ${formData.role === USER_ROLES.SELLER ? 'text-[#C6D870]' : 'text-gray-400'
                    }`}
                />
                <p
                  className={`text-sm font-medium ${formData.role === USER_ROLES.SELLER ? 'text-[#C6D870]' : 'text-gray-300'
                    }`}
                >
                  Seller
                </p>
                <p className="text-xs text-gray-500 mt-1">List & sell products</p>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                onClick={onCancel}
                variant="outline"
                className="flex-1 neo-flat border-white/10 hover:border-white/20 text-white"
                disabled={registerMutation.isPending}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={!isValid || registerMutation.isPending}
              className="flex-1 neo-flat bg-[#C6D870] hover:bg-[#454d1d] text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {registerMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  Registering on Blockchain...
                </span>
              ) : (
                'Register on Blockchain'
              )}
            </Button>
          </div>
        </form>

        {/* Error Message */}
        {registerMutation.isError && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400 text-center">
              {registerMutation.error.message || 'Registration failed. Please try again.'}
            </p>
            {registerMutation.error.message?.includes('network configuration') && (
              <div className="mt-3 text-xs text-gray-400 space-y-1">
                <p className="font-semibold">Troubleshooting steps:</p>
                <p>1. Open Petra Wallet extension</p>
                <p>2. Click Settings → Network</p>
                <p>3. Switch to Devnet or Testnet</p>
                <p>4. Try registering again</p>
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-xs text-gray-500 text-center">
            Your profile will be stored on the Aptos blockchain. This transaction may require a small gas fee.
          </p>
        </div>
      </Card>
    </div>
  );
}
