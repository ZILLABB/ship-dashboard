// Sign in page

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Wallet, AlertCircle, CheckCircle } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { connectWallet, getAvailableWallets } from '@/lib/lucid';
import { UserRole } from '@/types';

const mockUsers = [
  { address: 'addr_test1qp0wner123456789abcdef...', role: 'colony_owner' as UserRole, name: 'Colony Manager' },
  { address: 'addr_test1qp0dispatch123456789ab...', role: 'dispatch_operator' as UserRole, name: 'Dispatch Pro' },
  { address: 'addr_test1qp0reserve123456789abc...', role: 'reserve_operator' as UserRole, name: 'Reserve Ops' },
  { address: 'addr_test1qp0requester123456789a...', role: 'requester' as UserRole, name: 'Package Sender' },
  { address: 'addr_test1qp0recipient123456789ab...', role: 'recipient' as UserRole, name: 'Package Receiver' },
];

export default function SignInPage() {
  const router = useRouter();
  const { setUser } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMockUser, setSelectedMockUser] = useState<string>('');
  const [step, setStep] = useState<'method' | 'connecting' | 'complete'>('method');

  const handleWalletConnect = async () => {
    setLoading(true);
    setError('');

    try {
      // Check available wallets first
      const availableWallets = getAvailableWallets();
      console.log('Available wallets:', availableWallets);

      if (availableWallets.length === 0) {
        throw new Error('No Cardano wallets found. Please install a Cardano wallet extension like Nami, Eternl, Flint, or Yoroi.');
      }

      const { address, api, walletName } = await connectWallet();
      await setUser(address, api);

      console.log(`Connected to ${walletName} wallet with address: ${address}`);

      setStep('complete');

      // For signin, redirect to dashboard (user already has established role)
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMockUserSelect = async (userRole: UserRole) => {
    setLoading(true);
    setError('');
    
    try {
      // Store selected role for mock wallet
      localStorage.setItem('mock_role', userRole);
      
      const { address, api } = await connectWallet();
      await setUser(address, api);
      
      setStep('complete');
      
      // Redirect to colony creation after a short delay
      setTimeout(() => {
        router.push('/colonies/create');
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderMethodSelection = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-600">Sign in to your ShipShift account</p>
      </div>

      {/* Wallet Connection */}
      <div className="bg-olive-50 border border-olive-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Wallet className="w-5 h-5 text-olive-600" />
          <h3 className="font-semibold text-gray-900">Connect Wallet</h3>
        </div>
        <p className="text-gray-600 text-sm mb-3">
          Connect your Cardano wallet to access your account
        </p>
        <button
          onClick={handleWalletConnect}
          disabled={loading}
          className="w-full bg-olive-600 hover:bg-olive-700 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => router.back()}
          className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={() => router.push('/auth/signup')}
          className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Create Account
        </button>
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="text-center space-y-4">
      <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-6 h-6 text-white" />
      </div>

      <div className="space-y-1">
        <h2 className="text-xl font-bold text-gray-900">Welcome Back!</h2>
        <p className="text-gray-600 text-sm">
          Successfully signed in. Redirecting...
        </p>
      </div>

      <div className="flex justify-center">
        <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-olive-600 rounded-full"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-sm mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          {step === 'method' && renderMethodSelection()}
          {step === 'complete' && renderComplete()}
        </div>
      </div>
    </div>
  );
}
