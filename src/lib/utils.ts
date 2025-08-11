// Utility functions for the ShipShift application

import { type ClassValue, clsx } from "clsx";
import { UserRole, DeliveryStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number, currency: 'ADA' | 'USD' | 'NGN' = 'ADA'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency === 'ADA' ? 'USD' : currency,
    minimumFractionDigits: currency === 'ADA' ? 2 : 2,
    maximumFractionDigits: currency === 'ADA' ? 6 : 2,
  });

  if (currency === 'ADA') {
    return `₳${amount.toFixed(2)}`;
  }

  if (currency === 'NGN') {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return formatter.format(amount);
}

// Currency conversion utilities
export async function getExchangeRates(): Promise<{ adaToUsd: number; usdToNgn: number; adaToNgn: number }> {
  try {
    // Fetch real exchange rates from CoinGecko API
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd,ngn'
    );

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();
    const adaToUsd = data.cardano?.usd || 0.45;
    const adaToNgn = data.cardano?.ngn || 742.5;
    const usdToNgn = adaToNgn / adaToUsd;

    return { adaToUsd, usdToNgn, adaToNgn };
  } catch (error) {
    console.error('Failed to fetch real exchange rates, using fallback:', error);
    // Fallback rates (updated periodically)
    return { adaToUsd: 0.45, usdToNgn: 1650, adaToNgn: 742.5 };
  }
}

export function convertAdaToNaira(adaAmount: number, exchangeRate: number): number {
  return adaAmount * exchangeRate;
}

export function convertNairaToAda(nairaAmount: number, exchangeRate: number): number {
  return nairaAmount / exchangeRate;
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  return d.toLocaleDateString('en-US', { ...defaultOptions, ...options });
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  return formatDate(d, { month: 'short', day: 'numeric' });
}

export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    colony_owner: 'Colony Owner',
    reserve_operator: 'Reserve Operator',
    dispatch_operator: 'Dispatch Operator',
    requester: 'Requester',
    recipient: 'Recipient',
  };

  return roleNames[role] || role;
}

export function getRoleColor(role: UserRole): string {
  const roleColors: Record<UserRole, string> = {
    colony_owner: 'bg-purple-100 text-purple-800',
    reserve_operator: 'bg-blue-100 text-blue-800',
    dispatch_operator: 'bg-green-100 text-green-800',
    requester: 'bg-orange-100 text-orange-800',
    recipient: 'bg-gray-100 text-gray-800',
  };

  return roleColors[role] || 'bg-gray-100 text-gray-800';
}

export function getDeliveryStatusColor(status: DeliveryStatus): string {
  const statusColors: Record<DeliveryStatus, string> = {
    draft: 'bg-gray-100 text-gray-800',
    pending_approval: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    assigned: 'bg-indigo-100 text-indigo-800',
    in_transit: 'bg-orange-100 text-orange-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    disputed: 'bg-purple-100 text-purple-800',
  };

  return statusColors[status] || 'bg-gray-100 text-gray-800';
}

export function getDeliveryStatusDisplayName(status: DeliveryStatus): string {
  const statusNames: Record<DeliveryStatus, string> = {
    draft: 'Draft',
    pending_approval: 'Pending Approval',
    approved: 'Approved',
    assigned: 'Assigned',
    in_transit: 'In Transit',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    disputed: 'Disputed',
  };

  return statusNames[status] || status;
}

export function getPriorityColor(priority: 'low' | 'medium' | 'high' | 'urgent'): string {
  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };

  return priorityColors[priority] || 'bg-gray-100 text-gray-800';
}

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
}

export function generateId(prefix = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}${prefix ? '_' : ''}${timestamp}_${random}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'absolute';
    textArea.style.left = '-999999px';
    document.body.prepend(textArea);
    textArea.select();

    try {
      document.execCommand('copy');
    } catch (error) {
      console.error('Failed to copy text: ', error);
    } finally {
      textArea.remove();
    }

    return Promise.resolve();
  }
}

export function formatAddress(address: string, length = 8): string {
  if (!address) return '';
  if (address.length <= length * 2) return address;
  return `${address.slice(0, length)}...${address.slice(-length)}`;
}
