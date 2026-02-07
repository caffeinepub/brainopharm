import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { CheckCircle2, XCircle, AlertTriangle, Calendar, Tag, FileText, Shield } from 'lucide-react';
import { Drug, DrugStatus } from '../backend';

interface DrugDetailsModalProps {
  drug: Drug;
  isOpen: boolean;
  onClose: () => void;
  isNewDrug: boolean;
}

export default function DrugDetailsModal({ drug, isOpen, onClose, isNewDrug }: DrugDetailsModalProps) {
  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getSourceLabel = () => {
    if (drug.source.__kind__ === 'cdsco') return 'CDSCO Official Database';
    if (drug.source.__kind__ === 'mimsIndia') return 'MIMS India';
    if (drug.source.__kind__ === 'applicationData') return 'Application Database';
    if (drug.source.__kind__ === 'other') return drug.source.other;
    return 'Unknown Source';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-700">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                {drug.name}
                {isNewDrug && (
                  <Badge className="bg-red-600 text-white animate-pulse">
                    NEW
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription className="text-blue-700 dark:text-blue-300 mt-2">
                Comprehensive drug information and regulatory details
              </DialogDescription>
            </div>
            <div>
              {drug.status === DrugStatus.approved ? (
                <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-2 border-green-500/20 text-base px-3 py-1">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Approved
                </Badge>
              ) : (
                <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-2 border-red-500/20 text-base px-3 py-1">
                  <XCircle className="h-4 w-4 mr-1" />
                  Banned
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <Separator className="my-4 bg-blue-200 dark:bg-blue-700" />

        <div className="space-y-6">
          {/* Description */}
          {drug.description && (
            <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">Description</h3>
              </div>
              <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                {drug.description}
              </p>
            </div>
          )}

          {/* Ban Reason (if banned) */}
          {drug.status === DrugStatus.banned && (
            <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-4 border-2 border-red-300 dark:border-red-700">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <h3 className="font-semibold text-red-900 dark:text-red-100">Ban Reason</h3>
              </div>
              <p className="text-red-800 dark:text-red-200 text-sm leading-relaxed">
                {drug.safetyInfo || 'This drug has been banned by regulatory authorities due to safety concerns.'}
              </p>
            </div>
          )}

          {/* Safety Information */}
          <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 border border-amber-200 dark:border-amber-700">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">Safety Information</h3>
            </div>
            <p className="text-amber-800 dark:text-amber-200 text-sm leading-relaxed">
              {drug.safetyInfo}
            </p>
          </div>

          {/* Regulatory Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">Date</h3>
              </div>
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                {formatDate(drug.date)}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">Category</h3>
              </div>
              <Badge variant="outline" className="text-sm">
                {drug.category}
              </Badge>
            </div>
          </div>

          {/* Source Information */}
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Data Source</h3>
            </div>
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              {getSourceLabel()}
            </p>
          </div>

          {/* Disclaimer */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              <strong>Disclaimer:</strong> This information is provided for educational and research purposes only. 
              Always consult with qualified healthcare professionals before making any medical decisions. 
              The data is sourced from official regulatory databases and may be subject to updates.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
