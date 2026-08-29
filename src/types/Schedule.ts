export interface Schedule {
  id: string;
  areaId: string;
  collectionPointId: string;
  date: string; // ISO date
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  vehicleId: string;
  driverId: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED' | 'CANCELLED';
}
