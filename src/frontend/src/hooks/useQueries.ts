import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { MultiSourceDrugService } from '../services/multiSourceDrugService';
import { DrugInteractionVerificationService } from '../services/drugInteractionVerificationService';
import { drugDrugInteractionService } from '../services/drugDrugInteractionService';
import { useEffect, useState } from 'react';
import { generateAllDrugPairs, normalizePairKey } from '../utils/drugPairs';
import {
  Patient,
  UserProfile,
  Medication,
  AdverseDrugReaction,
  RestrictedDrugCategory,
  DrugStatus,
  Drug,
  FourDrugInteractionInput,
  FourDrugInteractionOutput,
  LabResults,
  DrugSafetyAdvisory,
  ClinicallyOrientedInteraction,
  Severity,
  InteractionType,
  EvidenceLevel,
  ToxicityRiskLevel,
} from '../backend';

// Optimized timeout for user profile lookup - 3 seconds with proper error handling
const USER_PROFILE_TIMEOUT_MS = 3000;

// User Profile Queries with optimized fast-fail logic, 3-second timeout, and proper error handling
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      // Create abort controller for timeout
      const abortController = new AbortController();
      
      // Set up 3-second timeout
      const timeoutId = setTimeout(() => {
        abortController.abort();
      }, USER_PROFILE_TIMEOUT_MS);

      try {
        // Fetch profile with timeout protection
        const profilePromise = actor.getCallerUserProfile();
        
        // Race between profile fetch and abort signal
        const profile = await Promise.race([
          profilePromise,
          new Promise<never>((_, reject) => {
            abortController.signal.addEventListener('abort', () => {
              reject(new Error('Profile fetch timeout - please try again'));
            });
          })
        ]);
        
        clearTimeout(timeoutId);
        
        // Return profile (null if user doesn't have one, or UserProfile object)
        return profile;
      } catch (error) {
        clearTimeout(timeoutId);
        
        // Handle timeout errors gracefully
        if (error instanceof Error) {
          if (error.message.includes('timeout') || error.message.includes('abort')) {
            console.warn('Profile fetch timed out, treating as no profile');
            return null;
          }
        }
        
        // For other errors, return null to allow dashboard to load
        console.warn('Profile fetch error:', error);
        return null;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false, // Don't retry on failure
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 90, // 90 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
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
      
      // Add 3-second timeout to save operation as well
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => {
        abortController.abort();
      }, USER_PROFILE_TIMEOUT_MS);

      try {
        const savePromise = actor.saveCallerUserProfile(profile);
        
        await Promise.race([
          savePromise,
          new Promise<never>((_, reject) => {
            abortController.signal.addEventListener('abort', () => {
              reject(new Error('Save operation timeout - please try again'));
            });
          })
        ]);
        
        clearTimeout(timeoutId);
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Patient Queries with optimized caching
export function useGetAllPatients() {
  const { actor, isFetching } = useActor();

  return useQuery<Patient[]>({
    queryKey: ['patients'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPatients();
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 90, // 90 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useGetPatient(patientId: string) {
  const { actor, isFetching } = useActor();
  const { data: allPatients = [] } = useGetAllPatients();

  return useQuery<Patient | undefined>({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      if (!actor) return undefined;
      // Find patient from the list since backend doesn't have getPatient by ID
      return allPatients.find(p => p.patientId === patientId);
    },
    enabled: !!actor && !isFetching && !!patientId && allPatients.length > 0,
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 90,
    refetchOnWindowFocus: false,
  });
}

export function useAddPatient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patientData: {
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
      
      const result = await actor.addNewPatient(
        patientData.name,
        patientData.age,
        patientData.gender,
        patientData.height,
        patientData.weight,
        patientData.nationality,
        patientData.address,
        patientData.phone,
        patientData.bloodGroup
      );
      
      if (result.status !== 'success' || !result.patientId) {
        throw new Error(result.error || 'Failed to add patient');
      }
      
      return result.patientId;
    },
    onSuccess: () => {
      // Invalidate and refetch the patients list to show the new patient
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
      const result = await actor.deletePatient(patientId);
      
      if (result.status !== 'success') {
        throw new Error(result.error || 'Failed to delete patient');
      }
      
      return result;
    },
    onSuccess: (_, patientId) => {
      // Optimistically remove from cache
      queryClient.setQueryData<Patient[]>(['patients'], (oldData) => {
        if (!oldData) return [];
        return oldData.filter(p => p.patientId !== patientId);
      });
      
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

// Lab Results Queries with optimized caching
export function useGetAllLabResults() {
  const { actor, isFetching } = useActor();

  return useQuery<LabResults[]>({
    queryKey: ['labResults'],
    queryFn: async () => {
      if (!actor) return [];
      // Since backend doesn't have getAllLabResults, we need to aggregate from all patients
      const patients = await actor.getAllPatients();
      const allResults: LabResults[] = [];
      
      for (const patient of patients) {
        const results = await actor.getLabResultsByPatient(patient.patientId);
        allResults.push(...results);
      }
      
      return allResults;
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 90,
    refetchOnWindowFocus: false,
  });
}

export function useGetLabResultsByPatient(patientId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<LabResults[]>({
    queryKey: ['labResults', patientId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLabResultsByPatient(patientId);
    },
    enabled: !!actor && !isFetching && !!patientId,
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 90,
    refetchOnWindowFocus: false,
  });
}

export function useAddLabResults() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (labData: {
      patientId: string;
      uricAcid: number | null;
      creatinine: number | null;
      bloodPressureSystolic: bigint | null;
      bloodPressureDiastolic: bigint | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.addLabResults(
        labData.patientId,
        labData.uricAcid,
        labData.creatinine,
        labData.bloodPressureSystolic,
        labData.bloodPressureDiastolic
      );
      
      if (result.status !== 'success') {
        throw new Error(result.error || 'Failed to add lab results');
      }
      
      return result.labResultsId;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['labResults', variables.patientId] });
      queryClient.invalidateQueries({ queryKey: ['labResults'] });
    },
  });
}

// Medication Queries with optimized caching
export function useGetAllMedications() {
  const { actor, isFetching } = useActor();

  return useQuery<Medication[]>({
    queryKey: ['medications'],
    queryFn: async () => {
      if (!actor) return [];
      // Since backend doesn't have getAllMedications, we need to aggregate from all patients
      const patients = await actor.getAllPatients();
      const allMedications: Medication[] = [];
      
      for (const patient of patients) {
        const meds = await actor.getMedicationsByPatient(patient.patientId);
        allMedications.push(...meds);
      }
      
      return allMedications;
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 90,
    refetchOnWindowFocus: false,
  });
}

export function useGetMedicationsByPatient(patientId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Medication[]>({
    queryKey: ['medications', patientId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMedicationsByPatient(patientId);
    },
    enabled: !!actor && !isFetching && !!patientId,
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 90,
    refetchOnWindowFocus: false,
  });
}

export function useAddMedication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (medicationData: {
      patientId: string;
      name: string;
      dosage: string | null;
      frequency: string | null;
      startDate: bigint | null;
      endDate: bigint | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.addMedication(
        medicationData.patientId,
        medicationData.name,
        medicationData.dosage,
        medicationData.frequency,
        medicationData.startDate,
        medicationData.endDate
      );
      
      if (result.status !== 'success') {
        throw new Error(result.error || 'Failed to add medication');
      }
      
      return result.medicationId;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['medications', variables.patientId] });
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });
}

