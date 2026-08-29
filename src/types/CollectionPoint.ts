export interface CollectionPoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  areaId: string;
  status: 'active' | 'inactive';
  capacity: number; // in kilograms per collection
}

