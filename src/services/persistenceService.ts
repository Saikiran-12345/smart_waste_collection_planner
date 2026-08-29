import { loadRepo, saveRepo } from '../repository/repository';

/**
 * Service for backing up, restoring, and clearing local database/repo.
 */
export const persistenceService = {
  /**
   * Export the entire local database state as a JSON string.
   */
  async exportBackup(): Promise<string> {
    const data = await loadRepo();
    return JSON.stringify(data, null, 2);
  },

  /**
   * Import database state from a JSON string.
   */
  async importBackup(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString);
      if (typeof data !== 'object' || data === null) {
        throw new Error('Invalid JSON backup format');
      }
      await saveRepo(data);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  },

  /**
   * Reset/clear the database back to default empty state.
   */
  async clearAllData(): Promise<void> {
    await saveRepo({});
  },
};
