// Core types for ShipShift application

export type UserRole =
  | 'colony_owner'
  | 'reserve_operator'
  | 'dispatch_operator'
  | 'requester'
  | 'recipient';

export interface User {
  address: string;
  roles: UserRole[];
  name?: string;
  avatar?: string;
  joinedAt: Date;
}

export interface Colony {
  id: string;
  name: string;
  type: 'heterogeneous' | 'homogeneous';
  description?: string;
  minOwners: number;
  commission: number; // percentage
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  owners: string[]; // wallet addresses
  members: ColonyMember[];
  stats: {
    totalDeliveries: number;
    activeDeliveries: number;
    totalRevenue: number;
    averageRating: number;
  };
}

export interface ColonyMember {
  address: string;
  role: UserRole;
  joinedAt: Date;
  status: 'active' | 'pending' | 'suspended';
  reputation: number;
}

export interface DeliveryRequest {
  id: string;
  colonyId: string;
  requesterId: string;
  recipientId?: string;
  title: string;
  description: string;
  pickupLocation: Location;
  deliveryLocation: Location;
  timeWindow: {
    earliest: Date;
    latest: Date;
  };
  compensation: {
    amount: number;
    currency: 'ADA' | 'USD';
  };
  status: DeliveryStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
  assignedOperator?: string;
  tracking?: TrackingInfo[];
}

export type DeliveryStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'assigned'
  | 'in_transit'
  | 'delivered'
  | 'cancelled'
  | 'disputed';

export interface Location {
  lat: number;
  lng: number;
  address: string;
  name?: string;
  instructions?: string;
}

export interface TrackingInfo {
  timestamp: Date;
  location: Location;
  status: string;
  notes?: string;
  operatorId: string;
}

export interface PendingRequest {
  id: string;
  type: 'colony_creation' | 'delivery_request' | 'role_assignment' | 'payment';
  title: string;
  description: string;
  requesterId: string;
  targetId?: string; // colony id, delivery id, etc.
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  expiresAt?: Date;
  metadata: Record<string, unknown>;
  unsignedTxCbor?: string;
  signatures: {
    address: string;
    signature: string;
    signedAt: Date;
  }[];
  requiredSignatures: number;
}

export interface WalletApi {
  enable: () => Promise<unknown>;
  getUsedAddresses?: () => Promise<string[]>;
  getUnusedAddresses?: () => Promise<string[]>;
  getChangeAddress?: () => Promise<string>;
  signTx?: (cbor: string, partial?: boolean) => Promise<string>;
  signData?: (address: string, payload: string) => Promise<{ signature: string; key: string }>;
}

export interface NotificationEvent {
  id: string;
  type: 'delivery_update' | 'signature_required' | 'payment_received' | 'role_assigned';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface DashboardStats {
  totalDeliveries: number;
  activeDeliveries: number;
  pendingRequests: number;
  totalEarnings: number;
  averageRating: number;
  completionRate: number;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
