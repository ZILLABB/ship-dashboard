// Colonies listing page

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Plus, 
  Users, 
  TrendingUp, 
  Star,
  MoreVertical,
  Eye,
  Edit,
  Settings
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import RoleGate from '@/components/auth/RoleGate';
import { getColonies } from '@/lib/api';
import { Colony } from '@/types';
import { formatCurrency, formatDate, getRoleColor } from '@/lib/utils';

export default function ColoniesPage() {
  const [colonies, setColonies] = useState<Colony[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadColonies() {
      try {
        const response = await getColonies();
        if (response.success) {
          setColonies(response.data || []);
        }
      } catch (error) {
        console.error('Failed to load colonies:', error);
      } finally {
        setLoading(false);
      }
    }

    loadColonies();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
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
            <h1 className="text-2xl font-bold text-gray-900">Colonies</h1>
            <p className="text-gray-600">
              Manage and view delivery colonies in the network
            </p>
          </div>
          
          <RoleGate roles={['colony_owner']}>
            <Link href="/colonies/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Colony
              </Button>
            </Link>
          </RoleGate>
        </div>

        {/* Colonies Grid */}
        {colonies.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Colonies Found</h3>
              <p className="text-gray-600 mb-6">
                There are no colonies available yet. Create your first colony to get started.
              </p>
              <RoleGate roles={['colony_owner']}>
                <Link href="/colonies/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Colony
                  </Button>
                </Link>
              </RoleGate>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {colonies.map((colony) => (
              <Card key={colony.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{colony.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          colony.type === 'heterogeneous' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {colony.type}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          colony.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {colony.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Description */}
                  {colony.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {colony.description}
                    </p>
                  )}
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Total Deliveries</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {colony.stats.totalDeliveries}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Active</p>
                      <p className="text-lg font-semibold text-orange-600">
                        {colony.stats.activeDeliveries}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Revenue</p>
                      <p className="text-lg font-semibold text-green-600">
                        {formatCurrency(colony.stats.totalRevenue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Rating</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-lg font-semibold text-gray-900">
                          {colony.stats.averageRating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Members */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Members ({colony.members.length})</p>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {colony.members.slice(0, 3).map((member, index) => (
                          <div
                            key={member.address}
                            className="w-6 h-6 bg-blue-100 rounded-full border-2 border-white flex items-center justify-center"
                            title={member.address}
                          >
                            <span className="text-xs font-medium text-blue-600">
                              {member.address.slice(-2).toUpperCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                      {colony.members.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{colony.members.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Link href={`/colonies/${colony.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    
                    <RoleGate roles={['colony_owner']}>
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </RoleGate>
                  </div>
                  
                  {/* Created Date */}
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Created {formatDate(colony.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
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
