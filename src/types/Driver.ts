export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseType: string;
  experienceYears: number;
  assignedVehicleId?: string;
  status: 'AVAILABLE' | 'ASSIGNED' | 'OFF_DUTY';
  totalCollections: number;
  completedCollections: number;
  missedCollections: number;
}
