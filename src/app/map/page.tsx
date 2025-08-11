// Live map page for operators

'use client';

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import RoleGate from '@/components/auth/RoleGate';
import LiveMap from '@/components/map/LiveMap';

export default function MapPage() {
  return (
    <AppLayout>
      <RoleGate roles={['dispatch_operator', 'reserve_operator', 'colony_owner']}>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Live Delivery Map</h1>
            <p className="text-gray-600">
              Track active deliveries and operator locations in real-time
            </p>
          </div>
          
          <LiveMap />
        </div>
      </RoleGate>
    </AppLayout>
  );
}
