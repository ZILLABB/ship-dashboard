// Role-based access control component

'use client';

import React from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { UserRole } from '@/types';
import { getRoleDisplayName } from '@/lib/utils';

interface RoleGateProps {
  roles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAll?: boolean; // If true, user must have ALL roles, otherwise ANY role
}

export function RoleGate({
  roles,
  children,
  fallback,
  requireAll = false
}: RoleGateProps) {
  const { hasRole, hasAnyRole, isAuthenticated } = useUserStore();

  // If not authenticated, hide content
  if (!isAuthenticated) {
    return fallback || null;
  }

  // Check role permissions
  const hasPermission = requireAll
    ? roles.every(role => hasRole(role))
    : hasAnyRole(roles);

  // If no permission, hide content
  if (!hasPermission) {
    return fallback || null;
  }

  return <>{children}</>;
}

// Convenience components for specific roles
export function OwnerGate({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGate roles={['colony_owner']} fallback={fallback}>
      {children}
    </RoleGate>
  );
}

export function OperatorGate({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGate roles={['dispatch_operator', 'reserve_operator']} fallback={fallback}>
      {children}
    </RoleGate>
  );
}

export function RequesterGate({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGate roles={['requester']} fallback={fallback}>
      {children}
    </RoleGate>
  );
}

export function ManagementGate({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGate roles={['colony_owner', 'dispatch_operator', 'reserve_operator']} fallback={fallback}>
      {children}
    </RoleGate>
  );
}

export default RoleGate;
