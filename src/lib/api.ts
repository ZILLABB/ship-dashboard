// Mock API client for frontend-only development
// Replace with real API calls when backend is available

import {
  Colony,
  DeliveryRequest,
  PendingRequest,
  User,
  DashboardStats,
  ApiResponse,
  PaginatedResponse,
  UserRole
} from '@/types';

// Mock data
const MOCK_COLONIES: Colony[] = [
  {
    id: 'colony_1',
    name: 'Downtown Express',
    type: 'heterogeneous',
    description: 'Fast delivery service for downtown area',
    minOwners: 2,
    commission: 5,
    status: 'active',
    createdAt: new Date('2024-01-15'),
    owners: ['addr_test1qp0wner123456789abcdef...'],
    members: [
      {
        address: 'addr_test1qp0wner123456789abcdef...',
        role: 'colony_owner',
        joinedAt: new Date('2024-01-15'),
        status: 'active',
        reputation: 95
      },
      {
        address: 'addr_test1qp0dispatch123456789ab...',
        role: 'dispatch_operator',
        joinedAt: new Date('2024-01-20'),
        status: 'active',
        reputation: 88
      }
    ],
    stats: {
      totalDeliveries: 156,
      activeDeliveries: 8,
      totalRevenue: 2340,
      averageRating: 4.7
    }
  },
  {
    id: 'colony_2',
    name: 'Campus Couriers',
    type: 'homogeneous',
    description: 'Student-run delivery service for university campus',
    minOwners: 1,
    commission: 3,
    status: 'active',
    createdAt: new Date('2024-02-01'),
    owners: ['addr_test1qp0wner2123456789abcde...'],
    members: [],
    stats: {
      totalDeliveries: 89,
      activeDeliveries: 12,
      totalRevenue: 890,
      averageRating: 4.5
    }
  }
];

const MOCK_DELIVERIES: DeliveryRequest[] = [
  {
    id: 'delivery_1',
    colonyId: 'colony_1',
    requesterId: 'addr_test1qp0requester123456789a...',
    recipientId: 'addr_test1qp0recipient123456789ab...',
    title: 'Urgent Document Delivery',
    description: 'Legal documents need to be delivered by 5 PM today',
    pickupLocation: {
      lat: 40.7128,
      lng: -74.0060,
      address: '123 Main St, New York, NY 10001',
      name: 'Law Office',
      instructions: 'Ask for Sarah at reception'
    },
    deliveryLocation: {
      lat: 40.7589,
      lng: -73.9851,
      address: '456 Broadway, New York, NY 10013',
      name: 'City Hall',
      instructions: 'Room 205, second floor'
    },
    timeWindow: {
      earliest: new Date(),
      latest: new Date(Date.now() + 6 * 60 * 60 * 1000) // 6 hours from now
    },
    compensation: {
      amount: 50,
      currency: 'ADA'
    },
    status: 'assigned',
    priority: 'urgent',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    updatedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    assignedOperator: 'addr_test1qp0dispatch123456789ab...',
    tracking: [
      {
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        location: {
          lat: 40.7128,
          lng: -74.0060,
          address: '123 Main St, New York, NY 10001'
        },
        status: 'Picked up',
        notes: 'Package secured',
        operatorId: 'addr_test1qp0dispatch123456789ab...'
      }
    ]
  }
];

const MOCK_PENDING_REQUESTS: PendingRequest[] = [
  {
    id: 'pending_1',
    type: 'colony_creation',
    title: 'Create New Colony: Suburban Express',
    description: 'Request to create a new delivery colony for suburban areas',
    requesterId: 'addr_test1qp0wner3123456789abcd...',
    status: 'pending',
    createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    metadata: {
      colonyName: 'Suburban Express',
      colonyType: 'heterogeneous',
      minOwners: 2,
      commission: 4
    },
    unsignedTxCbor: '0xUNSIGNED_TX_CBOR_MOCK_COLONY_CREATION',
    signatures: [],
    requiredSignatures: 1
  }
];

