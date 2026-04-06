import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Card, CardContent } from './ui/card';
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2, X, Info } from 'lucide-react';
import { useBulkUpdateDrugTableStore, useGetDrugTableVerificationReport, useGetDrugTableLastRefreshTimestamp } from '../hooks/useQueries';
import { parseJSONDataset, parseCSVDataset, validateDataset, ParsedDrugDataset } from '../services/drugDatasetImport';
import { Drug } from '../backend';

interface DrugBulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DrugBulkImportDialog({ open, onOpenChange }: DrugBulkImportDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedDrugDataset | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'parsing' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [backendResult, setBackendResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bulkUpdateMutation = useBulkUpdateDrugTableStore();
  const { data: verificationReport } = useGetDrugTableVerificationReport();
  const { data: lastRefreshTimestamp } = useGetDrugTableLastRefreshTimestamp();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadStatus('parsing');
    setErrorMessage('');
    setParsedData(null);
    setBackendResult(null);

    try {
      const content = await file.text();
      let parsed: ParsedDrugDataset;

      if (file.name.endsWith('.json')) {
        parsed = parseJSONDataset(content);
      } else if (file.name.endsWith('.csv')) {
        parsed = parseCSVDataset(content);
      } else {
        throw new Error('Unsupported file format. Please upload a JSON or CSV file.');
      }

      if (parsed.errors.length > 0) {
        setErrorMessage(`Parse errors: ${parsed.errors.join('; ')}`);
        setUploadStatus('error');
      } else {
        setParsedData(parsed);
        setUploadStatus('idle');
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to parse file');
      setUploadStatus('error');
    }
  };

  const handleUpload = async () => {
    if (!parsedData || parsedData.drugs.length === 0) {
      setErrorMessage('No valid drugs to upload');
      return;
    }

    setUploadStatus('uploading');
    setErrorMessage('');

    try {
      const result = await bulkUpdateMutation.mutateAsync(parsedData.drugs);
      setBackendResult(result);
      setUploadStatus('success');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Upload failed';
      setErrorMessage(errorMsg);
      setUploadStatus('error');
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setParsedData(null);
    setUploadStatus('idle');
    setErrorMessage('');
    setBackendResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  const formatTimestamp = (timestamp: bigint | null | undefined) => {
    if (!timestamp) return 'Never';
    try {
      const date = new Date(Number(timestamp) / 1000000);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Not available';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Upload className="h-6 w-6 text-blue-600" />
            Bulk Import Drug Database
          </DialogTitle>
          <DialogDescription>
            Upload a JSON or CSV file to replace the entire drug database. This action requires admin privileges.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Database Status */}
          {verificationReport && (
            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="text-sm space-y-1">
                    <p className="font-medium text-blue-900 dark:text-blue-100">Current Database Status</p>
                    <p className="text-blue-700 dark:text-blue-300">
                      Total: {verificationReport.totalDrugs} drugs | 
                      Approved: {verificationReport.approvedDrugs} | 
                      Banned: {verificationReport.bannedDrugs}
                    </p>
                    <p className="text-blue-600 dark:text-blue-400 text-xs">
                      Last refresh: {formatTimestamp(lastRefreshTimestamp)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file-upload" className="text-base font-medium">
              Select File (JSON or CSV)
            </Label>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                accept=".json,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadStatus === 'parsing' || uploadStatus === 'uploading'}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Choose File
              </Button>
              {selectedFile && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
              )}
            </div>
          </div>

          {/* Parsing Status */}
          {uploadStatus === 'parsing' && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>Parsing file...</AlertDescription>
            </Alert>
          )}

          {/* Parse Results */}
          {parsedData && uploadStatus !== 'parsing' && (
            <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <p className="font-medium text-green-900 dark:text-green-100">
                      File parsed successfully
                    </p>
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <p>• Total rows parsed: {parsedData.totalParsed}</p>
                    <p>• Valid drugs: {parsedData.drugs.length}</p>
                    {parsedData.warnings.length > 0 && (
                      <p>• Warnings: {parsedData.warnings.length}</p>
                    )}
                  </div>
                  {parsedData.warnings.length > 0 && (
                    <details className="text-xs text-green-600 dark:text-green-400 mt-2">
                      <summary className="cursor-pointer">View warnings</summary>
                      <ul className="mt-1 ml-4 list-disc space-y-1">
                        {parsedData.warnings.slice(0, 10).map((warning, idx) => (
                          <li key={idx}>{warning}</li>
                        ))}
                        {parsedData.warnings.length > 10 && (
                          <li>... and {parsedData.warnings.length - 10} more</li>
                        )}
                      </ul>
                    </details>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Message */}
          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Backend Result */}
          {backendResult && uploadStatus === 'success' && (
            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      Backend Verification Summary
                    </p>
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <p>✓ Added: {Number(backendResult.added)} drugs</p>
                    <p>✓ Total in database: {Number(backendResult.totalAfterStore)} drugs</p>
                    {Number(backendResult.skippedEmpty) > 0 && (
                      <p>⚠ Skipped (empty names): {Number(backendResult.skippedEmpty)}</p>
                    )}
                    {Number(backendResult.duplicates) > 0 && (
                      <p>⚠ Duplicates handled: {Number(backendResult.duplicates)}</p>
                    )}
                  </div>
                  {backendResult.errors && backendResult.errors.length > 0 && (
                    <details className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                      <summary className="cursor-pointer">View backend messages</summary>
                      <ul className="mt-1 ml-4 list-disc space-y-1">
                        {backendResult.errors.slice(0, 10).map((error: string, idx: number) => (
                          <li key={idx}>{error}</li>
                        ))}
                        {backendResult.errors.length > 10 && (
                          <li>... and {backendResult.errors.length - 10} more</li>
                        )}
                      </ul>
                    </details>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardContent className="pt-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-2">
                File Format Requirements:
              </p>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 ml-4 list-disc">
                <li>JSON: Array of drug objects with fields: name, status, category, description, source, safetyInfo</li>
                <li>CSV: Header row with columns: name, status, category, description, source, safetyInfo</li>
                <li>Required fields: name (string), status ("approved" or "banned")</li>
                <li>Optional fields: category, description, source, safetyInfo, date</li>
                <li>Backend will deduplicate by normalized name and validate all entries</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={uploadStatus === 'uploading'}
          >
            {uploadStatus === 'success' ? 'Close' : 'Cancel'}
          </Button>
          {uploadStatus !== 'success' && (
            <Button
              onClick={handleUpload}
              disabled={!parsedData || parsedData.drugs.length === 0 || uploadStatus === 'uploading'}
              className="flex items-center gap-2"
            >
              {uploadStatus === 'uploading' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload & Replace Database
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
