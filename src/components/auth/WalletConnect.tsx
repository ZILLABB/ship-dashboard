// Wallet connection component with role selection for development

'use client';

import React, { useState, useEffect } from 'react';
import { Wallet, ChevronDown, AlertCircle } from 'lucide-react';
import { connectWallet, getAvailableWallets } from '@/lib/lucid';
import { useUserStore } from '@/stores/userStore';
import { UserRole, WalletApi } from '@/types';
import { getRoleDisplayName } from '@/lib/utils';


interface WalletConnectProps {
  onConnect?: () => void;
  className?: string;
}

export function WalletConnect({ onConnect, className = '' }: WalletConnectProps) {
  const { setUser, isAuthenticated, logout } = useUserStore();
  const [error, setError] = useState<string>('');

  const handleConnect = async (address: string, api?: WalletApi) => {
    setError('');

    try {
      await setUser(address, api);
      onConnect?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set user';
      setError(errorMessage);
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleDisconnect = () => {
    logout();
    localStorage.removeItem('mock_role');
  };

  if (isAuthenticated) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          <span className="text-sm text-emerald-700">Wallet Connected</span>
        </div>
        <button
          onClick={handleDisconnect}
          className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Your Wallet</h3>
          <p className="text-gray-600">Connect your Cardano wallet to start creating colonies</p>
        </div>

        <button
          onClick={async () => {
            try {
              const { address, api } = await connectWallet('nami');
              await handleConnect(address, api);
            } catch (err) {
              handleError(err instanceof Error ? err.message : 'Connection failed');
            }
          }}
          className="modern-button w-full flex items-center justify-center gap-2"
        >
          <Wallet className="w-5 h-5" />
          Connect Wallet
        </button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WalletConnect;
