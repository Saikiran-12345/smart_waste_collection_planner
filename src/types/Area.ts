export interface Area {
  id: string;
  name: string;
  zone: string;
  description?: string;
  populationEstimate: number;
  collectionPointCount: number;
  status: 'ACTIVE' | 'INACTIVE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdDate: string; // ISO date
  latitude: number;
  longitude: number;
}
