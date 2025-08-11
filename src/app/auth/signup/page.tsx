// Modern Sign up page with role selection

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Building2,
  Truck,
  Package,
  Users,
  CheckCircle,
  Wallet,
  Shield,
  Sparkles,
  ArrowRight,
  Mail,
  UserCheck
} from 'lucide-react';
import { UserRole } from '@/types';
import { useUserStore } from '@/stores/userStore';
import { connectWallet, getAvailableWallets } from '@/lib/lucid';

// Helper function to determine redirect path based on role
function getRedirectPathForRole(role: UserRole): string {
  switch (role) {
    case 'colony_owner':
      return '/colonies/create'; // Colony owners can create colonies
    case 'dispatch_operator':
    case 'reserve_operator':
      return '/dashboard'; // Operators go to dashboard to see deliveries
    case 'requester':
      return '/deliveries/create'; // Requesters can create delivery requests
    case 'recipient':
      return '/dashboard'; // Recipients see their incoming deliveries
    default:
      return '/dashboard'; // Default fallback
  }
}

const roleOptions = [
  {
    role: 'requester' as UserRole,
    title: 'Requester',
    description: 'Send packages and create delivery requests',
    icon: Package,
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    features: ['Create delivery requests', 'Track shipments', 'Manage orders']
  },
  {
    role: 'recipient' as UserRole,
    title: 'Recipient',
    description: 'Receive packages and track deliveries',
    icon: User,
    color: 'from-olive-500 to-emerald-600',
    bgColor: 'bg-olive-50',
    borderColor: 'border-olive-200',
    textColor: 'text-olive-700',
    features: ['Receive packages', 'Track deliveries', 'Confirm receipt']
  },
  {
    role: 'dispatch_operator' as UserRole,
    title: 'Dispatch Operator',
    description: 'Handle deliveries and manage operations',
    icon: Truck,
    color: 'from-teal-500 to-emerald-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    textColor: 'text-teal-700',
    features: ['Manage deliveries', 'Route optimization', 'Fleet operations']
  },
  {
    role: 'reserve_operator' as UserRole,
    title: 'Reserve Operator',
    description: 'Backup operations and high-priority deliveries',
    icon: Users,
    color: 'from-emerald-600 to-olive-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    features: ['Backup operations', 'Priority deliveries', 'Emergency support']
  },
  {
    role: 'colony_owner' as UserRole,
    title: 'Colony Owner',
    description: 'Create and manage delivery colonies',
    icon: Building2,
    color: 'from-olive-600 to-emerald-700',
    bgColor: 'bg-gradient-to-br from-olive-50 to-emerald-50',
    borderColor: 'border-olive-300',
    textColor: 'text-olive-800',
    features: ['Create colonies', 'Manage operators', 'Earn commissions'],
    recommended: true
  }
];

