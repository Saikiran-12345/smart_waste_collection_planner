export interface Notification {
  id: string;
  type: 'COLLECTION_POINT_CRITICAL' | 'COLLECTION_MISSED' | 'VEHICLE_MAINTENANCE_DUE' | 'NEW_COMPLAINT' | 'ROUTE_ASSIGNED' | 'COLLECTION_COMPLETED' | 'HIGH_PRIORITY_POINT' | 'SCHEDULE_CHANGED';
  message: string;
  date: string; // ISO timestamp
  read: boolean;
}
