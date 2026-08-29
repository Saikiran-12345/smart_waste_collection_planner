import fs from 'fs';
import path from 'path';

const baseDir = 'd:/company_projects/SMART WASTE COLLECTION PLANNER/src/services';
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

// Helper to write a large TS seed file with unique coordinates and realistic names
function generateSeedAreas() {
  const target = path.join(baseDir, 'seedAreasData.ts');
  let content = `import type { Area } from '../types/Area';\n\n`;
  content += `export const SEED_AREAS: Area[] = [\n`;
  
  for (let i = 1; i <= 2000; i++) {
    const lat = 12.9 + (i * 0.0001);
    const lon = 77.5 + (i * 0.0001);
    content += `  {\n`;
    content += `    id: 'area-${i}',\n`;
    content += `    name: 'District Zone Sector ${i}',\n`;
    content += `    zone: 'Zone-${(i % 10) + 1}',\n`;
    content += `    description: 'Waste management sector for zone ${i} with demographic population estimate.',\n`;
    content += `    populationEstimate: ${2000 + (i % 50) * 120},\n`;
    content += `    collectionPointCount: 0,\n`;
    content += `    status: '${i % 20 === 0 ? 'INACTIVE' : 'ACTIVE'}',\n`;
    content += `    priority: '${i % 3 === 0 ? 'HIGH' : i % 3 === 1 ? 'MEDIUM' : 'LOW'}',\n`;
    content += `    createdDate: '${new Date(2026, 0, (i % 28) + 1).toISOString().split('T')[0]}',\n`;
    content += `    latitude: ${parseFloat(lat.toFixed(6))},\n`;
    content += `    longitude: ${parseFloat(lon.toFixed(6))}\n`;
    content += `  },\n`;
  }
  content += `];\n`;
  fs.writeFileSync(target, content, 'utf-8');
  console.log(`Generated ${target}`);
}

function generateSeedPoints() {
  const target = path.join(baseDir, 'seedPointsData.ts');
  let content = `import type { CollectionPoint } from '../types/CollectionPoint';\n\n`;
  content += `export const SEED_POINTS: CollectionPoint[] = [\n`;
  
  for (let i = 1; i <= 3500; i++) {
    const lat = 12.97 + (i * 0.00005);
    const lon = 77.59 + (i * 0.00005);
    content += `  {\n`;
    content += `    id: 'point-${i}',\n`;
    content += `    name: 'Collection Point Bin Road #${i}',\n`;
    content += `    latitude: ${parseFloat(lat.toFixed(6))},\n`;
    content += `    longitude: ${parseFloat(lon.toFixed(6))},\n`;
    content += `    areaId: 'area-${(i % 100) + 1}',\n`;
    content += `    status: '${i % 15 === 0 ? 'inactive' : 'active'}',\n`;
    content += `    capacity: ${100 + (i % 5) * 50}\n`;
    content += `  },\n`;
  }
  content += `];\n`;
  fs.writeFileSync(target, content, 'utf-8');
  console.log(`Generated ${target}`);
}

function generateSeedRecords() {
  const target = path.join(baseDir, 'seedRecordsData.ts');
  let content = `import type { WasteRecord } from '../types/WasteRecord';\n\n`;
  content += `export const SEED_RECORDS: WasteRecord[] = [\n`;
  
  const cats = ['GENERAL', 'RECYCLABLE', 'ORGANIC', 'PLASTIC', 'PAPER', 'GLASS', 'ELECTRONIC'];
  for (let i = 1; i <= 4000; i++) {
    content += `  {\n`;
    content += `    id: 'record-${i}',\n`;
    content += `    collectionPointId: 'point-${(i % 500) + 1}',\n`;
    content += `    date: '2026-08-${String((i % 28) + 1).padStart(2, '0')}',\n`;
    content += `    time: '${String(8 + (i % 10)).padStart(2, '0')}:${String((i * 12) % 60).padStart(2, '0')}',\n`;
    content += `    levelPercentage: ${20 + (i % 75)},\n`;
    content += `    category: '${cats[i % cats.length]}',\n`;
    content += `    recordedBy: 'operator'\n`;
    content += `  },\n`;
  }
  content += `];\n`;
  fs.writeFileSync(target, content, 'utf-8');
  console.log(`Generated ${target}`);
}

function generateSeedComplaints() {
  const target = path.join(baseDir, 'seedComplaintsData.ts');
  let content = `import type { Complaint } from '../types/Complaint';\n\n`;
  content += `export const SEED_COMPLAINTS: Complaint[] = [\n`;
  
  const types = ['MISSED_COLLECTION', 'OVERFLOWING_BIN', 'DAMAGED_BIN', 'BAD_SCHEDULE', 'OTHER'];
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const statuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
  
  for (let i = 1; i <= 2500; i++) {
    content += `  {\n`;
    content += `    id: 'complaint-${i}',\n`;
    content += `    areaId: 'area-${(i % 100) + 1}',\n`;
    content += `    collectionPointId: 'point-${(i % 200) + 1}',\n`;
    content += `    type: '${types[i % types.length]}',\n`;
    content += `    description: 'Citizen filed report of service issue in collection sector area ${i}.',\n`;
    content += `    date: '2026-08-${String((i % 28) + 1).padStart(2, '0')}',\n`;
    content += `    priority: '${priorities[i % priorities.length]}',\n`;
    content += `    status: '${statuses[i % statuses.length]}',\n`;
    content += `    assignedOperator: 'operator'\n`;
    content += `  },\n`;
  }
  content += `];\n`;
  fs.writeFileSync(target, content, 'utf-8');
  console.log(`Generated ${target}`);
}

generateSeedAreas();
generateSeedPoints();
generateSeedRecords();
generateSeedComplaints();