export default function SignUpPage() {
  const router = useRouter();
  const { setUser } = useUserStore();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [step, setStep] = useState<'role' | 'wallet' | 'complete'>('role');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      setStep('wallet');
    }
  };

  const handleWalletConnect = async () => {
    if (!selectedRole) return;

    setLoading(true);
    try {
      // Check available wallets first
      const availableWallets = getAvailableWallets();
      console.log('Available wallets:', availableWallets);

      if (availableWallets.length === 0) {
        throw new Error('No Cardano wallets found. Please install a Cardano wallet extension like Nami, Eternl, Flint, or Yoroi.');
      }

      // Store selected role for role assignment
      localStorage.setItem('selected_user_role', selectedRole);
      console.log(`💾 Stored selected role: ${selectedRole}`);

      const { address, api, walletName } = await connectWallet();
      await setUser(address, api);

      console.log(`Connected to ${walletName} wallet with address: ${address}`);

      setStep('complete');

      // Redirect based on user role after a short delay
      setTimeout(() => {
        // Determine redirect based on role
        const redirectPath = getRedirectPathForRole(selectedRole);
        console.log(`🚀 Redirecting to: ${redirectPath}`);
        router.push(redirectPath);
      }, 2000);
    } catch (error) {
      console.error('Wallet connection failed:', error);
      alert(`Failed to connect wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const renderRoleSelection = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 text-heading">Choose Your Role</h1>
        <p className="text-gray-600 text-body">Select how you want to participate in ShipShift</p>
      </div>

      {/* Role Cards - Compact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roleOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedRole === option.role;

          return (
            <div
              key={option.role}
              className={`relative cursor-pointer transition-all duration-200 ${
                isSelected ? 'scale-105' : 'hover:scale-102'
              }`}
              onClick={() => handleRoleSelect(option.role)}
            >
              {option.recommended && (
                <div className="absolute -top-2 left-3 z-10">
                  <span className="bg-olive-600 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                    Recommended
                  </span>
                </div>
              )}

              <div className={`
                relative p-4 rounded-xl border-2 transition-all duration-200
                ${isSelected
                  ? 'border-olive-500 bg-olive-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-olive-200 hover:shadow-sm'
                }
              `}>
                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle className="w-5 h-5 text-olive-600" />
                  </div>
                )}

                {/* Icon and Title */}
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${option.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold truncate ${isSelected ? 'text-olive-700' : 'text-gray-900'}`}>
                      {option.title}
                    </h3>
                  </div>
                </div>

                {/* Description */}
                <p className={`text-sm mb-3 ${isSelected ? 'text-gray-700' : 'text-gray-600'}`}>
                  {option.description}
                </p>

                {/* Key Features - Only show 2 */}
                <div className="space-y-1">
                  {option.features.slice(0, 2).map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-olive-500' : 'bg-gray-400'}`} />
                      <span className={`text-xs ${isSelected ? 'text-gray-700' : 'text-gray-600'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!selectedRole}
          className={`flex-1 px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            selectedRole
              ? 'bg-olive-600 text-white hover:bg-olive-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderWalletConnection = () => {
    const selectedRoleData = roleOptions.find(r => r.role === selectedRole);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Connect Your Wallet</h1>
          <p className="text-gray-600">Connect your Cardano wallet to complete registration</p>
        </div>

        {/* Selected Role Summary */}
        {selectedRoleData && (
          <div className="bg-olive-50 border border-olive-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${selectedRoleData.color} flex items-center justify-center`}>
                {React.createElement(selectedRoleData.icon, { className: "w-4 h-4 text-white" })}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Selected Role:</p>
                <p className="font-semibold text-olive-700">{selectedRoleData.title}</p>
              </div>
              {selectedRoleData.recommended && (
                <span className="bg-olive-600 text-white px-2 py-1 rounded-full text-xs">
                  Recommended
                </span>
              )}
            </div>
          </div>
        )}

        {/* Optional Information */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          <h3 className="font-medium text-gray-900">Optional Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-olive-500 focus:ring-0"
                placeholder="Enter your display name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-olive-500 focus:ring-0"
                placeholder="Enter your email"
              />
            </div>
          </div>
        </div>

        {/* Wallet Info */}
        <div className="bg-olive-50 border border-olive-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-olive-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-olive-800 mb-1">Secure Wallet Connection</h4>
              <p className="text-sm text-olive-700 mb-2">
                Connect your Cardano wallet to sign transactions and manage your identity.
              </p>
              <div className="flex flex-wrap gap-1">
                {(() => {
                  const availableWallets = getAvailableWallets();
                  const allWallets = ['Nami', 'Eternl', 'Flint', 'Yoroi'];

                  if (availableWallets.length === 0) {
                    return allWallets.map(wallet => (
                      <span key={wallet} className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-xs">
                        {wallet}
                      </span>
                    ));
                  }

                  return availableWallets.map(wallet => (
                    <span key={wallet} className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-medium">
                      ✓ {wallet.charAt(0).toUpperCase() + wallet.slice(1)}
                    </span>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => setStep('role')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={handleWalletConnect}
            disabled={loading}
            className="flex-1 px-6 py-2 bg-olive-600 text-white rounded-lg font-medium hover:bg-olive-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  const renderComplete = () => {
    const selectedRoleData = roleOptions.find(r => r.role === selectedRole);

    return (
      <div className="text-center space-y-6">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>

        {/* Welcome Message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Welcome to ShipShift!</h1>
          <p className="text-gray-600">Your account has been created successfully.</p>
        </div>

        {/* Role Confirmation */}
        {selectedRoleData && (
          <div className="bg-olive-50 border border-olive-200 rounded-lg p-4 max-w-sm mx-auto">
            <div className="flex items-center justify-center space-x-3">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${selectedRoleData.color} flex items-center justify-center`}>
                {React.createElement(selectedRoleData.icon, { className: "w-4 h-4 text-white" })}
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-600">Registered as</p>
                <p className="font-semibold text-olive-700">{selectedRoleData.title}</p>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-olive-50 border border-olive-200 rounded-lg p-4">
          <h3 className="font-medium text-olive-800 mb-3 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            What's Next?
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-olive-500 rounded-full"></div>
              <span className="text-olive-700">Create colony</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-olive-500 rounded-full"></div>
              <span className="text-olive-700">Connect operators</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-olive-500 rounded-full"></div>
              <span className="text-olive-700">Earn rewards</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-olive-500 rounded-full"></div>
              <span className="text-olive-700">Explore network</span>
            </div>
          </div>
        </div>

        {/* Redirect Message */}
        <div className="flex items-center justify-center space-x-2 text-gray-500">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-olive-500 rounded-full animate-spin"></div>
          <span className="text-sm">Redirecting to colony creation...</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
              step === 'role' ? 'bg-olive-600 text-white' :
              (step === 'wallet' || step === 'complete') ? 'bg-olive-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              1
            </div>
            <div className={`h-0.5 w-8 ${
              (step === 'wallet' || step === 'complete') ? 'bg-olive-600' : 'bg-gray-300'
            }`}></div>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
              step === 'wallet' ? 'bg-olive-600 text-white' :
              step === 'complete' ? 'bg-olive-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
            <div className={`h-0.5 w-8 ${
              step === 'complete' ? 'bg-olive-600' : 'bg-gray-300'
            }`}></div>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
              step === 'complete' ? 'bg-olive-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              3
            </div>
          </div>
          <div className="flex justify-center space-x-12 text-xs text-gray-600">
            <span className={step === 'role' ? 'text-olive-600 font-medium' : ''}>Role</span>
            <span className={step === 'wallet' ? 'text-olive-600 font-medium' : ''}>Wallet</span>
            <span className={step === 'complete' ? 'text-olive-600 font-medium' : ''}>Done</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          {step === 'role' && renderRoleSelection()}
          {step === 'wallet' && renderWalletConnection()}
          {step === 'complete' && renderComplete()}
        </div>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/auth/signin')}
              className="text-olive-600 hover:text-olive-700 font-medium underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
