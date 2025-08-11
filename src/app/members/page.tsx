// Members management page

'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  UserPlus,
  UserMinus,
  Shield,
  Mail,
  Phone
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import RoleGate from '@/components/auth/RoleGate';
import { formatAddress, getRoleDisplayName } from '@/lib/utils';
import { UserRole } from '@/types';

interface Member {
  id: string;
  address: string;
  name?: string;
  email?: string;
  roles: UserRole[];
  joinedAt: Date;
  status: 'active' | 'inactive' | 'pending';
  deliveriesCompleted: number;
  rating: number;
}

const mockMembers: Member[] = [
  {
    id: '1',
    address: 'addr_test1qp0wner123456789abcdef...',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    roles: ['colony_owner'],
    joinedAt: new Date('2024-01-15'),
    status: 'active',
    deliveriesCompleted: 45,
    rating: 4.8
  },
  {
    id: '2',
    address: 'addr_test1qp0dispatch123456789ab...',
    name: 'Bob Smith',
    email: 'bob@example.com',
    roles: ['dispatch_operator'],
    joinedAt: new Date('2024-02-01'),
    status: 'active',
    deliveriesCompleted: 123,
    rating: 4.9
  },
  {
    id: '3',
    address: 'addr_test1qp0reserve123456789abc...',
    name: 'Carol Davis',
    roles: ['reserve_operator', 'requester'],
    joinedAt: new Date('2024-02-15'),
    status: 'active',
    deliveriesCompleted: 67,
    rating: 4.7
  }
];

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showInviteModal, setShowInviteModal] = useState(false);

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.roles.includes(roleFilter as UserRole);
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AppLayout>
      <RoleGate roles={['colony_owner', 'dispatch_operator']}>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Members</h1>
              <p className="text-gray-600">
                Manage colony members and their roles
              </p>
            </div>
            
            <RoleGate roles={['colony_owner']}>
              <Button onClick={() => setShowInviteModal(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
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
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="glass-input pl-10 pr-4 py-2 w-full"
                  />
                </div>
                
                {/* Role Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="glass-input px-3 py-2"
                  >
                    <option value="all">All Roles</option>
                    <option value="colony_owner">Colony Owner</option>
                    <option value="dispatch_operator">Dispatch Operator</option>
                    <option value="reserve_operator">Reserve Operator</option>
                    <option value="requester">Requester</option>
                    <option value="recipient">Recipient</option>
                  </select>
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="glass-input px-3 py-2"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Members List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {member.name || 'Anonymous'}
                        </h3>
                        <p className="text-sm text-gray-500 font-mono">
                          {formatAddress(member.address)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(member.status)}`}>
                        {member.status}
                      </span>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Contact Info */}
                  {(member.email) && (
                    <div className="space-y-2 mb-4">
                      {member.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {member.email}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Roles */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Roles</p>
                    <div className="flex flex-wrap gap-1">
                      {member.roles.map(role => (
                        <span 
                          key={role}
                          className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full"
                        >
                          {getRoleDisplayName(role)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500">Deliveries</p>
                      <p className="font-semibold text-gray-900">{member.deliveriesCompleted}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Rating</p>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-gray-900">{member.rating}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(member.rating) ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            >
                              ★
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Profile
                    </Button>
                    <RoleGate roles={['colony_owner']}>
                      <Button variant="ghost" size="sm">
                        <Shield className="w-4 h-4" />
                      </Button>
                    </RoleGate>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredMembers.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Members Found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : 'No members have joined this colony yet.'
                  }
                </p>
                <RoleGate roles={['colony_owner']}>
                  <Button onClick={() => setShowInviteModal(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite First Member
                  </Button>
                </RoleGate>
              </CardContent>
            </Card>
          )}
        </div>
      </RoleGate>
    </AppLayout>
  );
}
