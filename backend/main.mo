import Iter "mo:core/Iter";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Migration "migration";

import MixinStorage "blob-storage/Mixin";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";

// IMPORTANT: Always add this part after updating any data structure, variable or field or changing values
(with migration = Migration.run)
actor {
  include MixinStorage();

  public type Patient = {
    patientId : Text;
    name : Text;
    age : Nat;
    gender : Text;
    height : Float;
    weight : Float;
    nationality : Text;
    address : ?Text;
    phone : ?Text;
    bloodGroup : ?Text;
    bmi : Float;
    timestamp : Time.Time;
  };

  public type LabResults = {
    labResultsId : Text;
    patientId : Text;
    uricAcid : ?Float;
    creatinine : ?Float;
    bloodPressureSystolic : ?Nat;
    bloodPressureDiastolic : ?Nat;
    timestamp : Time.Time;
  };

  public type Medication = {
    medicationId : Text;
    patientId : Text;
    name : Text;
    dosage : ?Text;
    frequency : ?Text;
    startDate : ?Time.Time;
    endDate : ?Time.Time;
    timestamp : Time.Time;
  };

  public type AdverseDrugReaction = {
    adrId : Text;
    patientId : Text;
    description : Text;
    severity : Text;
    suspectedDrug : Text;
    onsetDate : ?Time.Time;
    timestamp : Time.Time;
  };

  public type UserProfile = {
    name : Text;
    email : ?Text;
    role : Text;
  };

  public type ChatMessage = {
    id : Nat;
    sender : Text;
    message : Text;
    timestamp : Time.Time;
  };

  public type RestrictedDrug = {
    name : Text;
    description : Text;
    category : Text;
    safetyInfo : Text;
  };

  public type RestrictedDrugCategory = {
    name : Text;
    description : Text;
    drugs : [RestrictedDrug];
  };

  public type PrescriptionImage = {
    id : Text;
    patientId : Text;
    imageUrl : Text;
    extractedText : ?Text;
    uploadTime : Time.Time;
    processingTime : ?Time.Time;
    ocrStatus : OCRStatus;
    errorMessage : ?Text;
  };

  public type OCRStatus = {
    #pending;
    #processed;
    #failed;
  };

  public type CaseNarration = {
    narrationId : Text;
    patientId : Text;
    content : Text;
    generatedSummary : ?Text;
    timestamp : Time.Time;
    lastModified : Time.Time;
    version : Nat;
    status : NarrationStatus;
  };

  public type NarrationStatus = {
    #draft;
    #finalized;
    #reviewed;
  };

  public type ExternalResource = {
    id : Text;
    name : Text;
    url : Text;
    description : Text;
    status : ResourceStatus;
    lastUpdated : Time.Time;
    contentSummary : ?Text;
    synchronizationLogs : [Text];
  };

  public type ResourceStatus = {
    #active;
    #unavailable;
    #redirected;
    #pending;
    #archived;
  };

  public type DrugStatus = {
    #approved;
    #banned;
  };

  public type DrugInteraction = {
    drug1 : Text;
    drug2 : Text;
    interactionType : InteractionType;
    description : Text;
    severity : Severity;
    evidenceLevel : EvidenceLevel;
    references : [Text];
  };

  public type InteractionType = {
    #pharmacokinetic;
    #pharmacodynamic;
    #both;
  };

  public type Severity = {
    #minor;
    #moderate;
    #major;
    #contraindicated;
  };

  public type EvidenceLevel = {
    #caseReport;
    #metaAnalysis;
    #clinicalTrial;
    #expertOpinion;
    #regulatoryAgency;
    #others;
  };

  public type FourDrugInteractionInput = {
    drug1 : Text;
    drug2 : Text;
    drug3 : Text;
    drug4 : Text;
  };

  public type FourDrugInteractionResult = {
    pairResults : [DrugPairResult];
  };

  public type DrugInteractionPair = {
    drugA : Text;
    drugB : Text;
  };

  public type DrugPairResult = {
    drugs : DrugInteractionPair;
    interactionType : ?InteractionType;
    description : ?Text;
    severity : ?Severity;
    evidenceLevel : ?EvidenceLevel;
    references : [Text];
  };

  public type FourDrugInteractionOutput = {
    pairResults : [DrugPairResult];
    overallSeverity : ?Text;
  };

  public type Drug = {
    name : Text;
    status : DrugStatus;
    date : Time.Time;
    category : Text;
    description : Text;
    source : DrugSource;
    safetyInfo : Text;
  };

  public type DrugSource = {
    #mimsIndia;
    #cdsco;
    #applicationData;
    #other : Text;
  };

  public type DrugCategorization = {
    antibiotics : [Drug];
    painkillers : [Drug];
    fdcs : [Drug];
    vitamins : [Drug];
    others : [Drug];
  };

  public type DrugSearchResult = {
    drugs : [Drug];
    hasMatches : Bool;
  };

  public type AuthToken = {
    principal : Principal;
    valid : Bool;
  };

  public type DrugFilterType = {
    #all;
    #pregnantWomen;
    #lactatingMothers;
    #pediatrics;
    #geriatrics;
    #rareCases;
  };

  public type DrugCategoryType = {
    #antibiotics;
    #painkillers;
    #fdcs;
    #vitamins;
    #other;
  };

  public type DrugWithCategory = {
    drug : Drug;
    categoryType : DrugCategoryType;
  };

  public type CategorizedDrugs = {
    antibiotics : [DrugWithCategory];
    painkillers : [DrugWithCategory];
    fdcs : [DrugWithCategory];
    vitamins : [DrugWithCategory];
    others : [DrugWithCategory];
    all : [DrugWithCategory];
  };

  type DrugSafetyAdvisory = {
    pairwiseInteractions : [ClinicallyOrientedInteraction];
    overallRisk : ?OverallRiskSummary;
    specialPopulations : SpecialPopulationsGuidance;
  };

  type ClinicallyOrientedInteraction = {
    drugs : DrugInteractionPair;
    interactionType : ?InteractionType;
    description : ?Text;
    clinicalEffects : ?Text;
    toxicityRisk : ?ToxicityRiskLevel;
    managementRecommendations : ?Text;
    severity : ?Severity;
    evidenceLevel : ?EvidenceLevel;
    references : [Text];
  };

  type ToxicityRiskLevel = {
    #low;
    #moderate;
    #high;
    #unknown;
  };

  type OverallRiskSummary = {
    highestSeverityPair : ?DrugInteractionPair;
    highestRiskLevel : ?ToxicityRiskLevel;
    topRecommendation : ?Text;
    overallSeverity : ?Severity;
  };

  type SpecialPopulationsGuidance = {
    pregnancy : ?Text;
    lactation : ?Text;
    pediatrics : ?Text;
    geriatrics : ?Text;
  };

  type MultiDrugInteractionRequest = {
    drug1 : Text;
    drug2 : Text;
    drug3 : Text;
    drug4 : Text;
  };

  type MultiDrugInteractionResponse = {
    advisory : DrugSafetyAdvisory;
  };

  public type PrescriberPrefix = {
    #doctor;
    #practitionerNurse;
    #pharmacist;
  };

  public type PrescriberDetails = {
    prefix : PrescriberPrefix;
    fullName : Text;
    registrationNumber : Text;
    specialization : Text;
    contactNumber : Text;
    email : Text;
    address : Text;
  };

  public type ValidatedPrescriberDetails = {
    #success : PrescriberDetails;
    #validationError : Text;
  };

  public type DrugVerificationResult = {
    allDrugs : [Drug];
    verifiedApprovedDrugs : [Drug];
    verifiedBannedDrugs : [Drug];
    verificationTimestamp : Time.Time;
  };

  public type BulkDrugStoreUpdateResult = {
    added : Nat;
    skippedEmpty : Nat;
    duplicates : Nat;
    totalAfterStore : Nat;
    errors : [Text];
  };

  let patients = Map.empty<Text, Patient>();
  let labResults = Map.empty<Text, LabResults>();
  let medications = Map.empty<Text, Medication>();
  let adrs = Map.empty<Text, AdverseDrugReaction>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let chatMessages = Map.empty<Nat, ChatMessage>();
  let restrictedDrugCategories = Map.empty<Text, RestrictedDrugCategory>();
  let prescriptionImages = Map.empty<Text, PrescriptionImage>();
  let caseNarrations = Map.empty<Text, CaseNarration>();
  let externalResources = Map.empty<Text, ExternalResource>();
  let drugInteractions = Map.empty<Text, DrugInteraction>();
  let drugSafetyAdvisories = Map.empty<Text, DrugSafetyAdvisory>();
  let prescriberDetailsMap = Map.empty<Text, PrescriberDetails>();

  var chatMessageCounter = 0;
  var prescriptionImageCounter = 0;
  var externalResourceCounter = 0;

  let accessControlState = AccessControl.initState();
  var isAccessControlInitialized = false;
  var lastDrugVerification : ?DrugVerificationResult = null;
  var lastDrugTableRefresh : ?Time.Time = null;

  let drugTableStore = Map.empty<Text, Drug>();
  let drugDatabaseStore = Map.empty<Text, Drug>();
  let authoritativeDrugDatabase = Map.empty<Text, Drug>();

  func addPatientInternal(
    name : Text,
    age : Nat,
    gender : Text,
    height : Float,
    weight : Float,
    nationality : Text,
    address : ?Text,
    phone : ?Text,
    bloodGroup : ?Text,
  ) : Patient {
    let patientId = generateId("PAT");
    let bmi = calculateBmi(height, weight);

    {
      patientId;
      name;
      age;
      gender;
      height;
      weight;
      nationality;
      address;
      phone;
      bloodGroup;
      bmi;
      timestamp = Time.now();
    };
  };

  func calculateBmi(height : Float, weight : Float) : Float {
    weight / ((height / 100.0) ** 2);
  };

  func generateId(prefix : Text) : Text {
    let timestamp = Time.now().toText();
    prefix # "-" # timestamp;
  };

  func storePatientInternal(patient : Patient) {
    patients.add(patient.patientId, patient);
  };

  func extractCategoryType(drug : Drug) : DrugCategoryType {
    switch (drug.category) {
      case ("antibiotic") { #antibiotics };
      case ("painkiller") { #painkillers };
      case ("fdc") { #fdcs };
      case ("vitamin") { #vitamins };
      case (_) { #other };
    };
  };

  func validatePrescriberDetails(prescriberDetails : PrescriberDetails) : ValidatedPrescriberDetails {
    if (prescriberDetails.fullName.size() == 0) {
      return #validationError("Full name cannot be empty");
    };
    if (prescriberDetails.registrationNumber.size() == 0) {
      return #validationError("Registration number cannot be empty");
    };
    if (prescriberDetails.specialization.size() == 0) {
      return #validationError("Specialization cannot be empty");
    };
    if (prescriberDetails.contactNumber.size() == 0) {
      return #validationError("Contact number cannot be empty");
    };
    if (prescriberDetails.email.size() == 0) {
      return #validationError("Email cannot be empty");
    };
    if (prescriberDetails.address.size() == 0) {
      return #validationError("Address cannot be empty");
    };
    #success(prescriberDetails);
  };

  public shared ({ caller }) func initializeAccessControl() : async () {
    if (isAccessControlInitialized) {
      let currentRole = AccessControl.getUserRole(accessControlState, caller);
      switch (currentRole) {
        case (#admin) {
          return;
        };
        case (_) {
          return;
        };
      };
    };
    AccessControl.initialize(accessControlState, caller);
    isAccessControlInitialized := true;
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their profile");
    };
    switch (userProfiles.get(caller)) {
      case (?profile) { ?profile };
      case (null) { null };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile or admin access required");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func addNewPatient(
    name : Text,
    age : Nat,
    gender : Text,
    height : Float,
    weight : Float,
    nationality : Text,
    address : ?Text,
    phone : ?Text,
    bloodGroup : ?Text,
  ) : async {
    status : Text;
    patientId : ?Text;
    error : ?Text;
  } {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can add patients");
    };

    let patient = addPatientInternal(name, age, gender, height, weight, nationality, address, phone, bloodGroup);
    storePatientInternal(patient);

    {
      status = "success";
      patientId = ?patient.patientId;
      error = null;
    };
  };

  public query ({ caller }) func getAllPatients() : async [Patient] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view patients");
    };
    patients.values().toArray();
  };

  public shared ({ caller }) func deletePatient(patientId : Text) : async {
    status : Text;
    error : ?Text;
  } {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete patients");
    };
    switch (patients.get(patientId)) {
      case (null) {
        { status = "error"; error = ?"Patient not found" };
      };
      case (?patient) {
        patients.remove(patientId);
        { status = "success"; error = null };
      };
    };
  };

  public shared ({ caller }) func addLabResults(
    patientId : Text,
    uricAcid : ?Float,
    creatinine : ?Float,
    bloodPressureSystolic : ?Nat,
    bloodPressureDiastolic : ?Nat,
  ) : async { status : Text; labResultsId : ?Text; error : ?Text } {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can add lab results");
    };
    let labResultsId = generateId("LAB");
    let labResult : LabResults = {
      labResultsId;
      patientId;
      uricAcid;
      creatinine;
      bloodPressureSystolic;
      bloodPressureDiastolic;
      timestamp = Time.now();
    };
    labResults.add(labResultsId, labResult);
    { status = "success"; labResultsId = ?labResultsId; error = null };
  };

  public query ({ caller }) func getLabResultsByPatient(patientId : Text) : async [LabResults] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view lab results");
    };
    let filtered = labResults.toArray().filter(func(entry) { entry.1.patientId == patientId });
    filtered.map(func((id, result)) { result });
  };

  public shared ({ caller }) func addMedication(
    patientId : Text,
    name : Text,
    dosage : ?Text,
    frequency : ?Text,
    startDate : ?Time.Time,
    endDate : ?Time.Time,
  ) : async { status : Text; medicationId : ?Text; error : ?Text } {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can add medications");
    };
    let medicationId = generateId("MED");
    let medication : Medication = {
      medicationId;
      patientId;
      name;
      dosage;
      frequency;
      startDate;
      endDate;
      timestamp = Time.now();
    };
    medications.add(medicationId, medication);
    { status = "success"; medicationId = ?medicationId; error = null };
  };

  public query ({ caller }) func getMedicationsByPatient(patientId : Text) : async [Medication] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view medications");
    };
    let filtered = medications.toArray().filter(func(entry) { entry.1.patientId == patientId });
    filtered.map(func((id, med)) { med });
  };

  public shared ({ caller }) func addADR(
    patientId : Text,
    description : Text,
    severity : Text,
    suspectedDrug : Text,
    onsetDate : ?Time.Time,
  ) : async { status : Text; adrId : ?Text; error : ?Text } {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can add ADRs");
    };
    let adrId = generateId("ADR");
    let adr : AdverseDrugReaction = {
      adrId;
      patientId;
      description;
      severity;
      suspectedDrug;
      onsetDate;
      timestamp = Time.now();
    };
    adrs.add(adrId, adr);
    { status = "success"; adrId = ?adrId; error = null };
  };

  public query ({ caller }) func getADRsByPatient(patientId : Text) : async [AdverseDrugReaction] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view ADRs");
    };
    let filtered = adrs.toArray().filter(func(entry) { entry.1.patientId == patientId });
    filtered.map(func((id, adr)) { adr });
  };

  public shared ({ caller }) func addChatMessage(sender : Text, message : Text) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can add chat messages");
    };
    let id = chatMessageCounter;
    chatMessageCounter += 1;
    let chatMessage : ChatMessage = {
      id;
      sender;
      message;
      timestamp = Time.now();
    };
    chatMessages.add(id, chatMessage);
    id;
  };

  public query ({ caller }) func getChatMessages() : async [ChatMessage] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view chat messages");
    };
    chatMessages.values().toArray();
  };

  public query ({ caller }) func getRestrictedDrugCategories() : async [RestrictedDrugCategory] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view restricted drugs");
    };
    restrictedDrugCategories.values().toArray();
  };

  public shared ({ caller }) func addRestrictedDrugCategory(category : RestrictedDrugCategory) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add restricted drug categories");
    };
    restrictedDrugCategories.add(category.name, category);
  };

  public shared ({ caller }) func addPrescriptionImage(
    patientId : Text,
    imageUrl : Text,
  ) : async { status : Text; imageId : ?Text; error : ?Text } {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can add prescription images");
    };
    let id = generateId("IMG");
    let image : PrescriptionImage = {
      id;
      patientId;
      imageUrl;
      extractedText = null;
      uploadTime = Time.now();
      processingTime = null;
      ocrStatus = #pending;
      errorMessage = null;
    };
    prescriptionImages.add(id, image);
    { status = "success"; imageId = ?id; error = null };
  };

  public query ({ caller }) func getPrescriptionImagesByPatient(patientId : Text) : async [PrescriptionImage] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view prescription images");
    };
    let filtered = prescriptionImages.toArray().filter(func(entry) { entry.1.patientId == patientId });
    filtered.map(func((id, img)) { img });
  };

  public shared ({ caller }) func addCaseNarration(
    patientId : Text,
    content : Text,
  ) : async { status : Text; narrationId : ?Text; error : ?Text } {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can add case narrations");
    };
    let narrationId = generateId("NAR");
    let narration : CaseNarration = {
      narrationId;
      patientId;
      content;
      generatedSummary = null;
      timestamp = Time.now();
      lastModified = Time.now();
      version = 1;
      status = #draft;
    };
    caseNarrations.add(narrationId, narration);
    { status = "success"; narrationId = ?narrationId; error = null };
  };

  public query ({ caller }) func getCaseNarrationsByPatient(patientId : Text) : async [CaseNarration] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view case narrations");
    };
    let filtered = caseNarrations.toArray().filter(func(entry) { entry.1.patientId == patientId });
    filtered.map(func((id, narr)) { narr });
  };

  public query ({ caller }) func getExternalResources() : async [ExternalResource] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view external resources");
    };
    externalResources.values().toArray();
  };

  public shared ({ caller }) func addExternalResource(resource : ExternalResource) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add external resources");
    };
    externalResources.add(resource.id, resource);
  };

  public shared ({ caller }) func checkDrugInteraction(drug1 : Text, drug2 : Text) : async ?DrugInteraction {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can check drug interactions");
    };
    let key = drug1 # "-" # drug2;
    drugInteractions.get(key);
  };

  public shared ({ caller }) func addDrugInteraction(interaction : DrugInteraction) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add drug interactions");
    };
    let key = interaction.drug1 # "-" # interaction.drug2;
    drugInteractions.add(key, interaction);
  };

  public shared ({ caller }) func checkFourDrugInteraction(input : FourDrugInteractionInput) : async FourDrugInteractionOutput {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can check drug interactions");
    };

    if (input.drug1 == "" or input.drug2 == "" or input.drug3 == "" or input.drug4 == "") {
      return {
        pairResults = [];
        overallSeverity = null;
      };
    };

    let drugs = [input.drug1, input.drug2, input.drug3, input.drug4];
    let drugPairs = [
      { drugA = drugs[0]; drugB = drugs[1] },
      { drugA = drugs[0]; drugB = drugs[2] },
      { drugA = drugs[0]; drugB = drugs[3] },
      { drugA = drugs[1]; drugB = drugs[2] },
      { drugA = drugs[1]; drugB = drugs[3] },
      { drugA = drugs[2]; drugB = drugs[3] },
    ];

    let pairResults : [DrugPairResult] = [];
    {
      pairResults;
      overallSeverity = null;
    };
  };

  public query ({ caller }) func getAllDrugsFromStore() : async [Drug] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view drugs");
    };
    drugTableStore.values().toArray();
  };

  public query ({ caller }) func getAllDrugsFromDatabase() : async [Drug] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view drugs");
    };
    drugDatabaseStore.values().toArray();
  };

  public shared ({ caller }) func addDrug(drug : Drug) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add drugs");
    };
    drugTableStore.add(drug.name, drug);
  };

  public query ({ caller }) func searchDrugs(searchQuery : Text) : async [Drug] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can search drugs");
    };
    let filtered = drugTableStore.toArray().filter(func(entry) {
      entry.1.name.contains(#text searchQuery);
    });
    filtered.map(func((name, drug)) { drug });
  };

  public query ({ caller }) func getCategorizedDrugs() : async CategorizedDrugs {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view categorized drugs");
    };
    let antibiotics = List.empty<DrugWithCategory>();
    let painkillers = List.empty<DrugWithCategory>();
    let fdcs = List.empty<DrugWithCategory>();
    let vitamins = List.empty<DrugWithCategory>();
    let others = List.empty<DrugWithCategory>();
    let all = List.empty<DrugWithCategory>();

    for (entry in drugTableStore.entries()) {
      let (drugName, drug) = entry;
      let drugWithCategory : DrugWithCategory = {
        drug;
        categoryType = extractCategoryType(drug);
      };

      switch (drugWithCategory.categoryType) {
        case (#antibiotics) { antibiotics.add(drugWithCategory) };
        case (#painkillers) { painkillers.add(drugWithCategory) };
        case (#fdcs) { fdcs.add(drugWithCategory) };
        case (#vitamins) { vitamins.add(drugWithCategory) };
        case (#other) { others.add(drugWithCategory) };
      };
      all.add(drugWithCategory);
    };

    {
      antibiotics = antibiotics.toArray();
      painkillers = painkillers.toArray();
      fdcs = fdcs.toArray();
      vitamins = vitamins.toArray();
      others = others.toArray();
      all = all.toArray();
    };
  };

  public query ({ caller }) func getDrugSafetyAdvisory(
    drug1 : Text, drug2 : Text, drug3 : Text, drug4 : Text
  ) : async DrugSafetyAdvisory {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view drug safety advisories");
    };

    if (drug1 == "" or drug2 == "" or drug3 == "" or drug4 == "") {
      return {
        pairwiseInteractions = [];
        overallRisk = ?{
          highestSeverityPair = null;
          highestRiskLevel = null;
          topRecommendation = null;
          overallSeverity = null;
        };
        specialPopulations = {
          pregnancy = null;
          lactation = null;
          pediatrics = null;
          geriatrics = null;
        };
      };
    };

    {
      pairwiseInteractions = [];
      overallRisk = ?{
        highestSeverityPair = null;
        highestRiskLevel = null;
        topRecommendation = null;
        overallSeverity = null;
      };
      specialPopulations = {
        pregnancy = null;
        lactation = null;
        pediatrics = null;
        geriatrics = null;
      };
    };
  };

  func filterDrugsByStatus(status : DrugStatus) : [Drug] {
    let filtered = drugTableStore.toArray().filter(func(entry) { entry.1.status == status });
    filtered.map(func((name, drug)) { drug });
  };

  public query ({ caller }) func getFilteredDrugs(status : ?DrugStatus) : async [Drug] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view filtered drugs");
    };
    switch (status) {
      case (?drugStatus) { filterDrugsByStatus(drugStatus) };
      case (null) { drugTableStore.values().toArray() };
    };
  };

  public query ({ caller }) func getPrescriberDetailsByPatientId(patientId : Text) : async ?PrescriberDetails {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view prescriber details");
    };
    prescriberDetailsMap.get(patientId);
  };

  public shared ({ caller }) func savePrescriberDetailsForPatient(patientId : Text, prescriberDetails : PrescriberDetails) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can save prescriber details");
    };

    let validationResult = validatePrescriberDetails(prescriberDetails);

    switch (validationResult) {
      case (#success(validatedDetails)) {
        prescriberDetailsMap.add(patientId, validatedDetails);
      };
      case (#validationError(errorMessage)) {
        Runtime.trap(errorMessage);
      };
    };
  };

  public shared ({ caller }) func refreshAndVerifyDrugTable() : async DrugVerificationResult {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can refresh and verify drug table");
    };

    let allDrugs = drugTableStore.values().toArray();
    let verifiedApprovedDrugs = filterDrugsByStatus(#approved);
    let verifiedBannedDrugs = filterDrugsByStatus(#banned);

    let verificationResult : DrugVerificationResult = {
      allDrugs;
      verifiedApprovedDrugs;
      verifiedBannedDrugs;
      verificationTimestamp = Time.now();
    };

    lastDrugVerification := ?verificationResult;
    lastDrugTableRefresh := ?Time.now();

    verificationResult;
  };

  public query ({ caller }) func getLastDrugVerification() : async ?DrugVerificationResult {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view drug verification results");
    };
    lastDrugVerification;
  };

  public query ({ caller }) func getAllDrugs() : async [Drug] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view all drugs");
    };
    drugTableStore.values().toArray();
  };

  public query ({ caller }) func getApprovedDrugs() : async [Drug] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view approved drugs");
    };
    filterDrugsByStatus(#approved);
  };

  public query ({ caller }) func getBannedDrugs() : async [Drug] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view banned drugs");
    };
    filterDrugsByStatus(#banned);
  };

  public query ({ caller }) func getDrugTableLastRefreshTimestamp() : async ?Time.Time {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view drug table refresh timestamp");
    };
    lastDrugTableRefresh;
  };

  public query ({ caller }) func getDrugTableVerificationReport() : async {
    totalDrugs : Nat;
    approvedDrugs : Nat;
    bannedDrugs : Nat;
    lastVerificationTimestamp : ?Time.Time;
    lastVerifiedDrugCount : ?Nat;
  } {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view drug table verification report");
    };

    let totalDrugs = drugTableStore.size();
    let approvedDrugs = filterDrugsByStatus(#approved).size();
    let bannedDrugs = filterDrugsByStatus(#banned).size();
    let lastVerificationTimestamp = switch (lastDrugVerification) {
      case (null) { null };
      case (?result) { ?result.verificationTimestamp };
    };
    let lastVerifiedDrugCount = switch (lastDrugVerification) {
      case (null) { null };
      case (?result) { ?result.allDrugs.size() };
    };

    {
      totalDrugs;
      approvedDrugs;
      bannedDrugs;
      lastVerificationTimestamp;
      lastVerifiedDrugCount;
    };
  };

  public shared ({ caller }) func bulkUpdateDrugTableStore(drugs : [Drug]) : async BulkDrugStoreUpdateResult {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update the drug table store");
    };

    var added = 0;
    var skippedEmpty = 0;
    var duplicates = 0;
    let errors = List.empty<Text>();

    drugTableStore.clear();

    for (drug in drugs.values()) {
      if (drug.name.trim(#char ' ').size() == 0) {
        skippedEmpty += 1;
        errors.add("Skipped entry due to empty name");
      } else if (drugTableStore.containsKey(drug.name.trim(#char ' '))) {
        duplicates += 1;
        errors.add("Skipped duplicate entry: " # drug.name);
      } else {
        let validCategory = drug.category.trim(#char ' ');
        let validDescription = drug.description.trim(#char ' ');
        let validSafetyInfo = drug.safetyInfo.trim(#char ' ');

        let validSource = switch (drug.source) {
          case (#mimsIndia) { #mimsIndia };
          case (#cdsco) { #cdsco };
          case (#applicationData) { #applicationData };
          case (#other(other)) { #other("Unknown Source") };
        };

        let validatedDrug : Drug = {
          name = drug.name.trim(#char ' ');
          status = drug.status;
          date = Time.now();
          category = if (validCategory.size() > 0) { validCategory } else { "Uncategorized" };
          description = if (validDescription.size() > 0) { validDescription } else {
            "No Description Available";
          };
          source = validSource;
          safetyInfo = if (validSafetyInfo.size() > 0) { validSafetyInfo } else {
            "No Safety Information";
          };
        };

        drugTableStore.add(validatedDrug.name, validatedDrug);
        added += 1;
      };
    };

    {
      added;
      skippedEmpty;
      duplicates;
      totalAfterStore = drugTableStore.size();
      errors = errors.toArray();
    };
  };

  public shared ({ caller }) func bulkUpdateDrugDatabaseStore(drugs : [Drug]) : async BulkDrugStoreUpdateResult {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update the drug store");
    };

    var added = 0;
    var skippedEmpty = 0;
    var duplicates = 0;
    let errors = List.empty<Text>();

    drugDatabaseStore.clear();

    for (drug in drugs.values()) {
      if (drug.name.trim(#char ' ').size() == 0) {
        skippedEmpty += 1;
        errors.add("Skipped entry due to empty name");
      } else if (drugDatabaseStore.containsKey(drug.name.trim(#char ' '))) {
        duplicates += 1;
        errors.add("Skipped duplicate entry: " # drug.name);
      } else {
        let validCategory = drug.category.trim(#char ' ');
        let validDescription = drug.description.trim(#char ' ');
        let validSafetyInfo = drug.safetyInfo.trim(#char ' ');

        let validSource = switch (drug.source) {
          case (#mimsIndia) { #mimsIndia };
          case (#cdsco) { #cdsco };
          case (#applicationData) { #applicationData };
          case (#other(other)) { #other("Unknown Source") };
        };

        let validatedDrug : Drug = {
          name = drug.name.trim(#char ' ');
          status = drug.status;
          date = Time.now();
          category = if (validCategory.size() > 0) { validCategory } else { "Uncategorized" };
          description = if (validDescription.size() > 0) { validDescription } else {
            "No Description Available";
          };
          source = validSource;
          safetyInfo = if (validSafetyInfo.size() > 0) { validSafetyInfo } else {
            "No Safety Information";
          };
        };

        drugDatabaseStore.add(validatedDrug.name, validatedDrug);
        added += 1;
      };
    };

    {
      added;
      skippedEmpty;
      duplicates;
      totalAfterStore = drugDatabaseStore.size();
      errors = errors.toArray();
    };
  };

  public query ({ caller }) func getAllDrugTableStoreDrugs() : async [Drug] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view the drug table store");
    };
    drugTableStore.values().toArray();
  };

  public query ({ caller }) func getAllDrugDatabaseStoreDrugs() : async [Drug] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view the drug database store");
    };
    drugDatabaseStore.values().toArray();
  };

  public query ({ caller }) func getDrugTableStoreByStatus(status : DrugStatus) : async [Drug] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view the drug table store");
    };
    filterDrugTableStoreByStatus(status);
  };

  public query ({ caller }) func getDrugDatabaseStoreByStatus(status : DrugStatus) : async [Drug] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view the drug database store");
    };
    filterDrugDatabaseStoreByStatus(status);
  };

  func filterDrugTableStoreByStatus(status : DrugStatus) : [Drug] {
    let filtered = drugTableStore.toArray().filter(func(entry) { entry.1.status == status });
    filtered.map(func((name, drug)) { drug });
  };

  func filterDrugDatabaseStoreByStatus(status : DrugStatus) : [Drug] {
    let filtered = drugDatabaseStore.toArray().filter(func(entry) { entry.1.status == status });
    filtered.map(func((name, drug)) { drug });
  };

  // New authoritative aggregator
  public shared ({ caller }) func refreshAuthoritativeAggregateDatabase() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can refresh authoritative database");
    };

    // Clear old entries
    authoritativeDrugDatabase.clear();

    // Add drugs from drugTableStore (curated application set)
    for ((name, drug) in drugTableStore.entries()) {
      authoritativeDrugDatabase.add(name, drug);
    };

    // Add drugs from drugDatabaseStore (additional source)
    for ((name, drug) in drugDatabaseStore.entries()) {
      if (not authoritativeDrugDatabase.containsKey(name)) {
        authoritativeDrugDatabase.add(name, drug);
      };
    };

    // Additional sources can be merged using the same logic as above
  };

  public query ({ caller }) func getAuthoritativeDrugDatabase() : async [Drug] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can access authoritative drug database");
    };
    authoritativeDrugDatabase.values().toArray();
  };

  public query ({ caller }) func getAuthoritativeDrugDatabaseByStatus(status : DrugStatus) : async [Drug] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can access authoritative drug database");
    };
    let filtered = authoritativeDrugDatabase.toArray().filter(func(entry) { entry.1.status == status });
    filtered.map(func((name, drug)) { drug });
  };

};
