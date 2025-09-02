import { Test, TestResult } from '@/types';
import { testStorage, resultStorage } from './storage';

export interface BackupData {
  version: string;
  timestamp: string;
  tests: Test[];
  results: TestResult[];
}

export const backupSystem = {
  // Export all data as JSON file
  exportData: (): void => {
    try {
      const tests = testStorage.getAll();
      const results = resultStorage.getAll();
      
      const backupData: BackupData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        tests,
        results
      };
      
      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `smartbuds-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    }
  },

  // Import data from JSON file
  importData: (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const backupData: BackupData = JSON.parse(e.target?.result as string);
          
          // Validate backup data
          if (!backupData.tests || !backupData.results) {
            throw new Error('Invalid backup file format');
          }
          
          // Clear existing data
          localStorage.removeItem('smartbuds_tests');
          localStorage.removeItem('smartbuds_results');
          
          // Import tests
          backupData.tests.forEach(test => {
            testStorage.save(test);
          });
          
          // Import results
          backupData.results.forEach(result => {
            resultStorage.save(result);
          });
          
          resolve();
        } catch (error) {
          console.error('Error importing data:', error);
          reject(new Error('Failed to import backup file. Please check the file format.'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read backup file.'));
      };
      
      reader.readAsText(file);
    });
  },

  // Get backup info
  getBackupInfo: (): { testCount: number; resultCount: number; lastBackup?: string } => {
    const tests = testStorage.getAll();
    const results = resultStorage.getAll();
    
    return {
      testCount: tests.length,
      resultCount: results.length,
      lastBackup: localStorage.getItem('smartbuds_last_backup') || undefined
    };
  },

  // Auto-backup to cloud storage (simulated)
  autoBackup: (): void => {
    try {
      const tests = testStorage.getAll();
      const results = resultStorage.getAll();
      
      // Simulate cloud backup (in real app, this would upload to cloud storage)
      const backupData: BackupData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        tests,
        results
      };
      
      // Store backup timestamp
      localStorage.setItem('smartbuds_last_backup', new Date().toISOString());
      
      console.log('Auto-backup completed:', backupData);
    } catch (error) {
      console.error('Auto-backup failed:', error);
    }
  }
};

// Auto-backup every hour
export const setupAutoBackup = (): void => {
  if (typeof window === 'undefined') return;
  
  // Initial backup
  backupSystem.autoBackup();
  
  // Set up hourly backup
  setInterval(() => {
    backupSystem.autoBackup();
  }, 60 * 60 * 1000); // 1 hour
}; 