// Utility function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Colony creation interfaces
interface ColonyCreationParams {
  colonyName: string;
  description?: string;
  colonyParams: {
    creators: string[];
    minActiveSignatory: number;
    colonyOf: string[];
    txOutRef?: string;
  };
  minCollateral: Array<{
    participantType: string;
    currencySymbol: string;
    assetClass: string;
    value: number;
  }>;
  commission: {
    percent: number;
    address: string;
  };
}

// Real API function for colony creation
export async function createColony(params: ColonyCreationParams): Promise<{ requestId: string; unsignedTxCbor: string }> {
  // Use your actual backend URL structure
  const API_BASE_URL = navigator.platform === "MacIntel"
    ? 'http://127.0.0.1:8034/api'
    : 'https://msg.shipshift.io/api';

  try {
    const response = await fetch(`${API_BASE_URL}/colony/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        colonyInfo: {
          colonyName: params.colonyName,
          description: params.description,
          icpColonyParams: {
            cpCreators: params.colonyParams.creators,
            cpMinActiveSignatory: params.colonyParams.minActiveSignatory,
            cpColonyOf: params.colonyParams.colonyOf,
            cpTxOutRef: params.colonyParams.txOutRef || ''
          },
          icpMinCollateral: params.minCollateral.map(c => [
            c.participantType,
            { [`${c.currencySymbol}.${c.assetClass}`]: c.value }
          ]),
          icpCommission: {
            cpPercent: params.commission.percent,
            cpAddress: params.commission.address
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      requestId: data.requestId || `req_${Math.random().toString(36).slice(2, 9)}`,
      unsignedTxCbor: data.unsignedTxCbor || data.txBodyHex || `0xUNSIGNED_TX_CBOR_${Date.now()}`
    };
  } catch (error) {
    console.error('Colony creation API error:', error);

    // Provide helpful error message
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to backend API at ${API_BASE_URL}. Please ensure your backend is running.`);
    }

    throw error;
  }
}

// Legacy mock function for backward compatibility
export async function createColonyMock(params: {
  name: string;
  type: 'heterogeneous' | 'homogeneous';
  minOwners: number;
  commission: number;
}): Promise<{ requestId: string; unsignedTxCbor: string }> {
  await delay(1000);

  const requestId = `req_${Math.random().toString(36).slice(2, 9)}`;
  const unsignedTxCbor = `0xUNSIGNED_TX_CBOR_COLONY_${requestId}`;

  return { requestId, unsignedTxCbor };
}

export async function getColonies(): Promise<ApiResponse<Colony[]>> {
  await delay(500);
  return {
    success: true,
    data: MOCK_COLONIES
  };
}

export async function getColonyById(id: string): Promise<ApiResponse<Colony>> {
  await delay(300);
  const colony = MOCK_COLONIES.find(c => c.id === id);

  if (!colony) {
    return {
      success: false,
      error: 'Colony not found'
    };
  }

  return {
    success: true,
    data: colony
  };
}

export async function getDeliveries(colonyId?: string): Promise<ApiResponse<DeliveryRequest[]>> {
  await delay(400);
  let deliveries = MOCK_DELIVERIES;

  if (colonyId) {
    deliveries = deliveries.filter(d => d.colonyId === colonyId);
  }

  return {
    success: true,
    data: deliveries
  };
}

export async function createDeliveryRequest(params: Partial<DeliveryRequest>): Promise<ApiResponse<{ requestId: string; unsignedTxCbor: string }>> {
  await delay(800);

  const requestId = `delivery_req_${Math.random().toString(36).slice(2, 9)}`;
  const unsignedTxCbor = `0xUNSIGNED_TX_CBOR_DELIVERY_${requestId}`;

  return {
    success: true,
    data: { requestId, unsignedTxCbor }
  };
}

