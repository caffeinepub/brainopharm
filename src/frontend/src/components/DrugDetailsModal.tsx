import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Calendar, AlertTriangle, Info, Shield, FileText } from 'lucide-react';
import { Drug, DrugStatus, DrugSource } from '../backend';

interface DrugDetailsModalProps {
  drug: Drug | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DrugDetailsModal({ drug, isOpen, onClose }: DrugDetailsModalProps) {
  if (!drug) return null;

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getSourceLabel = (source: DrugSource): string => {
    if ('mimsIndia' in source) return 'MIMS India';
    if ('cdsco' in source) return 'CDSCO';
    if ('applicationData' in source) return 'Application Data';
    if ('other' in source) return source.other;
    return 'Not available';
  };

  const isBanned = drug.status === DrugStatus.banned;

  // Robust fallback handling for all fields
  const drugName = drug.name && drug.name.trim() !== '' ? drug.name : 'Not available';
  const drugCategory = drug.category && drug.category.trim() !== '' ? drug.category : 'Not available';
  const drugDescription = drug.description && drug.description.trim() !== '' ? drug.description : 'Not available';
  const drugSafetyInfo = drug.safetyInfo && drug.safetyInfo.trim() !== '' ? drug.safetyInfo : 'Not available';
  const drugSource = getSourceLabel(drug.source);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-900">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl text-stone-900 dark:text-stone-100">{drugName}</DialogTitle>
              <DialogDescription className="mt-1 text-stone-600 dark:text-stone-400">
                Detailed information about this drug
              </DialogDescription>
            </div>
            <Badge
              variant={isBanned ? 'destructive' : 'default'}
              className={
                isBanned
                  ? 'bg-red-600 text-white dark:bg-red-700'
                  : 'bg-emerald-600 text-white dark:bg-emerald-700'
              }
            >
              {isBanned ? 'Banned' : 'Approved'}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6 pr-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-950">
                <div className="mb-2 flex items-center gap-2 text-stone-600 dark:text-stone-400">
                  <Info className="h-4 w-4" />
                  <span className="text-sm font-medium">Category</span>
                </div>
                <p className="text-stone-900 dark:text-stone-100">{drugCategory}</p>
              </div>

              <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-950">
                <div className="mb-2 flex items-center gap-2 text-stone-600 dark:text-stone-400">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Date</span>
                </div>
                <p className="text-stone-900 dark:text-stone-100">{formatDate(drug.date)}</p>
              </div>

              <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-950">
                <div className="mb-2 flex items-center gap-2 text-stone-600 dark:text-stone-400">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">Source</span>
                </div>
                <p className="text-stone-900 dark:text-stone-100">{drugSource}</p>
              </div>

              <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-950">
                <div className="mb-2 flex items-center gap-2 text-stone-600 dark:text-stone-400">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm font-medium">Status</span>
                </div>
                <p className="text-stone-900 dark:text-stone-100">{isBanned ? 'Banned' : 'Approved'}</p>
              </div>
            </div>

            <Separator className="bg-stone-200 dark:bg-stone-800" />

            <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-950">
              <div className="mb-3 flex items-center gap-2 text-stone-900 dark:text-stone-100">
                <Info className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
                <h3 className="font-semibold">Description</h3>
              </div>
              <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">{drugDescription}</p>
            </div>

            {isBanned && (
              <>
                <Separator className="bg-stone-200 dark:bg-stone-800" />
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
                  <div className="mb-3 flex items-center gap-2 text-red-900 dark:text-red-100">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500" />
                    <h3 className="font-semibold">Ban Reason & Safety Information</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-red-800 dark:text-red-200">{drugSafetyInfo}</p>
                </div>
              </>
            )}

            {!isBanned && (
              <>
                <Separator className="bg-stone-200 dark:bg-stone-800" />
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
                  <div className="mb-3 flex items-center gap-2 text-emerald-900 dark:text-emerald-100">
                    <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
                    <h3 className="font-semibold">Safety Information</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-emerald-800 dark:text-emerald-200">{drugSafetyInfo}</p>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
