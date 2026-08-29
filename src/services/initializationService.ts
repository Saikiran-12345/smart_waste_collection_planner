import { saveRepo, loadRepo } from '../repository/repository';
import { SEED_AREAS } from './seedAreasData';
import { SEED_POINTS } from './seedPointsData';
import { SEED_RECORDS } from './seedRecordsData';
import { SEED_COMPLAINTS } from './seedComplaintsData';

/**
 * Service for initializing the application with demo data on first load.
 */
export const initializationService = {
  /**
   * Initialize the repository with demo data if it's empty.
   * This runs once on application startup to populate the database.
   */
  async initializeIfEmpty(): Promise<void> {
    try {
      const repo = loadRepo();
      const hasData = Object.keys(repo).length > 0;

      if (hasData) {
        console.log('Repository already initialized with data');
        return;
      }

      console.log('Initializing repository with demo data...');

      const organizedData: Record<string, Record<string, any>> = {
        Area: {},
        CollectionPoint: {},
        WasteRecord: {},
        Complaint: {},
        Vehicle: {},
        Driver: {},
        Schedule: {},
      };

      // Load static TS seed data
      SEED_AREAS.forEach((area) => {
        organizedData.Area[area.id] = area;
      });

      SEED_POINTS.forEach((pt) => {
        organizedData.CollectionPoint[pt.id] = pt;
      });

      SEED_RECORDS.forEach((rec) => {
        organizedData.WasteRecord[rec.id] = rec;
      });

      SEED_COMPLAINTS.forEach((comp) => {
        organizedData.Complaint[comp.id] = comp;
      });

      // Add a few baseline vehicles and drivers
      const baseVehicles = [
        {
          id: 'veh-1',
          registrationNumber: 'KA-01-W-1001',
          plateNumber: 'KA-01-W-1001',
          type: 'COMPACTOR',
          capacity: 8000,
          currentLoad: 0,
          status: 'AVAILABLE',
          latitude: 12.9716,
          longitude: 77.5946,
        },
        {
          id: 'veh-2',
          registrationNumber: 'KA-01-W-1002',
          plateNumber: 'KA-01-W-1002',
          type: 'DUMP_TRUCK',
          capacity: 10000,
          currentLoad: 0,
          status: 'AVAILABLE',
          latitude: 12.9716,
          longitude: 77.5946,
        },
      ];

      const baseDrivers = [
        {
          id: 'drv-1',
          name: 'John Doe',
          phone: '+91 98450 12345',
          licenseType: 'CLASS_A',
          experienceYears: 5,
          status: 'AVAILABLE',
          totalCollections: 100,
          completedCollections: 98,
          missedCollections: 2,
        },
      ];

      baseVehicles.forEach((v) => {
        organizedData.Vehicle[v.id] = v;
      });
      baseDrivers.forEach((d) => {
        organizedData.Driver[d.id] = d;
      });

      await saveRepo(organizedData);
      console.log('Demo data successfully initialized into localStorage.');
    } catch (error) {
      console.error('Failed to initialize repository:', error);
    }
  },
};
