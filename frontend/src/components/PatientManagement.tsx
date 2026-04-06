import { useState, useMemo, useCallback, memo } from 'react';
import { useGetAllPatients, useDeletePatient } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { Plus, Trash2, Eye } from 'lucide-react';
import AddPatientDialog from './AddPatientDialog';
import PatientDetailsDialog from './PatientDetailsDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import type { Patient } from '../backend';

interface PatientManagementProps {
  onSelectPatient: (patientId: string) => void;
}

// Memoized BMI category calculator
const getBmiCategory = (bmi: number) => {
  if (bmi < 18.5) return { label: 'Underweight', variant: 'secondary' as const };
  if (bmi < 25) return { label: 'Normal', variant: 'default' as const };
  if (bmi < 30) return { label: 'Overweight', variant: 'secondary' as const };
  return { label: 'Obese', variant: 'destructive' as const };
};

// Memoized patient row component to prevent unnecessary re-renders
const PatientRow = memo(({ 
  patient, 
  onViewDetails, 
  onSelect, 
  onDelete 
}: { 
  patient: Patient;
  onViewDetails: (id: string) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const bmiCategory = useMemo(() => getBmiCategory(patient.bmi), [patient.bmi]);
  
  const handleViewDetails = useCallback(() => {
    onViewDetails(patient.patientId);
  }, [patient.patientId, onViewDetails]);
  
  const handleSelect = useCallback(() => {
    onSelect(patient.patientId);
  }, [patient.patientId, onSelect]);
  
  const handleDelete = useCallback(() => {
    onDelete(patient.patientId);
  }, [patient.patientId, onDelete]);

  return (
    <TableRow className="transition-colors hover:bg-muted/50">
      <TableCell className="font-mono text-xs">{patient.patientId}</TableCell>
      <TableCell className="font-medium">{patient.name}</TableCell>
      <TableCell>{Number(patient.age)}</TableCell>
      <TableCell>{patient.gender}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span>{patient.bmi.toFixed(1)}</span>
          <Badge variant={bmiCategory.variant} className="text-xs">
            {bmiCategory.label}
          </Badge>
        </div>
      </TableCell>
      <TableCell>{patient.nationality}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleViewDetails}
            className="transition-all hover:scale-105"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleSelect}
            className="transition-all hover:scale-105"
          >
            Select
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDelete}
            className="transition-all hover:scale-105"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

PatientRow.displayName = 'PatientRow';

export default function PatientManagement({ onSelectPatient }: PatientManagementProps) {
  const { data: patients = [], isLoading } = useGetAllPatients();
  const deletePatient = useDeletePatient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<string | null>(null);

  // Memoized handlers to prevent unnecessary re-renders
  const handleDelete = useCallback((patientId: string) => {
    setPatientToDelete(patientId);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (patientToDelete) {
      deletePatient.mutate(patientToDelete);
      setDeleteDialogOpen(false);
      setPatientToDelete(null);
    }
  }, [patientToDelete, deletePatient]);

  const handleViewDetails = useCallback((patientId: string) => {
    setSelectedPatientId(patientId);
    setShowDetailsDialog(true);
  }, []);

  const handleOpenAddDialog = useCallback(() => {
    setShowAddDialog(true);
  }, []);

  const handleCloseAddDialog = useCallback((open: boolean) => {
    setShowAddDialog(open);
  }, []);

  const handleCloseDetailsDialog = useCallback((open: boolean) => {
    setShowDetailsDialog(open);
  }, []);

  const handleCloseDeleteDialog = useCallback((open: boolean) => {
    setDeleteDialogOpen(open);
  }, []);

  // Memoized sorted patients list
  const sortedPatients = useMemo(() => {
    return [...patients].sort((a, b) => a.name.localeCompare(b.name));
  }, [patients]);

  return (
    <>
      <Card className="transition-shadow hover:shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Patient Registry</CardTitle>
              <CardDescription>View and manage patient records</CardDescription>
            </div>
            <Button onClick={handleOpenAddDialog} className="transition-all hover:scale-105">
              <Plus className="mr-2 h-4 w-4" />
              Add Patient
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : sortedPatients.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No patients registered yet</p>
              <Button onClick={handleOpenAddDialog} variant="outline" className="mt-4 transition-all hover:scale-105">
                <Plus className="mr-2 h-4 w-4" />
                Add First Patient
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>BMI</TableHead>
                    <TableHead>Nationality</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPatients.map((patient) => (
                    <PatientRow
                      key={patient.patientId}
                      patient={patient}
                      onViewDetails={handleViewDetails}
                      onSelect={onSelectPatient}
                      onDelete={handleDelete}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddPatientDialog open={showAddDialog} onOpenChange={handleCloseAddDialog} />
      
      {selectedPatientId && (
        <PatientDetailsDialog
          open={showDetailsDialog}
          onOpenChange={handleCloseDetailsDialog}
          patientId={selectedPatientId}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={handleCloseDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the patient and all associated records (lab results, medications, ADRs).
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
