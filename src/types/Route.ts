export interface Route {
  id: string;
  areaId: string;
  vehicleId: string;
  driverId: string;
  orderedPointIds: string[]; // collection point IDs in order
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdDate: string; // ISO date
}
