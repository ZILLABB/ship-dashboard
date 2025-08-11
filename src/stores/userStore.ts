// User state management with Zustand

import { create } from 'zustand';
import { UserRole, WalletApi, User } from '@/types';
import { getUserRoles } from '@/lib/api';

interface UserState {
  // User data
  address?: string;
  roles: UserRole[];
  walletApi?: WalletApi;
  user?: User;

  // UI state
  isConnecting: boolean;
  isAuthenticated: boolean;

  // Actions
  setUser: (address: string, walletApi?: WalletApi) => Promise<void>;
  setRoles: (roles: UserRole[]) => void;
  logout: () => void;

  // Role helpers
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  getPrimaryRole: () => UserRole | undefined;
}

export const useUserStore = create<UserState>()((set, get) => ({
  // Initial state
  address: undefined,
  roles: [],
  walletApi: undefined,
  user: undefined,
  isConnecting: false,
  isAuthenticated: false,

  // Actions
  setUser: async (address: string, walletApi?: WalletApi) => {
    set({ isConnecting: true });

    try {
      // Fetch user roles from API
      const rolesResponse = await getUserRoles(address);
      const roles = rolesResponse.success ? rolesResponse.data || [] : [];

      // Create user object
      const user: User = {
        address,
        roles,
        joinedAt: new Date(),
      };

      set({
        address,
        roles,
        walletApi,
        user,
        isAuthenticated: true,
        isConnecting: false,
      });
    } catch (error) {
      console.error('Failed to set user:', error);
      set({ isConnecting: false });
      throw error;
    }
  },

  setRoles: (roles: UserRole[]) => {
    const { user } = get();
    set({
      roles,
      user: user ? { ...user, roles } : undefined
    });
  },

  logout: () => {
    set({
      address: undefined,
      roles: [],
      walletApi: undefined,
      user: undefined,
      isAuthenticated: false,
      isConnecting: false,
    });
  },

  // Role helpers
  hasRole: (role: UserRole) => {
    const { roles } = get();
    return roles.includes(role);
  },

  hasAnyRole: (rolesToCheck: UserRole[]) => {
    const { roles } = get();
    return rolesToCheck.some(role => roles.includes(role));
  },

  getPrimaryRole: () => {
    const { roles } = get();
    if (roles.length === 0) return undefined;

    // Priority order for roles
    const rolePriority: UserRole[] = [
      'colony_owner',
      'reserve_operator',
      'dispatch_operator',
      'requester',
      'recipient'
    ];

    for (const role of rolePriority) {
      if (roles.includes(role)) {
        return role;
      }
    }

    return roles[0];
  },
}));

// Selectors for common use cases
export const useUserAddress = () => useUserStore(state => state.address);
export const useUserRoles = () => useUserStore(state => state.roles);
export const useIsAuthenticated = () => useUserStore(state => state.isAuthenticated);
export const usePrimaryRole = () => useUserStore(state => state.getPrimaryRole());
export const useHasRole = (role: UserRole) => useUserStore(state => state.hasRole(role));
export const useHasAnyRole = (roles: UserRole[]) => useUserStore(state => state.hasAnyRole(roles));