// ADR Queries with optimized caching
export function useGetAllAdrs() {
  const { actor, isFetching } = useActor();

  return useQuery<AdverseDrugReaction[]>({
    queryKey: ['adrs'],
    queryFn: async () => {
      if (!actor) return [];
      // Since backend doesn't have getAllAdrs, we need to aggregate from all patients
      const patients = await actor.getAllPatients();
      const allAdrs: AdverseDrugReaction[] = [];
      
      for (const patient of patients) {
        const adrs = await actor.getADRsByPatient(patient.patientId);
        allAdrs.push(...adrs);
      }
      
      return allAdrs;
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 90,
    refetchOnWindowFocus: false,
  });
}

export function useGetADRsByPatient(patientId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<AdverseDrugReaction[]>({
    queryKey: ['adrs', patientId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getADRsByPatient(patientId);
    },
    enabled: !!actor && !isFetching && !!patientId,
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 90,
    refetchOnWindowFocus: false,
  });
}

export function useAddAdr() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (adrData: {
      patientId: string;
      description: string;
      severity: string;
      suspectedDrug: string;
      onsetDate: bigint | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.addADR(
        adrData.patientId,
        adrData.description,
        adrData.severity,
        adrData.suspectedDrug,
        adrData.onsetDate
      );
      
      if (result.status !== 'success') {
        throw new Error(result.error || 'Failed to add ADR');
      }
      
      return result.adrId;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adrs', variables.patientId] });
      queryClient.invalidateQueries({ queryKey: ['adrs'] });
    },
  });
}