export async function getPendingRequests(address: string): Promise<ApiResponse<PendingRequest[]>> {
  await delay(300);

  // Filter pending requests relevant to the user
  const userRequests = MOCK_PENDING_REQUESTS.filter(req =>
    req.requesterId === address ||
    req.signatures.some(sig => sig.address === address)
  );

  return {
    success: true,
    data: userRequests
  };
}

export async function submitSignature(requestId: string, signature: string, address: string): Promise<ApiResponse<void>> {
  await delay(500);

  // In a real implementation, this would submit the signature to the backend
  console.log('Signature submitted:', { requestId, signature, address });

  return {
    success: true,
    message: 'Signature submitted successfully'
  };
}

export async function getUserRoles(address: string): Promise<ApiResponse<UserRole[]>> {
  await delay(200);

  console.log(`🔍 Getting roles for address: ${address}`);

  // For real wallet addresses, assign roles based on address characteristics or user choice
  // This is a development approach - in production, roles would come from your backend

  // Check if it's a mock address first
  const roleMap: Record<string, UserRole[]> = {
    [MOCK_ADDRESSES.colony_owner]: ['colony_owner'],
    [MOCK_ADDRESSES.reserve_operator]: ['reserve_operator'],
    [MOCK_ADDRESSES.dispatch_operator]: ['dispatch_operator'],
    [MOCK_ADDRESSES.requester]: ['requester'],
    [MOCK_ADDRESSES.recipient]: ['recipient'],
  };

  // If it's a mock address, use the predefined role
  if (roleMap[address]) {
    console.log(`📋 Mock address detected, assigning role: ${roleMap[address]}`);
    return {
      success: true,
      data: roleMap[address]
    };
  }

  // For real wallet addresses, check localStorage for selected role during signup
  const selectedRole = localStorage.getItem('selected_user_role') as UserRole;

  if (selectedRole && ['colony_owner', 'reserve_operator', 'dispatch_operator', 'requester', 'recipient'].includes(selectedRole)) {
    console.log(`🎯 Real wallet address, using selected role: ${selectedRole}`);
    return {
      success: true,
      data: [selectedRole]
    };
  }

  // Default to requester for unknown addresses
  console.log(`⚠️ Unknown address, defaulting to requester role`);
  return {
    success: true,
    data: ['requester']
  };
}

export async function getDashboardStats(address: string, role: UserRole): Promise<ApiResponse<DashboardStats>> {
  await delay(400);

  // Mock stats based on role
  const mockStats: Record<UserRole, DashboardStats> = {
    colony_owner: {
      totalDeliveries: 156,
      activeDeliveries: 8,
      pendingRequests: 3,
      totalEarnings: 2340,
      averageRating: 4.7,
      completionRate: 94
    },
    dispatch_operator: {
      totalDeliveries: 89,
      activeDeliveries: 5,
      pendingRequests: 2,
      totalEarnings: 1450,
      averageRating: 4.8,
      completionRate: 96
    },
    reserve_operator: {
      totalDeliveries: 234,
      activeDeliveries: 12,
      pendingRequests: 1,
      totalEarnings: 3200,
      averageRating: 4.6,
      completionRate: 92
    },
    requester: {
      totalDeliveries: 23,
      activeDeliveries: 2,
      pendingRequests: 1,
      totalEarnings: 0,
      averageRating: 4.5,
      completionRate: 87
    },
    recipient: {
      totalDeliveries: 45,
      activeDeliveries: 1,
      pendingRequests: 0,
      totalEarnings: 0,
      averageRating: 4.9,
      completionRate: 98
    }
  };

  return {
    success: true,
    data: mockStats[role] || mockStats.requester
  };
}

// Mock addresses for development
const MOCK_ADDRESSES = {
  colony_owner: 'addr_test1qp0wner123456789abcdef...',
  reserve_operator: 'addr_test1qp0reserve123456789abc...',
  dispatch_operator: 'addr_test1qp0dispatch123456789ab...',
  requester: 'addr_test1qp0requester123456789a...',
  recipient: 'addr_test1qp0recipient123456789ab...',
};
