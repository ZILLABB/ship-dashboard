// Authentication landing page with glassmorphism design

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, Sparkles, Shield, Users, Package, ArrowRight } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(true);

  const handleGetStarted = () => {
    router.push('/auth/signup');
  };

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          {/* Left side - Hero content */}
          <div className="text-center lg:text-left space-y-4">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
              <div className="w-8 h-8 bg-olive-600 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-olive-700">ShipShift</h1>
            </div>

            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight text-heading">
              Decentralized
              <br />
              <span className="text-olive-600">Delivery Network</span>
            </h2>

            <p className="text-gray-600 max-w-lg text-body">
              Join the future of logistics with blockchain-powered delivery colonies.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto lg:mx-0 mt-4">
              <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                <Shield className="w-5 h-5 text-olive-600 mx-auto mb-1" />
                <p className="text-xs text-gray-700 font-medium">Secure</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                <Users className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <p className="text-xs text-gray-700 font-medium">Collaborative</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                <Package className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xs text-gray-700 font-medium">Efficient</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                <Sparkles className="w-5 h-5 text-olive-500 mx-auto mb-1" />
                <p className="text-xs text-gray-700 font-medium">Innovative</p>
              </div>
            </div>
          </div>

          {/* Right side - Auth card */}
          <div className="w-full max-w-sm mx-auto">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="text-center space-y-2 mb-6">
                <h3 className="text-xl font-bold text-gray-900 text-heading">Get Started</h3>
                <p className="text-sm text-gray-600 text-caption">
                  Choose your path in the delivery ecosystem
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleGetStarted}
                  className="w-full bg-olive-600 hover:bg-olive-700 text-white p-3 rounded-lg font-medium transition-colors flex items-center justify-between"
                >
                  <div className="text-left">
                    <div className="font-semibold">Create Account</div>
                    <div className="text-sm opacity-90">Join as a new member</div>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleSignIn}
                  className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 p-3 rounded-lg font-medium transition-colors flex items-center justify-between"
                >
                  <div className="text-left">
                    <div className="font-semibold">Sign In</div>
                    <div className="text-sm text-gray-600">Access your account</div>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-200">
                <p className="text-center text-xs text-gray-500">
                  Powered by Cardano blockchain
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
