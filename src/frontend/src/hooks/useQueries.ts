import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import {
  Patient,
  LabResults,
  Medication,
  AdverseDrugReaction,
  UserProfile,
  ChatMessage,
  RestrictedDrugCategory,
  PrescriptionImage,
  CaseNarration,
  ExternalResource,
  DrugInteraction,
  FourDrugInteractionInput,
  FourDrugInteractionOutput,
  Drug,
  CategorizedDrugs,
  DrugSafetyAdvisory,
  PrescriberDetails,
} from '../backend';
import { multiSourceDrugService } from '../services/multiSourceDrugService';

// Patient queries
export function useGetAllPatients() {
  const { actor, isFetching } = useActor();

  return useQuery<Patient[]>({
    queryKey: ['patients'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPatients();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPatient(patientId: string) {
  const { data: patients = [] } = useGetAllPatients();
  return {
    data: patients.find((p) => p.patientId === patientId),
    isLoading: false,
  };
}

export function useAddPatient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patient: {
      name: string;
      age: bigint;
      gender: string;
      height: number;
      weight: number;
      nationality: string;
      address: string | null;
      phone: string | null;
      bloodGroup: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addNewPatient(
        patient.name,
        patient.age,
        patient.gender,
        patient.height,
        patient.weight,
        patient.nationality,
        patient.address,
        patient.phone,
        patient.bloodGroup
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export function useDeletePatient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patientId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deletePatient(patientId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

// Lab Results queries
export function useGetAllLabResults() {
  const { actor, isFetching } = useActor();
  const { data: patients = [] } = useGetAllPatients();

  return useQuery<LabResults[]>({
    queryKey: ['labResults'],
    queryFn: async () => {
      if (!actor || patients.length === 0) return [];
      const results = await Promise.all(
        patients.map((p) => actor.getLabResultsByPatient(p.patientId))
      );
      return results.flat();
    },
    enabled: !!actor && !isFetching && patients.length > 0,
  });
}

export function useAddLabResults() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      patientId: string;
      uricAcid: number | null;
      creatinine: number | null;
      bloodPressureSystolic: bigint | null;
      bloodPressureDiastolic: bigint | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addLabResults(
        data.patientId,
        data.uricAcid,
        data.creatinine,
        data.bloodPressureSystolic,
        data.bloodPressureDiastolic
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labResults'] });
    },
  });
}

// Medication queries
export function useGetAllMedications() {
  const { actor, isFetching } = useActor();
  const { data: patients = [] } = useGetAllPatients();

  return useQuery<Medication[]>({
    queryKey: ['medications'],
    queryFn: async () => {
      if (!actor || patients.length === 0) return [];
      const results = await Promise.all(
        patients.map((p) => actor.getMedicationsByPatient(p.patientId))
      );
      return results.flat();
    },
    enabled: !!actor && !isFetching && patients.length > 0,
  });
}

export function useAddMedication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      patientId: string;
      name: string;
      dosage: string | null;
      frequency: string | null;
      startDate: bigint | null;
      endDate: bigint | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addMedication(
        data.patientId,
        data.name,
        data.dosage,
        data.frequency,
        data.startDate,
        data.endDate
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });
}

// ADR queries
export function useGetAllAdrs() {
  const { actor, isFetching } = useActor();
  const { data: patients = [] } = useGetAllPatients();

  return useQuery<AdverseDrugReaction[]>({
    queryKey: ['adrs'],
    queryFn: async () => {
      if (!actor || patients.length === 0) return [];
      const results = await Promise.all(
        patients.map((p) => actor.getADRsByPatient(p.patientId))
      );
      return results.flat();
    },
    enabled: !!actor && !isFetching && patients.length > 0,
  });
}

export function useAddAdr() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      patientId: string;
      description: string;
      severity: string;
      suspectedDrug: string;
      onsetDate: bigint | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addADR(
        data.patientId,
        data.description,
        data.severity,
        data.suspectedDrug,
        data.onsetDate
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adrs'] });
    },
  });
}

