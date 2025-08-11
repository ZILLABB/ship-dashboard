// Deliveries listing page

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Package, 
  Plus, 
  Filter, 
  Search,
  MapPin,
  Clock,
  User,
  MoreVertical,
  Eye,
  Edit,
  Truck
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import RoleGate from '@/components/auth/RoleGate';
import { getDeliveries } from '@/lib/api';
import { DeliveryRequest } from '@/types';
import { 
  formatCurrency, 
  formatDate, 
  formatRelativeTime,
  getDeliveryStatusColor,
  getDeliveryStatusDisplayName,
  getPriorityColor,
  formatAddress
} from '@/lib/utils';

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    async function loadDeliveries() {
      try {
        const response = await getDeliveries();
        if (response.success) {
          setDeliveries(response.data || []);
        }
      } catch (error) {
        console.error('Failed to load deliveries:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDeliveries();
  }, []);

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = delivery.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         delivery.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Deliveries</h1>
            <p className="text-gray-600">
              Track and manage delivery requests across the network
            </p>
          </div>
          
          <RoleGate roles={['requester']}>
            <Link href="/deliveries/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Request Delivery
              </Button>
            </Link>
          </RoleGate>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search deliveries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deliveries List */}
        {filteredDeliveries.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery || statusFilter !== 'all' ? 'No Matching Deliveries' : 'No Deliveries Found'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'There are no delivery requests yet. Create your first delivery request to get started.'
                }
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <RoleGate roles={['requester']}>
                  <Link href="/deliveries/create">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Request First Delivery
                    </Button>
                  </Link>
                </RoleGate>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredDeliveries.map((delivery) => (
              <Card key={delivery.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {delivery.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${getDeliveryStatusColor(delivery.status)}`}>
                              {getDeliveryStatusDisplayName(delivery.status)}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(delivery.priority)}`}>
                              {delivery.priority}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold text-green-600">
                            {formatCurrency(delivery.compensation.amount, delivery.compensation.currency)}
                          </span>
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Description */}
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {delivery.description}
                      </p>
                      
                      {/* Locations */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500">Pickup</p>
                            <p className="text-sm text-gray-900">{delivery.pickupLocation.name || delivery.pickupLocation.address}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500">Delivery</p>
                            <p className="text-sm text-gray-900">{delivery.deliveryLocation.name || delivery.deliveryLocation.address}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Time Window */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Deliver by {formatDate(delivery.timeWindow.latest, { 
                              month: 'short', 
                              day: 'numeric', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        
                        {delivery.assignedOperator && (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {formatAddress(delivery.assignedOperator)}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="text-sm text-gray-500">
                          Created {formatRelativeTime(delivery.createdAt)} • 
                          Updated {formatRelativeTime(delivery.updatedAt)}
                        </div>
                        
                        <div className="flex gap-2">
                          <Link href={`/deliveries/${delivery.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </Link>
                          
                          <RoleGate roles={['dispatch_operator', 'reserve_operator']}>
                            {delivery.status === 'approved' && !delivery.assignedOperator && (
                              <Button size="sm">
                                <Truck className="w-4 h-4 mr-2" />
                                Accept
                              </Button>
                            )}
                          </RoleGate>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
