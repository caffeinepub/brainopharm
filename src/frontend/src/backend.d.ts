import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Medication {
    endDate?: Time;
    dosage?: string;
    patientId: string;
    name: string;
    medicationId: string;
    timestamp: Time;
    frequency?: string;
    startDate?: Time;
}
export interface PrescriptionImage {
    id: string;
    patientId: string;
    errorMessage?: string;
    ocrStatus: OCRStatus;
    extractedText?: string;
    processingTime?: Time;
    imageUrl: string;
    uploadTime: Time;
}
export type Time = bigint;
export interface UserProfile {
    name: string;
    role: string;
    email?: string;
}
export interface SpecialPopulationsGuidance {
    lactation?: string;
    pediatrics?: string;
    pregnancy?: string;
    geriatrics?: string;
}
export interface RestrictedDrug {
    name: string;
    description: string;
    category: string;
    safetyInfo: string;
}
export interface RestrictedDrugCategory {
    name: string;
    description: string;
    drugs: Array<RestrictedDrug>;
}
export interface FourDrugInteractionOutput {
    pairResults: Array<DrugPairResult>;
    overallSeverity?: string;
}
export type DrugSource = {
    __kind__: "other";
    other: string;
} | {
    __kind__: "cdsco";
    cdsco: null;
} | {
    __kind__: "mimsIndia";
    mimsIndia: null;
} | {
    __kind__: "applicationData";
    applicationData: null;
};
export interface Patient {
    age: bigint;
    bmi: number;
    weight: number;
    height: number;
    patientId: string;
    name: string;
    nationality: string;
    bloodGroup?: string;
    address?: string;
    gender: string;
    timestamp: Time;
    phone?: string;
}
export interface CaseNarration {
    status: NarrationStatus;
    content: string;
    generatedSummary?: string;
    patientId: string;
    lastModified: Time;
    version: bigint;
    narrationId: string;
    timestamp: Time;
}
export interface DrugWithCategory {
    categoryType: DrugCategoryType;
    drug: Drug;
}
export interface DrugInteraction {
    interactionType: InteractionType;
    references: Array<string>;
    evidenceLevel: EvidenceLevel;
    description: string;
    severity: Severity;
    drug1: string;
    drug2: string;
}
export interface ChatMessage {
    id: bigint;
    sender: string;
    message: string;
    timestamp: Time;
}
export interface LabResults {
    patientId: string;
    labResultsId: string;
    timestamp: Time;
    bloodPressureDiastolic?: bigint;
    creatinine?: number;
    bloodPressureSystolic?: bigint;
    uricAcid?: number;
}
export interface ClinicallyOrientedInteraction {
    managementRecommendations?: string;
    interactionType?: InteractionType;
    references: Array<string>;
    evidenceLevel?: EvidenceLevel;
    description?: string;
    severity?: Severity;
    toxicityRisk?: ToxicityRiskLevel;
    clinicalEffects?: string;
    drugs: DrugInteractionPair;
}
export interface PrescriberDetails {
    fullName: string;
    registrationNumber: string;
    email: string;
    address: string;
    specialization: string;
    prefix: PrescriberPrefix;
    contactNumber: string;
}
export interface ExternalResource {
    id: string;
    url: string;
    status: ResourceStatus;
    synchronizationLogs: Array<string>;
    name: string;
    lastUpdated: Time;
    description: string;
    contentSummary?: string;
}
export interface DrugPairResult {
    interactionType?: InteractionType;
    references: Array<string>;
    evidenceLevel?: EvidenceLevel;
    description?: string;
    severity?: Severity;
    drugs: DrugInteractionPair;
}
export interface DrugInteractionPair {
    drugA: string;
    drugB: string;
}
export interface Drug {
    status: DrugStatus;
    source: DrugSource;
    date: Time;
    name: string;
    description: string;
    category: string;
    safetyInfo: string;
}
export interface BulkDrugStoreUpdateResult {
    added: bigint;
    errors: Array<string>;
    duplicates: bigint;
    totalAfterStore: bigint;
    skippedEmpty: bigint;
}
export interface DrugSafetyAdvisory {
    specialPopulations: SpecialPopulationsGuidance;
    overallRisk?: OverallRiskSummary;
    pairwiseInteractions: Array<ClinicallyOrientedInteraction>;
}
export interface OverallRiskSummary {
    highestRiskLevel?: ToxicityRiskLevel;
    topRecommendation?: string;
    overallSeverity?: Severity;
    highestSeverityPair?: DrugInteractionPair;
}
export interface CategorizedDrugs {
    all: Array<DrugWithCategory>;
    painkillers: Array<DrugWithCategory>;
    fdcs: Array<DrugWithCategory>;
    others: Array<DrugWithCategory>;
    antibiotics: Array<DrugWithCategory>;
    vitamins: Array<DrugWithCategory>;
}
export interface FourDrugInteractionInput {
    drug1: string;
    drug2: string;
    drug3: string;
    drug4: string;
}
export interface DrugVerificationResult {
    verifiedBannedDrugs: Array<Drug>;
    verificationTimestamp: Time;
    allDrugs: Array<Drug>;
    verifiedApprovedDrugs: Array<Drug>;
}
export interface AdverseDrugReaction {
    onsetDate?: Time;
    adrId: string;
    patientId: string;
    description: string;
    timestamp: Time;
    suspectedDrug: string;
    severity: string;
}
export enum DrugCategoryType {
    painkillers = "painkillers",
    other = "other",
    fdcs = "fdcs",
    antibiotics = "antibiotics",
    vitamins = "vitamins"
}
export enum DrugStatus {
    banned = "banned",
    approved = "approved"
}
export enum EvidenceLevel {
    clinicalTrial = "clinicalTrial",
    others = "others",
    regulatoryAgency = "regulatoryAgency",
    metaAnalysis = "metaAnalysis",
    caseReport = "caseReport",
    expertOpinion = "expertOpinion"
}
export enum InteractionType {
    pharmacokinetic = "pharmacokinetic",
    both = "both",
    pharmacodynamic = "pharmacodynamic"
}
export enum NarrationStatus {
    finalized = "finalized",
    reviewed = "reviewed",
    draft = "draft"
}
export enum OCRStatus {
    pending = "pending",
    processed = "processed",
    failed = "failed"
}
export enum PrescriberPrefix {
    doctor = "doctor",
    pharmacist = "pharmacist",
    practitionerNurse = "practitionerNurse"
}
export enum ResourceStatus {
    active = "active",
    pending = "pending",
    redirected = "redirected",
    archived = "archived",
    unavailable = "unavailable"
}
export enum Severity {
    major = "major",
    minor = "minor",
    contraindicated = "contraindicated",
    moderate = "moderate"
}
export enum ToxicityRiskLevel {
    low = "low",
    high = "high",
    moderate = "moderate",
    unknown_ = "unknown"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addADR(patientId: string, description: string, severity: string, suspectedDrug: string, onsetDate: Time | null): Promise<{
        status: string;
        adrId?: string;
        error?: string;
    }>;
    addCaseNarration(patientId: string, content: string): Promise<{
        status: string;
        error?: string;
        narrationId?: string;
    }>;
    addChatMessage(sender: string, message: string): Promise<bigint>;
    addDrug(drug: Drug): Promise<void>;
    addDrugInteraction(interaction: DrugInteraction): Promise<void>;
    addExternalResource(resource: ExternalResource): Promise<void>;
    addLabResults(patientId: string, uricAcid: number | null, creatinine: number | null, bloodPressureSystolic: bigint | null, bloodPressureDiastolic: bigint | null): Promise<{
        status: string;
        labResultsId?: string;
        error?: string;
    }>;
    addMedication(patientId: string, name: string, dosage: string | null, frequency: string | null, startDate: Time | null, endDate: Time | null): Promise<{
        status: string;
        error?: string;
        medicationId?: string;
    }>;
    addNewPatient(name: string, age: bigint, gender: string, height: number, weight: number, nationality: string, address: string | null, phone: string | null, bloodGroup: string | null): Promise<{
        status: string;
        patientId?: string;
        error?: string;
    }>;
    addPrescriptionImage(patientId: string, imageUrl: string): Promise<{
        status: string;
        error?: string;
        imageId?: string;
    }>;
    addRestrictedDrugCategory(category: RestrictedDrugCategory): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bulkUpdateDrugDatabaseStore(drugs: Array<Drug>): Promise<BulkDrugStoreUpdateResult>;
    bulkUpdateDrugTableStore(drugs: Array<Drug>): Promise<BulkDrugStoreUpdateResult>;
    checkDrugInteraction(drug1: string, drug2: string): Promise<DrugInteraction | null>;
    checkFourDrugInteraction(input: FourDrugInteractionInput): Promise<FourDrugInteractionOutput>;
    deletePatient(patientId: string): Promise<{
        status: string;
        error?: string;
    }>;
    getADRsByPatient(patientId: string): Promise<Array<AdverseDrugReaction>>;
    getAllDrugDatabaseStoreDrugs(): Promise<Array<Drug>>;
    getAllDrugTableStoreDrugs(): Promise<Array<Drug>>;
    getAllDrugs(): Promise<Array<Drug>>;
    getAllDrugsFromDatabase(): Promise<Array<Drug>>;
    getAllDrugsFromStore(): Promise<Array<Drug>>;
    getAllPatients(): Promise<Array<Patient>>;
    getApprovedDrugs(): Promise<Array<Drug>>;
    getAuthoritativeDrugDatabase(): Promise<Array<Drug>>;
    getAuthoritativeDrugDatabaseByStatus(status: DrugStatus): Promise<Array<Drug>>;
    getBannedDrugs(): Promise<Array<Drug>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCaseNarrationsByPatient(patientId: string): Promise<Array<CaseNarration>>;
    getCategorizedDrugs(): Promise<CategorizedDrugs>;
    getChatMessages(): Promise<Array<ChatMessage>>;
    getDrugDatabaseStoreByStatus(status: DrugStatus): Promise<Array<Drug>>;
    getDrugSafetyAdvisory(drug1: string, drug2: string, drug3: string, drug4: string): Promise<DrugSafetyAdvisory>;
    getDrugTableLastRefreshTimestamp(): Promise<Time | null>;
    getDrugTableStoreByStatus(status: DrugStatus): Promise<Array<Drug>>;
    getDrugTableVerificationReport(): Promise<{
        lastVerificationTimestamp?: Time;
        bannedDrugs: bigint;
        lastVerifiedDrugCount?: bigint;
        approvedDrugs: bigint;
        totalDrugs: bigint;
    }>;
    getExternalResources(): Promise<Array<ExternalResource>>;
    getFilteredDrugs(status: DrugStatus | null): Promise<Array<Drug>>;
    getLabResultsByPatient(patientId: string): Promise<Array<LabResults>>;
    getLastDrugVerification(): Promise<DrugVerificationResult | null>;
    getMedicationsByPatient(patientId: string): Promise<Array<Medication>>;
    getPrescriberDetailsByPatientId(patientId: string): Promise<PrescriberDetails | null>;
    getPrescriptionImagesByPatient(patientId: string): Promise<Array<PrescriptionImage>>;
    getRestrictedDrugCategories(): Promise<Array<RestrictedDrugCategory>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    refreshAndVerifyDrugTable(): Promise<DrugVerificationResult>;
    refreshAuthoritativeAggregateDatabase(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    savePrescriberDetailsForPatient(patientId: string, prescriberDetails: PrescriberDetails): Promise<void>;
    searchDrugs(searchQuery: string): Promise<Array<Drug>>;
}
