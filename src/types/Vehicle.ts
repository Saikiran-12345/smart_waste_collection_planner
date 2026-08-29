export interface Vehicle {
  id: string;
  registrationNumber: string;
  plateNumber: string; // compatibility field
  type: 'COMPACTOR' | 'DUMP_TRUCK' | 'RECYCLING_TRUCK' | 'SMALL_COLLECTION_VEHICLE' | 'REAR_LOADER' | 'SIDE_LOADER' | 'FRONT_LOADER' | 'ROLL_OFF';
  capacity: number; // max waste weight or volume
  currentLoad: number; // current waste weight loaded
  fuelType?: 'DIESEL' | 'ELECTRIC' | 'HYBRID' | 'GAS';
  fuelLevel?: number;
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE' | 'AVAILABLE' | 'ASSIGNED' | 'IN_SERVICE';
  driverId?: string;
  currentRouteId?: string;
  lastMaintenance?: string; // ISO date
  nextMaintenance?: string; // ISO date
  latitude: number;
  longitude: number;
  lastServiceDate?: string;
}
