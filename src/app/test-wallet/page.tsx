'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle, XCircle, AlertCircle, Wallet, Globe, Database, Zap } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

export default function TestWalletPage() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Wallet Detection', status: 'pending', message: 'Checking for Cardano wallets...' },
    { name: 'Wallet Connection', status: 'pending', message: 'Waiting for wallet connection...' },
    { name: 'Address Retrieval', status: 'pending', message: 'Getting wallet address...' },
    { name: 'UTXO Access', status: 'pending', message: 'Checking UTXO access...' },
    { name: 'Backend Connectivity', status: 'pending', message: 'Testing backend API...' },
    { name: 'Transaction Building', status: 'pending', message: 'Testing transaction service...' },
  ]);

  const [connectedWallet, setConnectedWallet] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [walletApi, setWalletApi] = useState<any>(null);

  const updateTest = (index: number, status: 'success' | 'error', message: string, details?: any) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status, message, details } : test
    ));
  };

  const runTests = async () => {
    // Reset all tests
    setTests(prev => prev.map(test => ({ ...test, status: 'pending' })));

    try {
      // Test 1: Wallet Detection
      if (typeof window === 'undefined' || !(window as any).cardano) {
        updateTest(0, 'error', 'Cardano object not found. Please install a Cardano wallet.');
        return;
      }

      const availableWallets = [];
      const cardano = (window as any).cardano;
      if (cardano.nami) availableWallets.push('nami');
      if (cardano.eternl) availableWallets.push('eternl');
      if (cardano.flint) availableWallets.push('flint');
      if (cardano.yoroi) availableWallets.push('yoroi');

      if (availableWallets.length === 0) {
        updateTest(0, 'error', 'No Cardano wallets detected. Please install Nami, Eternl, Flint, or Yoroi.');
        return;
      }

      updateTest(0, 'success', `Found wallets: ${availableWallets.join(', ')}`, { wallets: availableWallets });

      // Test 2: Wallet Connection
      const preferredWallet = availableWallets[0];
      try {
        const api = await cardano[preferredWallet].enable();
        setWalletApi(api);
        setConnectedWallet(preferredWallet);
        updateTest(1, 'success', `Connected to ${preferredWallet} wallet`, { wallet: preferredWallet });
      } catch (error) {
        updateTest(1, 'error', `Failed to connect to ${preferredWallet}: ${error}`, { error });
        return;
      }

      // Test 3: Address Retrieval
      try {
        let addresses = [];

        // Try different methods to get addresses
        try {
          addresses = await walletApi.getUsedAddresses();
        } catch (e) {
          console.log('getUsedAddresses failed, trying getChangeAddress:', e);
          try {
            const changeAddress = await walletApi.getChangeAddress();
            if (changeAddress) addresses = [changeAddress];
          } catch (e2) {
            console.log('getChangeAddress failed, trying getRewardAddresses:', e2);
            try {
              const rewardAddresses = await walletApi.getRewardAddresses();
              if (rewardAddresses && rewardAddresses.length > 0) {
                addresses = rewardAddresses;
              }
            } catch (e3) {
              console.log('All address methods failed:', e3);
            }
          }
        }

        if (addresses && addresses.length > 0) {
          setWalletAddress(addresses[0]);
          updateTest(2, 'success', `Retrieved address: ${addresses[0].slice(0, 20)}...`, {
            address: addresses[0],
            method: 'getUsedAddresses or fallback'
          });
        } else {
          updateTest(2, 'error', 'No addresses found in wallet. Make sure your wallet has transactions or try a different wallet.', {
            attempted: ['getUsedAddresses', 'getChangeAddress', 'getRewardAddresses']
          });
          // Don't return here, continue with other tests
        }
      } catch (error) {
        updateTest(2, 'error', `Failed to get addresses: ${error}`, { error });
        // Don't return here, continue with other tests
      }

      // Test 4: UTXO Access
      try {
        if (!walletApi) {
          updateTest(3, 'error', 'Wallet API not available - address retrieval may have failed');
          return;
        }

        const utxos = await walletApi.getUtxos();
        if (utxos && utxos.length > 0) {
          updateTest(3, 'success', `Found ${utxos.length} UTXOs - Wallet has funds`, {
            utxoCount: utxos.length,
            hasBalance: true
          });
        } else {
          updateTest(3, 'success', `Wallet connected but no UTXOs found - Wallet may be empty`, {
            utxoCount: 0,
            hasBalance: false,
            note: 'This is normal for new or empty wallets. Get some test ADA from faucet.'
          });
        }
      } catch (error) {
        updateTest(3, 'error', `Failed to get UTXOs: ${error}`, { error });
      }

      // Test 5: Backend Connectivity
      const API_BASE_URL = navigator.platform === "MacIntel"
        ? 'http://127.0.0.1:8034/api'
        : 'https://msg.shipshift.io/api';

      try {
        // Try a simple connectivity test first
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(`${API_BASE_URL}/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          updateTest(4, 'success', `Backend connected: ${API_BASE_URL}`, {
            url: API_BASE_URL,
            status: response.status,
            platform: navigator.platform
          });
        } else {
          updateTest(4, 'error', `Backend responded with ${response.status}: ${response.statusText}`, {
            url: API_BASE_URL,
            status: response.status,
            platform: navigator.platform
          });
        }
      } catch (error) {
        const err = error as any;
        if (err.name === 'AbortError') {
          updateTest(4, 'error', `Backend connection timeout after 5 seconds`, {
            url: API_BASE_URL,
            error: 'timeout',
            platform: navigator.platform,
            suggestion: navigator.platform === "MacIntel"
              ? 'Make sure your local backend is running on port 8034'
              : 'Production backend may be down or unreachable'
          });
        } else {
          updateTest(4, 'error', `Cannot connect to backend: ${err.message || 'Network error'}`, {
            url: API_BASE_URL,
            error: err.message,
            platform: navigator.platform,
            suggestion: navigator.platform === "MacIntel"
              ? 'Start your local backend: your backend should be running on http://127.0.0.1:8034'
              : 'Check if production backend is accessible'
          });
        }
      }

      // Test 6: Transaction Building
      try {
        const { CardanoTransactionService } = await import('@/services/transaction');
        const tx = new CardanoTransactionService(walletApi, preferredWallet);
        const txOutRef = await tx.getTxOutRef();
        updateTest(5, 'success', `Transaction service working. TxOutRef: ${txOutRef}`, { txOutRef });
      } catch (error) {
        updateTest(5, 'error', `Transaction service failed: ${error}`, { error });
      }

    } catch (error) {
      console.error('Test suite failed:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'error': return 'border-red-200 bg-red-50';
      default: return 'border-yellow-200 bg-yellow-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-olive-600" />
              Real Wallet Integration Test Suite
            </CardTitle>
            <p className="text-gray-600">
              Verify that your ShipShift colony creation is using real Cardano wallets and backend connectivity.
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <Button onClick={runTests} className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Run All Tests
              </Button>
              {connectedWallet && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Connected to {connectedWallet}
                </div>
              )}
            </div>

            <div className="space-y-4">
              {tests.map((test, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getStatusColor(test.status)}`}>
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(test.status)}
                    <h3 className="font-medium">{test.name}</h3>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{test.message}</p>
                  {test.details && (
                    <details className="text-xs text-gray-600">
                      <summary className="cursor-pointer">View Details</summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                        {JSON.stringify(test.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>

            {walletAddress && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Wallet Information</h3>
                <p className="text-sm text-blue-800">
                  <strong>Connected Wallet:</strong> {connectedWallet}<br />
                  <strong>Address:</strong> {walletAddress}
                </p>
              </div>
            )}

            <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <h3 className="font-medium text-emerald-900 mb-2">Next Steps</h3>
              <p className="text-sm text-emerald-800 mb-2">
                If all tests pass, you can proceed to create a real colony:
              </p>
              <Button 
                onClick={() => window.location.href = '/colonies/create'}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Create Real Colony
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
