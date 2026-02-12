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
  DrugVerificationResult,
  BulkDrugStoreUpdateResult,
} from '../backend';
import { MultiSourceDrugService } from '../services/multiSourceDrugService';
import { drugDrugInteractionService } from '../services/drugDrugInteractionService';
import {
  computeMultiDrugInteractions,
  computeDrugFoodInteractions,
  computeFoodFoodInteractions,
  normalizeInputsForQueryKey,
  DrugDrugInteractionResult,
  DrugFoodInteractionResult,
  FoodFoodInteractionResult,
} from '../services/localInteractionCheckService';

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

  return useQuery<LabResults[]>({
    queryKey: ['labResults'],
    queryFn: async () => {
      if (!actor) return [];
      const patients = await actor.getAllPatients();
      const allLabResults: LabResults[] = [];
      for (const patient of patients) {
        const results = await actor.getLabResultsByPatient(patient.patientId);
        allLabResults.push(...results);
      }
      return allLabResults;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddLabResults() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (labResults: {
      patientId: string;
      uricAcid: number | null;
      creatinine: number | null;
      bloodPressureSystolic: bigint | null;
      bloodPressureDiastolic: bigint | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addLabResults(
        labResults.patientId,
        labResults.uricAcid,
        labResults.creatinine,
        labResults.bloodPressureSystolic,
        labResults.bloodPressureDiastolic
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

  return useQuery<Medication[]>({
    queryKey: ['medications'],
    queryFn: async () => {
      if (!actor) return [];
      const patients = await actor.getAllPatients();
      const allMedications: Medication[] = [];
      for (const patient of patients) {
        const meds = await actor.getMedicationsByPatient(patient.patientId);
        allMedications.push(...meds);
      }
      return allMedications;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddMedication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (medication: {
      patientId: string;
      name: string;
      dosage: string | null;
      frequency: string | null;
      startDate: bigint | null;
      endDate: bigint | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addMedication(
        medication.patientId,
        medication.name,
        medication.dosage,
        medication.frequency,
        medication.startDate,
        medication.endDate
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

  return useQuery<AdverseDrugReaction[]>({
    queryKey: ['adrs'],
    queryFn: async () => {
      if (!actor) return [];
      const patients = await actor.getAllPatients();
      const allAdrs: AdverseDrugReaction[] = [];
      for (const patient of patients) {
        const adrs = await actor.getADRsByPatient(patient.patientId);
        allAdrs.push(...adrs);
      }
      return allAdrs;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddAdr() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (adr: {
      patientId: string;
      description: string;
      severity: string;
      suspectedDrug: string;
      onsetDate: bigint | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addADR(
        adr.patientId,
        adr.description,
        adr.severity,
        adr.suspectedDrug,
        adr.onsetDate
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
    actorReady: !!actor && !actorFetching,
    profileFetching: query.isLoading && !actorFetching,
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
    mutationFn: async (message: { sender: string; message: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addChatMessage(message.sender, message.message);
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

// Prescription Images queries
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
    mutationFn: async (image: { patientId: string; imageUrl: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addPrescriptionImage(image.patientId, image.imageUrl);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prescriptionImages', variables.patientId] });
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
    mutationFn: async (narration: { patientId: string; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addCaseNarration(narration.patientId, narration.content);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['caseNarrations', variables.patientId] });
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
    mutationFn: async (drugs: { drug1: string; drug2: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.checkDrugInteraction(drugs.drug1, drugs.drug2);
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

// Drug Database queries with refetchOnMount for authoritative data
export function useGetAllDrugs() {
  const { actor, isFetching } = useActor();

  return useQuery<Drug[]>({
    queryKey: ['allDrugs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDrugs();
    },
    enabled: !!actor && !isFetching,
    refetchOnMount: 'always',
    staleTime: 0,
  });
}

export function useGetApprovedDrugs() {
  const { actor, isFetching } = useActor();

  return useQuery<Drug[]>({
    queryKey: ['approvedDrugs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getApprovedDrugs();
    },
    enabled: !!actor && !isFetching,
    refetchOnMount: 'always',
    staleTime: 0,
  });
}

export function useGetBannedDrugs() {
  const { actor, isFetching } = useActor();

  return useQuery<Drug[]>({
    queryKey: ['bannedDrugs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBannedDrugs();
    },
    enabled: !!actor && !isFetching,
    refetchOnMount: 'always',
    staleTime: 0,
  });
}

export function useGetCategorizedDrugs() {
  const { actor, isFetching } = useActor();

  return useQuery<CategorizedDrugs>({
    queryKey: ['categorizedDrugs'],
    queryFn: async () => {
      if (!actor)
        return {
          antibiotics: [],
          painkillers: [],
          fdcs: [],
          vitamins: [],
          others: [],
          all: [],
        };
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
    mutationFn: async (drugs: { drug1: string; drug2: string; drug3: string; drug4: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDrugSafetyAdvisory(drugs.drug1, drugs.drug2, drugs.drug3, drugs.drug4);
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
    mutationFn: async (data: { patientId: string; prescriberDetails: PrescriberDetails }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.savePrescriberDetailsForPatient(data.patientId, data.prescriberDetails);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prescriberDetails', variables.patientId] });
    },
  });
}

// Drug Verification queries
export function useRefreshAndVerifyDrugTable() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.refreshAndVerifyDrugTable();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allDrugs'] });
      queryClient.invalidateQueries({ queryKey: ['approvedDrugs'] });
      queryClient.invalidateQueries({ queryKey: ['bannedDrugs'] });
      queryClient.invalidateQueries({ queryKey: ['categorizedDrugs'] });
      queryClient.invalidateQueries({ queryKey: ['lastDrugVerification'] });
      queryClient.invalidateQueries({ queryKey: ['drugTableVerificationReport'] });
      queryClient.invalidateQueries({ queryKey: ['drugTableLastRefreshTimestamp'] });
    },
  });
}

export function useGetLastDrugVerification() {
  const { actor, isFetching } = useActor();

  return useQuery<DrugVerificationResult | null>({
    queryKey: ['lastDrugVerification'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getLastDrugVerification();
    },
    enabled: !!actor && !isFetching,
  });
}

// Admin queries
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useBulkUpdateDrugTableStore() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<BulkDrugStoreUpdateResult, Error, Drug[]>({
    mutationFn: async (drugs: Drug[]) => {
      if (!actor) throw new Error('Actor not available');
      return actor.bulkUpdateDrugTableStore(drugs);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allDrugs'] });
      queryClient.invalidateQueries({ queryKey: ['approvedDrugs'] });
      queryClient.invalidateQueries({ queryKey: ['bannedDrugs'] });
      queryClient.invalidateQueries({ queryKey: ['categorizedDrugs'] });
      queryClient.invalidateQueries({ queryKey: ['drugTableVerificationReport'] });
      queryClient.invalidateQueries({ queryKey: ['drugTableLastRefreshTimestamp'] });
    },
  });
}

export function useGetDrugTableVerificationReport() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['drugTableVerificationReport'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDrugTableVerificationReport();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetDrugTableLastRefreshTimestamp() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint | null>({
    queryKey: ['drugTableLastRefreshTimestamp'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDrugTableLastRefreshTimestamp();
    },
    enabled: !!actor && !isFetching,
  });
}

// Multi-source drug service queries (client-side)
export function useGetMultiSourceLastUpdated() {
  return useQuery({
    queryKey: ['multiSourceLastUpdated'],
    queryFn: async () => {
      return MultiSourceDrugService.getLastUpdated();
    },
    staleTime: 60000,
  });
}

export function useGetMultiSourceSyncStatus() {
  return useQuery({
    queryKey: ['multiSourceSyncStatus'],
    queryFn: async () => {
      return MultiSourceDrugService.getSyncStatus();
    },
    staleTime: 30000,
  });
}

// Drug-Drug Interaction Database queries (client-side) - returns array of drugs
export function useGetDrugDrugInteractionData() {
  return useQuery({
    queryKey: ['drugDrugInteractionData'],
    queryFn: async () => {
      return drugDrugInteractionService.getCachedData();
    },
    staleTime: 300000,
  });
}

// Local interaction check queries (client-side) - fixed return types
export function useCheckMultiDrugInteractions(drugs: string[]) {
  const normalizedKey = normalizeInputsForQueryKey(drugs);

  return useQuery({
    queryKey: ['multiDrugInteractions', normalizedKey],
    queryFn: async () => {
      return computeMultiDrugInteractions(drugs);
    },
    enabled: drugs.length >= 2 && drugs.every((d) => d.trim().length > 0),
    staleTime: 300000,
  });
}

export function useCheckDrugFoodInteractions(drugs: string[], foods: string[]) {
  const normalizedKey = normalizeInputsForQueryKey([...drugs, ...foods]);

  return useQuery({
    queryKey: ['drugFoodInteractions', normalizedKey],
    queryFn: async () => {
      return computeDrugFoodInteractions(drugs, foods);
    },
    enabled:
      drugs.length > 0 &&
      foods.length > 0 &&
      drugs.every((d) => d.trim().length > 0) &&
      foods.every((f) => f.trim().length > 0),
    staleTime: 300000,
  });
}

export function useCheckFoodFoodInteractions(foods: string[]) {
  const normalizedKey = normalizeInputsForQueryKey(foods);

  return useQuery({
    queryKey: ['foodFoodInteractions', normalizedKey],
    queryFn: async () => {
      return computeFoodFoodInteractions(foods);
    },
    enabled: foods.length >= 2 && foods.every((f) => f.trim().length > 0),
    staleTime: 300000,
  });
}