// Restricted Drugs Queries with infinite cache
export function useGetAllRestrictedDrugCategories() {
  const { actor, isFetching } = useActor();

  return useQuery<RestrictedDrugCategory[]>({
    queryKey: ['restrictedDrugCategories'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRestrictedDrugCategories();
    },
    enabled: !!actor && !isFetching,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

// Helper function to map service interaction data to backend types
function mapSeverityToBackend(severity: 'minor' | 'moderate' | 'major' | 'contraindicated'): Severity {
  switch (severity) {
    case 'minor':
      return Severity.minor;
    case 'moderate':
      return Severity.moderate;
    case 'major':
      return Severity.major;
    case 'contraindicated':
      return Severity.contraindicated;
  }
}

function mapToxicityRisk(severity: 'minor' | 'moderate' | 'major' | 'contraindicated'): ToxicityRiskLevel {
  switch (severity) {
    case 'contraindicated':
    case 'major':
      return ToxicityRiskLevel.high;
    case 'moderate':
      return ToxicityRiskLevel.moderate;
    case 'minor':
      return ToxicityRiskLevel.low;
    default:
      return ToxicityRiskLevel.unknown_;
  }
}

function mapEvidenceLevel(evidenceLevel: string): EvidenceLevel {
  const lower = evidenceLevel.toLowerCase();
  if (lower.includes('clinical trial')) return EvidenceLevel.clinicalTrial;
  if (lower.includes('meta-analysis') || lower.includes('meta analysis')) return EvidenceLevel.metaAnalysis;
  if (lower.includes('regulatory') || lower.includes('fda') || lower.includes('agency')) return EvidenceLevel.regulatoryAgency;
  if (lower.includes('expert')) return EvidenceLevel.expertOpinion;
  if (lower.includes('case report')) return EvidenceLevel.caseReport;
  return EvidenceLevel.others;
}

function mapInteractionType(mechanism: string): InteractionType {
  const lower = mechanism.toLowerCase();
  if (lower.includes('pharmacokinetic') && lower.includes('pharmacodynamic')) return InteractionType.both;
  if (lower.includes('pharmacokinetic')) return InteractionType.pharmacokinetic;
  if (lower.includes('pharmacodynamic')) return InteractionType.pharmacodynamic;
  return InteractionType.pharmacodynamic; // Default
}

// Multi-Drug Interaction Queries with comprehensive safety advisory (supports 2-4 drugs)
export function useCheckMultiDrugInteraction() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ drugs }: { drugs: string[] }) => {
      if (!actor) throw new Error('Actor not available');
      
      // Generate all expected pairs from entered drugs
      const enteredDrugs = drugs.filter(d => d.trim() !== '');
      const expectedPairs = generateAllDrugPairs(enteredDrugs);
      
      // Fetch drug interaction data from the service
      const drugDatabase = drugDrugInteractionService.getCachedData();
      
      // Build a map of interactions using normalized pair keys
      const interactionMap = new Map<string, ClinicallyOrientedInteraction>();
      
      for (const drugInfo of drugDatabase) {
        if (drugInfo.interactions) {
          for (const interaction of drugInfo.interactions) {
            const pairKey = normalizePairKey(interaction.drugA, interaction.drugB);
            
            // Convert service interaction to backend format
            const clinicalInteraction: ClinicallyOrientedInteraction = {
              drugs: {
                drugA: interaction.drugA,
                drugB: interaction.drugB,
              },
              interactionType: mapInteractionType(interaction.mechanism),
              description: interaction.description,
              clinicalEffects: interaction.clinicalSignificance,
              toxicityRisk: mapToxicityRisk(interaction.severity),
              managementRecommendations: interaction.managementRecommendations,
              severity: mapSeverityToBackend(interaction.severity),
              evidenceLevel: mapEvidenceLevel(interaction.evidenceLevel),
              references: interaction.references,
            };
            
            interactionMap.set(pairKey, clinicalInteraction);
          }
        }
      }
      
      // Match expected pairs with interaction data
      const pairwiseInteractions: ClinicallyOrientedInteraction[] = expectedPairs.map(expectedPair => {
        const pairKey = normalizePairKey(expectedPair.drugA, expectedPair.drugB);
        const matchedInteraction = interactionMap.get(pairKey);
        
        if (matchedInteraction) {
          // Return the matched interaction with original drug names from user input
          return {
            ...matchedInteraction,
            drugs: expectedPair, // Use original casing from user input
          };
        }
        
        // Return minimal placeholder for pairs with no data
        return {
          drugs: expectedPair,
          interactionType: undefined,
          description: undefined,
          clinicalEffects: undefined,
          toxicityRisk: undefined,
          managementRecommendations: undefined,
          severity: undefined,
          evidenceLevel: undefined,
          references: [],
        };
      });
      
      // Build safety advisory
      const safetyAdvisory: DrugSafetyAdvisory = {
        pairwiseInteractions,
        overallRisk: undefined,
        specialPopulations: {
          pregnancy: undefined,
          lactation: undefined,
          pediatrics: undefined,
          geriatrics: undefined,
        },
      };
      
      return safetyAdvisory;
    },
  });
}

