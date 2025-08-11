// Sidebar navigation with role-based menu items

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Building2, 
  Truck, 
  Users, 
  BarChart3, 
  Settings,
  Plus,
  Package,
  MapPin,
  Clock,
  Shield
} from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { UserRole } from '@/types';
import { getRoleDisplayName, cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
  badge?: string;
}

const navigationItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Colonies',
    href: '/colonies',
    icon: Building2,
    roles: ['colony_owner', 'dispatch_operator', 'reserve_operator'],
  },
  {
    name: 'Create Colony',
    href: '/colonies/create',
    icon: Plus,
    roles: ['colony_owner'],
  },
  {
    name: 'Deliveries',
    href: '/deliveries',
    icon: Truck,
  },
  {
    name: 'Request Delivery',
    href: '/deliveries/create',
    icon: Package,
    roles: ['requester'],
  },
  {
    name: 'Live Map',
    href: '/map',
    icon: MapPin,
    roles: ['dispatch_operator', 'reserve_operator', 'colony_owner'],
  },
  {
    name: 'Pending Requests',
    href: '/pending',
    icon: Clock,
    roles: ['colony_owner', 'dispatch_operator', 'reserve_operator'],
  },
  {
    name: 'Members',
    href: '/members',
    icon: Users,
    roles: ['colony_owner', 'dispatch_operator'],
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    roles: ['colony_owner', 'dispatch_operator', 'reserve_operator'],
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { roles, hasAnyRole, getPrimaryRole, isAuthenticated } = useUserStore();
  const primaryRole = getPrimaryRole();

  // Filter navigation items based on user roles
  const visibleItems = navigationItems.filter(item => {
    if (!item.roles) return true; // Show items without role restrictions
    return hasAnyRole(item.roles);
  });

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={cn("flex flex-col h-full glass border-r border-teal-200/50", className)}>
      {/* Logo and Brand */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-teal-200/50">
        <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg flex items-center justify-center pulse-glow">
          <Truck className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-semibold text-gray-900">ShipShift</h1>
          <p className="text-xs text-gray-500">Delivery Network</p>
        </div>
      </div>

      {/* User Role Badge */}
      {primaryRole && (
        <div className="px-6 py-3 border-b border-teal-200/50">
          <div className="flex items-center gap-2 px-3 py-2 glass rounded-lg">
            <Shield className="w-4 h-4 text-teal-600" />
            <span className="text-sm font-medium text-gray-900">
              {getRoleDisplayName(primaryRole)}
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "glass bg-teal-50 text-teal-700 border border-teal-200"
                  : "text-gray-600 hover:bg-teal-50 hover:text-teal-700"
              )}
            >
              <item.icon className={cn(
                "w-4 h-4",
                isActive ? "text-teal-600" : "text-gray-400"
              )} />
              <span>{item.name}</span>
              {item.badge && (
                <span className="ml-auto px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-teal-200/50">
        <div className="text-xs text-gray-500">
          <p>Connected Roles:</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {roles.map(role => (
              <span
                key={role}
                className="px-2 py-1 glass text-gray-700 rounded-full text-xs"
              >
                {getRoleDisplayName(role)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
