// Role-based dashboard page

'use client';

import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Package,
  Clock,
  DollarSign,
  Star,
  Users,
  MapPin,
  AlertCircle,
  Building2
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import RoleGate from '@/components/auth/RoleGate';
import { useUserStore } from '@/stores/userStore';
import { getDashboardStats, getPendingRequests } from '@/lib/api';
import { DashboardStats, PendingRequest } from '@/types';
import { formatCurrency, formatRelativeTime, getRoleDisplayName } from '@/lib/utils';

export default function Dashboard() {
  const { address, getPrimaryRole } = useUserStore();
  const primaryRole = getPrimaryRole();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!address || !primaryRole) return;
      
      try {
        setLoading(true);
        
        // Load dashboard stats
        const statsResponse = await getDashboardStats(address, primaryRole);
        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data);
        }
        
        // Load pending requests
        const pendingResponse = await getPendingRequests(address);
        if (pendingResponse.success) {
          setPendingRequests(pendingResponse.data || []);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [address, primaryRole]);

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
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
            <h1 className="text-2xl font-bold text-gray-900 text-heading">Dashboard</h1>
            <p className="text-gray-600 text-body">
              Welcome back! Here&apos;s what&apos;s happening with your {getRoleDisplayName(primaryRole || 'requester').toLowerCase()} activities.
            </p>
          </div>
          
          <Button onClick={() => window.location.href = '/colonies/create'} className="bg-olive-600 hover:bg-olive-700">
            <Building2 className="w-4 h-4 mr-2" />
            Create Colony
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalDeliveries || 0}</p>
                </div>
                <Package className="w-8 h-8 text-olive-600" />
              </div>
              <div className="mt-2 flex items-center text-sm">
                {stats?.totalDeliveries ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-emerald-600 mr-1" />
                    <span className="text-emerald-600">Ready to grow</span>
                  </>
                ) : (
                  <span className="text-gray-500">Start your first delivery</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Deliveries</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.activeDeliveries || 0}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
              <div className="mt-2 flex items-center text-sm">
                <span className="text-gray-500">
                  {stats?.activeDeliveries ? 'In progress' : 'No active deliveries'}
                </span>
              </div>
            </CardContent>
          </Card>

          <RoleGate roles={['colony_owner', 'dispatch_operator', 'reserve_operator']}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.totalEarnings ? formatCurrency(stats.totalEarnings) : '₦0.00'}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <span className="text-gray-500">
                    {stats?.totalEarnings ? 'Growing steadily' : 'Start earning today'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </RoleGate>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.averageRating ? stats.averageRating.toFixed(1) : '—'}
                  </p>
                </div>
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="mt-2 flex items-center text-sm">
                <span className="text-gray-500">
                  {stats?.completionRate ? `${stats.completionRate}% completion rate` : 'No ratings yet'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Requests */}
        <RoleGate roles={['colony_owner', 'dispatch_operator', 'reserve_operator']}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-olive-600" />
                Pending Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingRequests.length > 0 ? (
                <div className="space-y-4">
                  {pendingRequests.slice(0, 3).map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div>
                        <h4 className="font-medium text-gray-900">{request.title}</h4>
                        <p className="text-sm text-gray-600">{request.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Created {formatRelativeTime(request.createdAt)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Review
                        </Button>
                        <Button size="sm">
                          Sign
                        </Button>
                      </div>
                    </div>
                  ))}
                  {pendingRequests.length > 3 && (
                    <div className="text-center">
                      <Button variant="ghost">
                        View All Pending Requests
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Requests</h3>
                  <p className="text-gray-600 mb-4">
                    You're all caught up! No pending requests require your attention.
                  </p>
                  <Button variant="outline" onClick={() => window.location.href = '/colonies/create'}>
                    Create Your First Colony
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </RoleGate>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = '/colonies/create'}>
            <CardContent className="p-6 text-center">
              <Building2 className="w-12 h-12 text-olive-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Create Colony</h3>
              <p className="text-sm text-gray-600 mb-4">
                Start your journey by creating your first delivery colony
              </p>
              <Button className="w-full bg-olive-600 hover:bg-olive-700">Get Started</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer opacity-50">
            <CardContent className="p-6 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-500 mb-2">Request Delivery</h3>
              <p className="text-sm text-gray-500 mb-4">
                Create delivery requests (available after colony creation)
              </p>
              <Button className="w-full" variant="outline" disabled>Coming Soon</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer opacity-50">
            <CardContent className="p-6 text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-500 mb-2">Live Tracking</h3>
              <p className="text-sm text-gray-500 mb-4">
                Track deliveries in real-time (available after colony creation)
              </p>
              <Button className="w-full" variant="outline" disabled>Coming Soon</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
