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

// User Profile queries with separated actor and profile fetch states
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

  // Separate states for better control
  const actorReady = !!actor && !actorFetching;
  const profileFetching = query.isFetching && actorReady;

  return {
    ...query,
    // Actor is still initializing
    isLoading: actorFetching || query.isLoading,
    // Profile query has completed at least once
    isFetched: actorReady && query.isFetched,
    // Actor is ready and initialized
    actorReady,
    // Profile query is actively fetching (not just waiting for actor)
    profileFetching,
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

// Client-side interaction check hooks using React Query - RETURNS ARRAYS
export function useCheckMultiDrugInteraction(drugs?: string[]) {
  const queryKey = drugs ? normalizeInputsForQueryKey(drugs) : 'empty';

  return useQuery<DrugDrugInteractionResult[]>({
    queryKey: ['drugInteractions', queryKey],
    queryFn: () => computeMultiDrugInteractions(drugs || []),
    enabled: !!drugs && drugs.length >= 2,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCheckDrugFoodInteraction(drugs?: string[], foods?: string[]) {
  const queryKey = {
    drugs: drugs ? normalizeInputsForQueryKey(drugs) : 'empty',
    foods: foods ? normalizeInputsForQueryKey(foods) : 'empty',
  };

  return useQuery<DrugFoodInteractionResult[]>({
    queryKey: ['drugFoodInteractions', queryKey],
    queryFn: () => computeDrugFoodInteractions(drugs || [], foods || []),
    enabled: !!drugs && drugs.length > 0 && !!foods && foods.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCheckFoodFoodInteraction(foods?: string[]) {
  const queryKey = foods ? normalizeInputsForQueryKey(foods) : 'empty';

  return useQuery<FoodFoodInteractionResult[]>({
    queryKey: ['foodFoodInteractions', queryKey],
    queryFn: () => computeFoodFoodInteractions(foods || []),
    enabled: !!foods && foods.length >= 2,
    staleTime: 1000 * 60 * 5,
  });
}

// Drug Database queries - INDEPENDENT OF PROFILE LOADING
// These queries only depend on actor availability, not on isFetching state
export function useGetAllDrugs() {
  const { actor } = useActor();

  return useQuery<Drug[]>({
    queryKey: ['allDrugs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDrugs();
    },
    // Only require actor to exist, don't wait for isFetching
    enabled: !!actor,
    staleTime: 1000 * 60 * 15,
  });
}

export function useGetApprovedDrugs() {
  const { actor } = useActor();

  return useQuery<Drug[]>({
    queryKey: ['approvedDrugs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getApprovedDrugs();
    },
    // Only require actor to exist, don't wait for isFetching
    enabled: !!actor,
    staleTime: 1000 * 60 * 15,
  });
}

export function useGetBannedDrugs() {
  const { actor } = useActor();

  return useQuery<Drug[]>({
    queryKey: ['bannedDrugs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBannedDrugs();
    },
    // Only require actor to exist, don't wait for isFetching
    enabled: !!actor,
    staleTime: 1000 * 60 * 15,
  });
}

export function useGetCategorizedDrugs() {
  const { actor } = useActor();

  return useQuery<CategorizedDrugs>({
    queryKey: ['categorizedDrugs'],
    queryFn: async () => {
      if (!actor) {
        return {
          all: [],
          antibiotics: [],
          painkillers: [],
          fdcs: [],
          vitamins: [],
          others: [],
        };
      }
      return actor.getCategorizedDrugs();
    },
    // Only require actor to exist, don't wait for isFetching
    enabled: !!actor,
    staleTime: 1000 * 60 * 15,
  });
}

export function useSearchDrugs(searchQuery: string) {
  const { actor } = useActor();

  return useQuery<Drug[]>({
    queryKey: ['searchDrugs', searchQuery],
    queryFn: async () => {
      if (!actor || !searchQuery) return [];
      return actor.searchDrugs(searchQuery);
    },
    // Only require actor to exist, don't wait for isFetching
    enabled: !!actor && !!searchQuery,
    staleTime: 1000 * 60 * 5,
  });
}

// Multi-source drug service queries - CLIENT-SIDE ONLY
export function useGetMultiSourceDrugs() {
  return useQuery<Drug[]>({
    queryKey: ['multiSourceDrugs'],
    queryFn: async () => {
      return MultiSourceDrugService.getCachedData();
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function useGetMultiSourceLastUpdated() {
  return useQuery<Date | null>({
    queryKey: ['multiSourceLastUpdated'],
    queryFn: async () => {
      return MultiSourceDrugService.getLastUpdated();
    },
    staleTime: 1000 * 60,
  });
}

export function useGetMultiSourceSyncStatus() {
  return useQuery<{
    cdsco: { status: string; lastSync: Date | null } | null;
    mims: { status: string; lastSync: Date | null } | null;
  }>({
    queryKey: ['multiSourceSyncStatus'],
    queryFn: async () => {
      return {
        cdsco: { status: 'idle', lastSync: MultiSourceDrugService.getLastUpdated() },
        mims: { status: 'idle', lastSync: MultiSourceDrugService.getLastUpdated() },
      };
    },
    staleTime: 1000 * 60,
  });
}

export function useRefreshMultiSourceData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await MultiSourceDrugService.refresh();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['multiSourceDrugs'] });
      queryClient.invalidateQueries({ queryKey: ['multiSourceLastUpdated'] });
      queryClient.invalidateQueries({ queryKey: ['multiSourceSyncStatus'] });
    },
  });
}

// Drug-Drug Interaction Database queries - CLIENT-SIDE ONLY
export function useGetDrugDrugInteractionData() {
  return useQuery({
    queryKey: ['drugDrugInteractionDatabase'],
    queryFn: async () => {
      return drugDrugInteractionService.getCachedData();
    },
    staleTime: 1000 * 60 * 60,
  });
}

// Drug Safety Advisory queries
export function useGetDrugSafetyAdvisory(
  drug1: string,
  drug2: string,
  drug3: string,
  drug4: string
) {
  const { actor } = useActor();

  return useQuery<DrugSafetyAdvisory>({
    queryKey: ['drugSafetyAdvisory', drug1, drug2, drug3, drug4],
    queryFn: async () => {
      if (!actor) {
        return {
          pairwiseInteractions: [],
          overallRisk: {
            highestSeverityPair: undefined,
            highestRiskLevel: undefined,
            topRecommendation: undefined,
            overallSeverity: undefined,
          },
          specialPopulations: {
            pregnancy: undefined,
            lactation: undefined,
            pediatrics: undefined,
            geriatrics: undefined,
          },
        };
      }
      return actor.getDrugSafetyAdvisory(drug1, drug2, drug3, drug4);
    },
    enabled: !!actor && !!drug1 && !!drug2 && !!drug3 && !!drug4,
    staleTime: 1000 * 60 * 5,
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
      queryClient.invalidateQueries({
        queryKey: ['prescriberDetails', variables.patientId],
      });
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
      // Invalidate all drug-related queries to trigger immediate refetch
      queryClient.invalidateQueries({ queryKey: ['allDrugs'] });
      queryClient.invalidateQueries({ queryKey: ['approvedDrugs'] });
      queryClient.invalidateQueries({ queryKey: ['bannedDrugs'] });
      queryClient.invalidateQueries({ queryKey: ['categorizedDrugs'] });
      queryClient.invalidateQueries({ queryKey: ['lastDrugVerification'] });
    },
  });
}

export function useGetLastDrugVerification() {
  const { actor } = useActor();

  return useQuery<DrugVerificationResult | null>({
    queryKey: ['lastDrugVerification'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getLastDrugVerification();
    },
    enabled: !!actor,
    staleTime: 1000 * 60 * 5,
  });
}