// Legacy two-drug interaction hook for backward compatibility
export function useCheckDrugInteraction() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ drug1, drug2 }: { drug1: string; drug2: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.checkDrugInteraction(drug1, drug2);
    },
  });
}

// Drug Interaction Verification Service Queries
export function useGetInteractionVerificationStatus() {
  return useQuery({
    queryKey: ['interactionVerificationStatus'],
    queryFn: () => {
      return DrugInteractionVerificationService.getSyncStatus();
    },
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60,
    refetchOnWindowFocus: false,
  });
}

export function useGetInteractionVerificationLastUpdated() {
  return useQuery<Date | null>({
    queryKey: ['interactionVerificationLastUpdated'],
    queryFn: () => {
      return DrugInteractionVerificationService.getLastUpdated();
    },
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60,
    refetchOnWindowFocus: false,
  });
}

export function useRefreshInteractionVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await DrugInteractionVerificationService.syncInteractionData(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactionVerificationStatus'] });
      queryClient.invalidateQueries({ queryKey: ['interactionVerificationLastUpdated'] });
    },
  });
}

// Multi-Source Drug Service Queries
export function useGetMultiSourceDrugData() {
  return useQuery({
    queryKey: ['multiSourceDrugData'],
    queryFn: () => {
      return MultiSourceDrugService.getCachedData();
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
  });
}

export function useGetMultiSourceLastUpdated() {
  return useQuery<Date | null>({
    queryKey: ['multiSourceLastUpdated'],
    queryFn: () => {
      return MultiSourceDrugService.getLastUpdated();
    },
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60,
    refetchOnWindowFocus: false,
  });
}

export function useGetMultiSourceSyncStatus() {
  return useQuery({
    queryKey: ['multiSourceSyncStatus'],
    queryFn: () => {
      return MultiSourceDrugService.getSyncStatus();
    },
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60,
    refetchOnWindowFocus: false,
  });
}

export function useRefreshMultiSourceData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await MultiSourceDrugService.fetchMultiSourceData(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['multiSourceDrugData'] });
      queryClient.invalidateQueries({ queryKey: ['multiSourceLastUpdated'] });
      queryClient.invalidateQueries({ queryKey: ['multiSourceSyncStatus'] });
    },
  });
}

// Drug-Drug Interaction Database Queries
export function useGetDrugDrugInteractionData() {
  return useQuery({
    queryKey: ['drugDrugInteractionData'],
    queryFn: () => {
      return drugDrugInteractionService.getCachedData();
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
  });
}

export function useGetDrugDrugInteractionLastUpdated() {
  return useQuery<Date | null>({
    queryKey: ['drugDrugInteractionLastUpdated'],
    queryFn: () => {
      return drugDrugInteractionService.getLastUpdated();
    },
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60,
    refetchOnWindowFocus: false,
  });
}

export function useRefreshDrugDrugInteractionData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await drugDrugInteractionService.fetchMultiSourceData(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drugDrugInteractionData'] });
      queryClient.invalidateQueries({ queryKey: ['drugDrugInteractionLastUpdated'] });
    },
  });
}

// Helper hook for sorted drugs from backend
export function useGetAllDrugsSorted() {
  const { actor, isFetching } = useActor();

  return useQuery<Drug[]>({
    queryKey: ['drugsSorted'],
    queryFn: async () => {
      if (!actor) return [];
      const drugs = await actor.getAllDrugs();
      return drugs.sort((a, b) => a.name.localeCompare(b.name));
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 90,
    refetchOnWindowFocus: false,
  });
}
