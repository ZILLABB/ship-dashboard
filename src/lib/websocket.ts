// WebSocket mock for real-time updates

import { NotificationEvent } from '@/types';

export class MockWebSocket {
  private listeners: { [event: string]: Function[] } = {};
  private connected = false;
  private intervalId?: NodeJS.Timeout;

  constructor(private url: string) {}

  connect() {
    if (this.connected) return;
    
    this.connected = true;
    this.emit('connect');
    
    // Start sending mock events
    this.startMockEvents();
  }

  disconnect() {
    if (!this.connected) return;
    
    this.connected = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.emit('disconnect');
  }

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (!this.listeners[event]) return;
    
    const index = this.listeners[event].indexOf(callback);
    if (index > -1) {
      this.listeners[event].splice(index, 1);
    }
  }

  emit(event: string, data?: any) {
    if (!this.listeners[event]) return;
    
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('WebSocket event handler error:', error);
      }
    });
  }

  private startMockEvents() {
    // Send mock events every 10-30 seconds
    this.intervalId = setInterval(() => {
      if (!this.connected) return;
      
      const events = this.generateMockEvents();
      events.forEach(event => {
        this.emit('notification', event);
      });
    }, Math.random() * 20000 + 10000); // 10-30 seconds
  }

  private generateMockEvents(): NotificationEvent[] {
    const eventTypes = [
      'delivery_update',
      'signature_required',
      'payment_received',
      'role_assigned'
    ] as const;

    const mockEvents: NotificationEvent[] = [];
    
    // Randomly generate 0-2 events
    const numEvents = Math.floor(Math.random() * 3);
    
    for (let i = 0; i < numEvents; i++) {
      const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      
      mockEvents.push({
        id: `event_${Date.now()}_${i}`,
        type,
        title: this.getMockTitle(type),
        message: this.getMockMessage(type),
        timestamp: new Date(),
        read: false,
        actionUrl: this.getMockActionUrl(type),
        metadata: {
          deliveryId: type === 'delivery_update' ? `delivery_${Math.floor(Math.random() * 100)}` : undefined,
          amount: type === 'payment_received' ? Math.floor(Math.random() * 100) + 10 : undefined,
        }
      });
    }
    
    return mockEvents;
  }

  private getMockTitle(type: NotificationEvent['type']): string {
    switch (type) {
      case 'delivery_update':
        return 'Delivery Status Update';
      case 'signature_required':
        return 'Signature Required';
      case 'payment_received':
        return 'Payment Received';
      case 'role_assigned':
        return 'New Role Assigned';
      default:
        return 'Notification';
    }
  }

  private getMockMessage(type: NotificationEvent['type']): string {
    switch (type) {
      case 'delivery_update':
        const statuses = ['picked up', 'in transit', 'delivered', 'delayed'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        return `Your delivery has been ${status}`;
      case 'signature_required':
        return 'A transaction requires your signature to proceed';
      case 'payment_received':
        return 'Payment has been received for completed delivery';
      case 'role_assigned':
        return 'You have been assigned a new role in a colony';
      default:
        return 'You have a new notification';
    }
  }

  private getMockActionUrl(type: NotificationEvent['type']): string {
    switch (type) {
      case 'delivery_update':
        return '/deliveries';
      case 'signature_required':
        return '/pending';
      case 'payment_received':
        return '/dashboard';
      case 'role_assigned':
        return '/colonies';
      default:
        return '/dashboard';
    }
  }
}

// Global WebSocket instance
let wsInstance: MockWebSocket | null = null;

export function getWebSocket(): MockWebSocket {
  if (!wsInstance) {
    wsInstance = new MockWebSocket('ws://localhost:3001/ws');
  }
  return wsInstance;
}

export function useWebSocket() {
  const ws = getWebSocket();
  
  return {
    connect: () => ws.connect(),
    disconnect: () => ws.disconnect(),
    on: (event: string, callback: Function) => ws.on(event, callback),
    off: (event: string, callback: Function) => ws.off(event, callback),
  };
}
