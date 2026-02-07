export const idlFactory = ({ IDL }: any) => {
  const Time = IDL.Int;
  const UserRole = IDL.Variant({
    'admin': IDL.Null,
    'user': IDL.Null,
    'guest': IDL.Null,
  });
  const UserProfile = IDL.Record({
    'name': IDL.Text,
    'role': IDL.Text,
    'email': IDL.Opt(IDL.Text),
  });
  const Patient = IDL.Record({
    'age': IDL.Nat,
    'bmi': IDL.Float64,
    'weight': IDL.Float64,
    'height': IDL.Float64,
    'patientId': IDL.Text,
    'name': IDL.Text,
    'nationality': IDL.Text,
    'bloodGroup': IDL.Opt(IDL.Text),
    'address': IDL.Opt(IDL.Text),
    'gender': IDL.Text,
    'timestamp': Time,
    'phone': IDL.Opt(IDL.Text),
  });
  const LabResults = IDL.Record({
    'patientId': IDL.Text,
    'labResultsId': IDL.Text,
    'timestamp': Time,
    'bloodPressureDiastolic': IDL.Opt(IDL.Nat),
    'creatinine': IDL.Opt(IDL.Float64),
    'bloodPressureSystolic': IDL.Opt(IDL.Nat),
    'uricAcid': IDL.Opt(IDL.Float64),
  });
  const Medication = IDL.Record({
    'endDate': IDL.Opt(Time),
    'dosage': IDL.Opt(IDL.Text),
    'patientId': IDL.Text,
    'name': IDL.Text,
    'medicationId': IDL.Text,
    'timestamp': Time,
    'frequency': IDL.Opt(IDL.Text),
    'startDate': IDL.Opt(Time),
  });
  const AdverseDrugReaction = IDL.Record({
    'onsetDate': IDL.Opt(Time),
    'adrId': IDL.Text,
    'patientId': IDL.Text,
    'description': IDL.Text,
    'timestamp': Time,
    'suspectedDrug': IDL.Text,
    'severity': IDL.Text,
  });
  const ChatMessage = IDL.Record({
    'id': IDL.Nat,
    'sender': IDL.Text,
    'message': IDL.Text,
    'timestamp': Time,
  });
  const RestrictedDrug = IDL.Record({
    'name': IDL.Text,
    'description': IDL.Text,
    'category': IDL.Text,
    'safetyInfo': IDL.Text,
  });
  const RestrictedDrugCategory = IDL.Record({
    'name': IDL.Text,
    'description': IDL.Text,
    'drugs': IDL.Vec(RestrictedDrug),
  });
  const OCRStatus = IDL.Variant({
    'pending': IDL.Null,
    'processed': IDL.Null,
    'failed': IDL.Null,
  });
  const PrescriptionImage = IDL.Record({
    'id': IDL.Text,
    'patientId': IDL.Text,
    'errorMessage': IDL.Opt(IDL.Text),
    'ocrStatus': OCRStatus,
    'extractedText': IDL.Opt(IDL.Text),
    'processingTime': IDL.Opt(Time),
    'imageUrl': IDL.Text,
    'uploadTime': Time,
  });
  const NarrationStatus = IDL.Variant({
    'finalized': IDL.Null,
    'reviewed': IDL.Null,
    'draft': IDL.Null,
  });
  const CaseNarration = IDL.Record({
    'status': NarrationStatus,
    'content': IDL.Text,
    'generatedSummary': IDL.Opt(IDL.Text),
    'patientId': IDL.Text,
    'lastModified': Time,
    'version': IDL.Nat,
    'narrationId': IDL.Text,
    'timestamp': Time,
  });
  const ResourceStatus = IDL.Variant({
    'active': IDL.Null,
    'pending': IDL.Null,
    'redirected': IDL.Null,
    'archived': IDL.Null,
    'unavailable': IDL.Null,
  });
  const ExternalResource = IDL.Record({
    'id': IDL.Text,
    'url': IDL.Text,
    'status': ResourceStatus,
    'synchronizationLogs': IDL.Vec(IDL.Text),
    'name': IDL.Text,
    'lastUpdated': Time,
    'description': IDL.Text,
    'contentSummary': IDL.Opt(IDL.Text),
  });
  const InteractionType = IDL.Variant({
    'pharmacokinetic': IDL.Null,
    'both': IDL.Null,
    'pharmacodynamic': IDL.Null,
  });
  const EvidenceLevel = IDL.Variant({
    'clinicalTrial': IDL.Null,
    'others': IDL.Null,
    'regulatoryAgency': IDL.Null,
    'metaAnalysis': IDL.Null,
    'caseReport': IDL.Null,
    'expertOpinion': IDL.Null,
  });
  const Severity = IDL.Variant({
    'major': IDL.Null,
    'minor': IDL.Null,
    'contraindicated': IDL.Null,
    'moderate': IDL.Null,
  });
  const DrugInteraction = IDL.Record({
    'interactionType': InteractionType,
    'references': IDL.Vec(IDL.Text),
    'evidenceLevel': EvidenceLevel,
    'description': IDL.Text,
    'severity': Severity,
    'drug1': IDL.Text,
    'drug2': IDL.Text,
  });
  const FourDrugInteractionInput = IDL.Record({
    'drug1': IDL.Text,
    'drug2': IDL.Text,
    'drug3': IDL.Text,
    'drug4': IDL.Text,
  });
  const DrugInteractionPair = IDL.Record({
    'drugA': IDL.Text,
    'drugB': IDL.Text,
  });
  const DrugPairResult = IDL.Record({
    'interactionType': IDL.Opt(InteractionType),
    'references': IDL.Vec(IDL.Text),
    'evidenceLevel': IDL.Opt(EvidenceLevel),
    'description': IDL.Opt(IDL.Text),
    'severity': IDL.Opt(Severity),
    'drugs': DrugInteractionPair,
  });
  const FourDrugInteractionOutput = IDL.Record({
    'pairResults': IDL.Vec(DrugPairResult),
    'overallSeverity': IDL.Opt(IDL.Text),
  });
  const DrugStatus = IDL.Variant({
    'banned': IDL.Null,
    'approved': IDL.Null,
  });
  const DrugSource = IDL.Variant({
    'other': IDL.Text,
    'cdsco': IDL.Null,
    'mimsIndia': IDL.Null,
    'applicationData': IDL.Null,
  });
  const Drug = IDL.Record({
    'status': DrugStatus,
    'source': DrugSource,
    'date': Time,
    'name': IDL.Text,
    'description': IDL.Text,
    'category': IDL.Text,
    'safetyInfo': IDL.Text,
  });
  const DrugCategoryType = IDL.Variant({
    'painkillers': IDL.Null,
    'other': IDL.Null,
    'fdcs': IDL.Null,
    'antibiotics': IDL.Null,
    'vitamins': IDL.Null,
  });
  const DrugWithCategory = IDL.Record({
    'categoryType': DrugCategoryType,
    'drug': Drug,
  });
  const CategorizedDrugs = IDL.Record({
    'all': IDL.Vec(DrugWithCategory),
    'painkillers': IDL.Vec(DrugWithCategory),
    'fdcs': IDL.Vec(DrugWithCategory),
    'others': IDL.Vec(DrugWithCategory),
    'antibiotics': IDL.Vec(DrugWithCategory),
    'vitamins': IDL.Vec(DrugWithCategory),
  });

  return IDL.Service({
    'addADR': IDL.Func(
      [IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Opt(Time)],
      [IDL.Record({
        'status': IDL.Text,
        'adrId': IDL.Opt(IDL.Text),
        'error': IDL.Opt(IDL.Text),
      })],
      [],
    ),
    'addCaseNarration': IDL.Func(
      [IDL.Text, IDL.Text],
      [IDL.Record({
        'status': IDL.Text,
        'error': IDL.Opt(IDL.Text),
        'narrationId': IDL.Opt(IDL.Text),
      })],
      [],
    ),
    'addChatMessage': IDL.Func([IDL.Text, IDL.Text], [IDL.Nat], []),
    'addDrug': IDL.Func([Drug], [], []),
    'addDrugInteraction': IDL.Func([DrugInteraction], [], []),
    'addExternalResource': IDL.Func([ExternalResource], [], []),
    'addLabResults': IDL.Func(
      [IDL.Text, IDL.Opt(IDL.Float64), IDL.Opt(IDL.Float64), IDL.Opt(IDL.Nat), IDL.Opt(IDL.Nat)],
      [IDL.Record({
        'status': IDL.Text,
        'labResultsId': IDL.Opt(IDL.Text),
        'error': IDL.Opt(IDL.Text),
      })],
      [],
    ),
    'addMedication': IDL.Func(
      [IDL.Text, IDL.Text, IDL.Opt(IDL.Text), IDL.Opt(IDL.Text), IDL.Opt(Time), IDL.Opt(Time)],
      [IDL.Record({
        'status': IDL.Text,
        'error': IDL.Opt(IDL.Text),
        'medicationId': IDL.Opt(IDL.Text),
      })],
      [],
    ),
    'addNewPatient': IDL.Func(
      [IDL.Text, IDL.Nat, IDL.Text, IDL.Float64, IDL.Float64, IDL.Text, IDL.Opt(IDL.Text), IDL.Opt(IDL.Text), IDL.Opt(IDL.Text)],
      [IDL.Record({
        'status': IDL.Text,
        'patientId': IDL.Opt(IDL.Text),
        'error': IDL.Opt(IDL.Text),
      })],
      [],
    ),
    'addPrescriptionImage': IDL.Func(
      [IDL.Text, IDL.Text],
      [IDL.Record({
        'status': IDL.Text,
        'error': IDL.Opt(IDL.Text),
        'imageId': IDL.Opt(IDL.Text),
      })],
      [],
    ),
    'addRestrictedDrugCategory': IDL.Func([RestrictedDrugCategory], [], []),
    'assignCallerUserRole': IDL.Func([IDL.Principal, UserRole], [], []),
    'checkDrugInteraction': IDL.Func([IDL.Text, IDL.Text], [IDL.Opt(DrugInteraction)], []),
    'checkFourDrugInteraction': IDL.Func([FourDrugInteractionInput], [FourDrugInteractionOutput], []),
    'deletePatient': IDL.Func(
      [IDL.Text],
      [IDL.Record({
        'status': IDL.Text,
        'error': IDL.Opt(IDL.Text),
      })],
      [],
    ),
    'getADRsByPatient': IDL.Func([IDL.Text], [IDL.Vec(AdverseDrugReaction)], ['query']),
    'getAllDrugs': IDL.Func([], [IDL.Vec(Drug)], ['query']),
    'getAllPatients': IDL.Func([], [IDL.Vec(Patient)], ['query']),
    'getCallerUserProfile': IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
    'getCallerUserRole': IDL.Func([], [UserRole], ['query']),
    'getCaseNarrationsByPatient': IDL.Func([IDL.Text], [IDL.Vec(CaseNarration)], ['query']),
    'getCategorizedDrugs': IDL.Func([], [CategorizedDrugs], ['query']),
    'getChatMessages': IDL.Func([], [IDL.Vec(ChatMessage)], ['query']),
    'getExternalResources': IDL.Func([], [IDL.Vec(ExternalResource)], ['query']),
    'getLabResultsByPatient': IDL.Func([IDL.Text], [IDL.Vec(LabResults)], ['query']),
    'getMedicationsByPatient': IDL.Func([IDL.Text], [IDL.Vec(Medication)], ['query']),
    'getPrescriptionImagesByPatient': IDL.Func([IDL.Text], [IDL.Vec(PrescriptionImage)], ['query']),
    'getRestrictedDrugCategories': IDL.Func([], [IDL.Vec(RestrictedDrugCategory)], ['query']),
    'getUserProfile': IDL.Func([IDL.Principal], [IDL.Opt(UserProfile)], ['query']),
    'initializeAccessControl': IDL.Func([], [], []),
    'isCallerAdmin': IDL.Func([], [IDL.Bool], ['query']),
    'saveCallerUserProfile': IDL.Func([UserProfile], [], []),
    'searchDrugs': IDL.Func([IDL.Text], [IDL.Vec(Drug)], ['query']),
  });
};
