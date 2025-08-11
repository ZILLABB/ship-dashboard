// Delivery request creation page

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, MapPin, Clock, DollarSign } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import RoleGate from '@/components/auth/RoleGate';
import { useUserStore } from '@/stores/userStore';
import { createDeliveryRequest } from '@/lib/api';
import { DeliveryRequest, Location } from '@/types';

export default function CreateDeliveryPage() {
  const router = useRouter();
  const { address } = useUserStore();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  
  // Pickup location
  const [pickupLocation, setPickupLocation] = useState<Partial<Location>>({
    address: '',
    name: '',
    instructions: ''
  });
  
  // Delivery location
  const [deliveryLocation, setDeliveryLocation] = useState<Partial<Location>>({
    address: '',
    name: '',
    instructions: ''
  });
  
  // Time window
  const [earliestTime, setEarliestTime] = useState('');
  const [latestTime, setLatestTime] = useState('');
  
  // Compensation
  const [amount, setAmount] = useState(50);
  const [currency, setCurrency] = useState<'ADA' | 'USD'>('ADA');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    
    setError('');
    setLoading(true);
    
    try {
      const deliveryData: Partial<DeliveryRequest> = {
        title,
        description,
        priority,
        pickupLocation: {
          ...pickupLocation,
          lat: 40.7128, // Mock coordinates - in real app, use geocoding
          lng: -74.0060
        } as Location,
        deliveryLocation: {
          ...deliveryLocation,
          lat: 40.7589, // Mock coordinates
          lng: -73.9851
        } as Location,
        timeWindow: {
          earliest: new Date(earliestTime),
          latest: new Date(latestTime)
        },
        compensation: {
          amount,
          currency
        },
        requesterId: address
      };
      
      const response = await createDeliveryRequest(deliveryData);
      
      if (response.success) {
        router.push('/deliveries');
      } else {
        setError(response.error || 'Failed to create delivery request');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create delivery request';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <RoleGate roles={['requester']}>
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Request New Delivery
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Create a delivery request and get it assigned to available operators in the network.
                </p>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Basic Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Title *
                        </label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Brief description of the delivery"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Priority
                        </label>
                        <select
                          value={priority}
                          onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high' | 'urgent')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Detailed description of what needs to be delivered"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Locations */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Locations
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Pickup Location */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Pickup Location</h4>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address *
                          </label>
                          <input
                            type="text"
                            value={pickupLocation.address}
                            onChange={(e) => setPickupLocation(prev => ({ ...prev, address: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Street address"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location Name
                          </label>
                          <input
                            type="text"
                            value={pickupLocation.name}
                            onChange={(e) => setPickupLocation(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Business name or landmark"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Special Instructions
                          </label>
                          <textarea
                            value={pickupLocation.instructions}
                            onChange={(e) => setPickupLocation(prev => ({ ...prev, instructions: e.target.value }))}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Pickup instructions for the operator"
                          />
                        </div>
                      </div>
                      
                      {/* Delivery Location */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Delivery Location</h4>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address *
                          </label>
                          <input
                            type="text"
                            value={deliveryLocation.address}
                            onChange={(e) => setDeliveryLocation(prev => ({ ...prev, address: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Street address"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location Name
                          </label>
                          <input
                            type="text"
                            value={deliveryLocation.name}
                            onChange={(e) => setDeliveryLocation(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Business name or landmark"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Special Instructions
                          </label>
                          <textarea
                            value={deliveryLocation.instructions}
                            onChange={(e) => setDeliveryLocation(prev => ({ ...prev, instructions: e.target.value }))}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Delivery instructions for the operator"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Time Window */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Time Window
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Earliest Pickup Time *
                        </label>
                        <input
                          type="datetime-local"
                          value={earliestTime}
                          onChange={(e) => setEarliestTime(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Latest Delivery Time *
                        </label>
                        <input
                          type="datetime-local"
                          value={latestTime}
                          onChange={(e) => setLatestTime(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Compensation */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Compensation
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amount *
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          value={amount}
                          onChange={(e) => setAmount(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Currency
                        </label>
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value as 'ADA' | 'USD')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="ADA">ADA</option>
                          <option value="USD">USD</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Error Message */}
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      className="flex-1"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1"
                      loading={loading}
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Create Request
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </RoleGate>
    </AppLayout>
  );
}
