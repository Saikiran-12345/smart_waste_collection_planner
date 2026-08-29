export interface Complaint {
  id: string;
  areaId: string;
  collectionPointId: string;
  type: 'MISSED_COLLECTION' | 'OVERFLOWING_BIN' | 'DAMAGED_BIN' | 'BAD_SCHEDULE' | 'OTHER';
  description: string;
  date: string; // ISO date
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  assignedOperator?: string; // username
  resolutionNotes?: string;
}
