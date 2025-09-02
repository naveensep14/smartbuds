'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, Database, AlertTriangle, CheckCircle } from 'lucide-react';
import { backupSystem, BackupData } from '@/lib/backup';

interface BackupManagerProps {
  onClose: () => void;
}

export default function BackupManager({ onClose }: BackupManagerProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const backupInfo = backupSystem.getBackupInfo();

  const handleExport = () => {
    backupSystem.exportData();
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus('idle');
    setErrorMessage('');

    try {
      await backupSystem.importData(file);
      setImportStatus('success');
      setTimeout(() => {
        window.location.reload(); // Reload to show imported data
      }, 2000);
    } catch (error) {
      setImportStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Backup & Restore</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Current Data Status */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Current Data</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Tests</p>
                <p className="text-xl font-bold text-gray-800">{backupInfo.testCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Results</p>
                <p className="text-xl font-bold text-gray-800">{backupInfo.resultCount}</p>
              </div>
            </div>
            {backupInfo.lastBackup && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Last backup: {new Date(backupInfo.lastBackup).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Export Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Export Data</h3>
            <p className="text-gray-600 mb-4">
              Download a backup file containing all your tests and results. 
              This file can be used to restore your data on another device.
            </p>
            <button
              onClick={handleExport}
              className="btn-primary flex items-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>Export Backup</span>
            </button>
          </div>

          {/* Import Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Import Data</h3>
            <p className="text-gray-600 mb-4">
              Restore your data from a backup file. This will replace all current data.
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            
            <button
              onClick={triggerFileInput}
              disabled={isImporting}
              className="btn-secondary flex items-center space-x-2 disabled:opacity-50"
            >
              <Upload className="w-5 h-5" />
              <span>{isImporting ? 'Importing...' : 'Import Backup'}</span>
            </button>

            {/* Import Status */}
            {importStatus === 'success' && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800">Import successful! Reloading...</span>
              </div>
            )}

            {importStatus === 'error' && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-red-800">{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800">Important Notes</h4>
                <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                  <li>• Data is stored locally in your browser</li>
                  <li>• Clearing browser data will delete all tests</li>
                  <li>• Regular backups are recommended</li>
                  <li>• Importing will replace all current data</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 