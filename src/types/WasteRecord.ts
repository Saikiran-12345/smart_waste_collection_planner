export interface WasteRecord {
  id: string;
  collectionPointId: string;
  date: string; // ISO date
  time: string; // HH:MM
  levelPercentage: number; // 0-100
  category: 'GENERAL' | 'RECYCLABLE' | 'ORGANIC' | 'PLASTIC' | 'PAPER' | 'GLASS' | 'ELECTRONIC';
  recordedBy: string; // username
}