// User Profile queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Chat queries
export function useGetChatMessages() {
  const { actor, isFetching } = useActor();

  return useQuery<ChatMessage[]>({
    queryKey: ['chatMessages'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getChatMessages();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddChatMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { sender: string; message: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addChatMessage(data.sender, data.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages'] });
    },
  });
}

// Restricted Drugs queries
export function useGetRestrictedDrugCategories() {
  const { actor, isFetching } = useActor();

  return useQuery<RestrictedDrugCategory[]>({
    queryKey: ['restrictedDrugCategories'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRestrictedDrugCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

// Prescription Image queries
export function useGetPrescriptionImages(patientId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<PrescriptionImage[]>({
    queryKey: ['prescriptionImages', patientId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPrescriptionImagesByPatient(patientId);
    },
    enabled: !!actor && !isFetching && !!patientId,
  });
}

export function useAddPrescriptionImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { patientId: string; imageUrl: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addPrescriptionImage(data.patientId, data.imageUrl);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['prescriptionImages', variables.patientId],
      });
    },
  });
}

// Case Narration queries
export function useGetCaseNarrations(patientId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<CaseNarration[]>({
    queryKey: ['caseNarrations', patientId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCaseNarrationsByPatient(patientId);
    },
    enabled: !!actor && !isFetching && !!patientId,
  });
}

export function useAddCaseNarration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { patientId: string; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addCaseNarration(data.patientId, data.content);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['caseNarrations', variables.patientId],
      });
    },
  });
}

// External Resources queries
export function useGetExternalResources() {
  const { actor, isFetching } = useActor();

  return useQuery<ExternalResource[]>({
    queryKey: ['externalResources'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getExternalResources();
    },
    enabled: !!actor && !isFetching,
  });
}

// Drug Interaction queries
export function useCheckDrugInteraction() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (data: { drug1: string; drug2: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.checkDrugInteraction(data.drug1, data.drug2);
    },
  });
}

export function useCheckFourDrugInteraction() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (input: FourDrugInteractionInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.checkFourDrugInteraction(input);
    },
  });
}

// Stub hooks for multi-drug, drug-food, and food-food interactions (client-side only)
// These return query-like objects with data property for compatibility with existing component usage
export function useCheckMultiDrugInteraction(_drugs?: string[]) {
  return {
    data: [] as any[],
    isPending: false,
    isLoading: false,
    error: null,
  };
}

export function useCheckDrugFoodInteractions(_drugs?: string[], _foods?: string[]) {
  return {
    data: [] as any[],
    isPending: false,
    isLoading: false,
    error: null,
  };
}

export function useCheckFoodFoodInteractions(_foods?: string[]) {
  return {
    data: [] as any[],
    isPending: false,
    isLoading: false,
    error: null,
  };
}

// Drug Database queries
export function useGetAllDrugs() {
  const { actor, isFetching } = useActor();

  return useQuery<Drug[]>({
    queryKey: ['allDrugs'],
    queryFn: async () => {
      if (!actor) return [];
      // Use the service's getCachedData method
      return multiSourceDrugService.getCachedData();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCategorizedDrugs() {
  const { actor, isFetching } = useActor();

  return useQuery<CategorizedDrugs>({
    queryKey: ['categorizedDrugs'],
    queryFn: async () => {
      if (!actor) {
        return {
          antibiotics: [],
          painkillers: [],
          fdcs: [],
          vitamins: [],
          others: [],
          all: [],
        };
      }
      return actor.getCategorizedDrugs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchDrugs() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (searchQuery: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.searchDrugs(searchQuery);
    },
  });
}

export function useGetDrugSafetyAdvisory() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (data: {
      drug1: string;
      drug2: string;
      drug3: string;
      drug4: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDrugSafetyAdvisory(
        data.drug1,
        data.drug2,
        data.drug3,
        data.drug4
      );
    },
  });
}

// Multi-source drug service hooks (client-side)
export function useGetMultiSourceLastUpdated() {
  return useQuery({
    queryKey: ['multiSourceLastUpdated'],
    queryFn: () => {
      return multiSourceDrugService.getLastUpdated();
    },
  });
}

export function useGetMultiSourceSyncStatus() {
  return useQuery({
    queryKey: ['multiSourceSyncStatus'],
    queryFn: () => {
      return multiSourceDrugService.getSyncStatus();
    },
  });
}

export function useRefreshMultiSourceData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await multiSourceDrugService.refresh();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allDrugs'] });
      queryClient.invalidateQueries({ queryKey: ['multiSourceLastUpdated'] });
      queryClient.invalidateQueries({ queryKey: ['multiSourceSyncStatus'] });
    },
  });
}

// Drug-Drug Interaction Database hook (client-side stub)
export function useGetDrugDrugInteractionData() {
  return useQuery({
    queryKey: ['drugDrugInteractionData'],
    queryFn: async () => {
      // Return empty array as stub - this would normally fetch from a service
      return [] as any[];
    },
  });
}

// Prescriber Details queries
export function useGetPrescriberDetails(patientId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<PrescriberDetails | null>({
    queryKey: ['prescriberDetails', patientId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPrescriberDetailsByPatientId(patientId);
    },
    enabled: !!actor && !isFetching && !!patientId,
  });
}

export function useSavePrescriberDetails() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      patientId: string;
      details: PrescriberDetails;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.savePrescriberDetailsForPatient(data.patientId, data.details);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['prescriberDetails', variables.patientId],
      });
    },
  });
}
