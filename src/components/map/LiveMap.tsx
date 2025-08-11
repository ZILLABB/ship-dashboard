// Live map component for tracking deliveries

'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Truck, Package, Navigation, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  type: 'pickup' | 'delivery' | 'operator' | 'warehouse';
  title: string;
  status?: string;
  operatorId?: string;
  deliveryId?: string;
}

interface LiveMapProps {
  markers?: MapMarker[];
  selectedDelivery?: string;
  onMarkerClick?: (marker: MapMarker) => void;
  className?: string;
}

export function LiveMap({ 
  markers = [], 
  selectedDelivery,
  onMarkerClick,
  className = '' 
}: LiveMapProps) {
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 }); // NYC default
  const [zoom, setZoom] = useState(12);

  // Mock markers for demonstration
  const defaultMarkers: MapMarker[] = [
    {
      id: 'pickup_1',
      lat: 40.7128,
      lng: -74.0060,
      type: 'pickup',
      title: 'Legal Documents Pickup',
      deliveryId: 'delivery_1'
    },
    {
      id: 'delivery_1',
      lat: 40.7589,
      lng: -73.9851,
      type: 'delivery',
      title: 'City Hall Delivery',
      deliveryId: 'delivery_1'
    },
    {
      id: 'operator_1',
      lat: 40.7300,
      lng: -73.9950,
      type: 'operator',
      title: 'Operator #1',
      status: 'in_transit',
      operatorId: 'addr_test1qp0dispatch123456789ab...',
      deliveryId: 'delivery_1'
    },
    {
      id: 'warehouse_1',
      lat: 40.7200,
      lng: -74.0100,
      type: 'warehouse',
      title: 'Downtown Warehouse',
    }
  ];

  const allMarkers = markers.length > 0 ? markers : defaultMarkers;

  const getMarkerIcon = (type: string) => {
    switch (type) {
      case 'pickup':
        return <Package className="w-4 h-4 text-blue-600" />;
      case 'delivery':
        return <MapPin className="w-4 h-4 text-green-600" />;
      case 'operator':
        return <Truck className="w-4 h-4 text-orange-600" />;
      case 'warehouse':
        return <Navigation className="w-4 h-4 text-purple-600" />;
      default:
        return <MapPin className="w-4 h-4 text-gray-600" />;
    }
  };

  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'pickup':
        return 'bg-blue-100 border-blue-300';
      case 'delivery':
        return 'bg-green-100 border-green-300';
      case 'operator':
        return 'bg-orange-100 border-orange-300';
      case 'warehouse':
        return 'bg-purple-100 border-purple-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker);
    onMarkerClick?.(marker);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Map Container */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Live Delivery Map
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Zap className="w-4 h-4 mr-2" />
                Real-time
              </Button>
              <Button variant="outline" size="sm">
                Center Map
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Map Placeholder */}
          <div className="relative bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg h-96 overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-20">
              <div className="grid grid-cols-8 grid-rows-6 h-full">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div key={i} className="border border-gray-300"></div>
                ))}
              </div>
            </div>
            
            {/* Map Markers */}
            <div className="absolute inset-0">
              {allMarkers.map((marker, index) => {
                const x = ((marker.lng + 74.0200) / 0.0400) * 100; // Normalize to 0-100%
                const y = ((40.7700 - marker.lat) / 0.0600) * 100; // Normalize to 0-100%
                
                return (
                  <div
                    key={marker.id}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-110 ${
                      selectedMarker?.id === marker.id ? 'scale-125 z-10' : 'z-0'
                    }`}
                    style={{ 
                      left: `${Math.max(5, Math.min(95, x))}%`, 
                      top: `${Math.max(5, Math.min(95, y))}%` 
                    }}
                    onClick={() => handleMarkerClick(marker)}
                  >
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg ${getMarkerColor(marker.type)}`}>
                      {getMarkerIcon(marker.type)}
                    </div>
                    
                    {/* Marker Label */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1">
                      <div className="bg-white px-2 py-1 rounded shadow-md text-xs font-medium whitespace-nowrap">
                        {marker.title}
                      </div>
                    </div>
                    
                    {/* Pulse animation for active operators */}
                    {marker.type === 'operator' && marker.status === 'in_transit' && (
                      <div className="absolute inset-0 rounded-full border-2 border-orange-400 animate-ping"></div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Map Integration Notice */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md">
              <p className="text-xs text-gray-600">
                🗺️ Integrate with Mapbox, Google Maps, or OpenStreetMap for production
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center">
                <Package className="w-2 h-2 text-blue-600" />
              </div>
              <span className="text-sm text-gray-600">Pickup Location</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-100 border border-green-300 flex items-center justify-center">
                <MapPin className="w-2 h-2 text-green-600" />
              </div>
              <span className="text-sm text-gray-600">Delivery Location</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-100 border border-orange-300 flex items-center justify-center">
                <Truck className="w-2 h-2 text-orange-600" />
              </div>
              <span className="text-sm text-gray-600">Active Operator</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-purple-100 border border-purple-300 flex items-center justify-center">
                <Navigation className="w-2 h-2 text-purple-600" />
              </div>
              <span className="text-sm text-gray-600">Warehouse</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Selected Marker Details */}
      {selectedMarker && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Marker Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {getMarkerIcon(selectedMarker.type)}
                <span className="font-medium">{selectedMarker.title}</span>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>Type: {selectedMarker.type}</p>
                <p>Coordinates: {selectedMarker.lat.toFixed(4)}, {selectedMarker.lng.toFixed(4)}</p>
                
                {selectedMarker.status && (
                  <p>Status: {selectedMarker.status}</p>
                )}
                
                {selectedMarker.deliveryId && (
                  <p>Delivery ID: {selectedMarker.deliveryId}</p>
                )}
                
                {selectedMarker.operatorId && (
                  <p>Operator: {selectedMarker.operatorId.slice(0, 20)}...</p>
                )}
              </div>
              
              <div className="pt-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedMarker(null)}>
                  Close Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default LiveMap;
