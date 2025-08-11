// Main application layout with sidebar and topbar

'use client';

import React, { useState } from 'react';
import { useUserStore } from '@/stores/userStore';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import WalletConnect from '../auth/WalletConnect';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated } = useUserStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Show wallet connection screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="glass-card p-8 slide-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 pulse-glow">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to ShipShift</h1>
              <p className="text-gray-600">
                Connect your Cardano wallet to access the decentralized delivery network
              </p>
            </div>

            <WalletConnect />

            <div className="mt-8 pt-6 border-t border-teal-200/50">
              <div className="text-center text-sm text-gray-500">
                <p className="mb-2">New to ShipShift?</p>
                <div className="space-y-1">
                  <p>• Request deliveries as a <strong className="text-gray-700">Requester</strong></p>
                  <p>• Receive packages as a <strong className="text-gray-700">Recipient</strong></p>
                  <p>• Operate deliveries as an <strong className="text-gray-700">Operator</strong></p>
                  <p>• Manage colonies as an <strong className="text-gray-700">Owner</strong></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-white">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
