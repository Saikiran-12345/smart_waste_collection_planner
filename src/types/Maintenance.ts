export interface Maintenance {
  id: string;
  vehicleId: string;
  type: 'ROUTINE' | 'REPAIR' | 'INSPECTION' | 'EMERGENCY';
  date: string; // ISO date
  cost: number;
  description: string;
  nextMaintenanceDate: string; // ISO date
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
}
