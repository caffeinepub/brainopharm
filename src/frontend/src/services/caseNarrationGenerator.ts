import { Patient, LabResults, Medication, AdverseDrugReaction, PrescriberDetails, PrescriberPrefix } from '../backend';

export interface CaseSummaryData {
  patient: Patient;
  prescriberDetails?: PrescriberDetails | null;
  labResults: LabResults[];
  medications: Medication[];
  adrs: AdverseDrugReaction[];
}

const getPrefixLabel = (prefix: PrescriberPrefix): string => {
  switch (prefix) {
    case PrescriberPrefix.doctor:
      return 'Dr.';
    case PrescriberPrefix.practitionerNurse:
      return 'Practitioner Nurse';
    case PrescriberPrefix.pharmacist:
      return 'Pharmacist';
    default:
      return 'Dr.';
  }
};

const formatDate = (timestamp: bigint): string => {
  try {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Not available';
  }
};

const getBmiCategory = (bmi: number): string => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

/**
 * Generates a clinically formatted narration from case summary data
 */
export function generateCaseNarration(data: CaseSummaryData): string {
  const { patient, prescriberDetails, labResults, medications, adrs } = data;
  
  let narration = '';

  // Patient Demographics Section
  narration += '=== PATIENT DEMOGRAPHICS ===\n\n';
  narration += `Patient Name: ${patient.name}\n`;
  narration += `Age: ${Number(patient.age)} years\n`;
  narration += `Gender: ${patient.gender}\n`;
  narration += `Nationality: ${patient.nationality}\n`;
  narration += `Height: ${patient.height} cm\n`;
  narration += `Weight: ${patient.weight} kg\n`;
  narration += `BMI: ${patient.bmi.toFixed(1)} (${getBmiCategory(patient.bmi)})\n`;
  
  if (patient.bloodGroup) {
    narration += `Blood Group: ${patient.bloodGroup}\n`;
  }
  if (patient.phone) {
    narration += `Phone: ${patient.phone}\n`;
  }
  if (patient.address) {
    narration += `Address: ${patient.address}\n`;
  }
  
  narration += '\n';

  // Prescriber Details Section
  if (prescriberDetails) {
    narration += '=== PRESCRIBER DETAILS ===\n\n';
    narration += `Name: ${getPrefixLabel(prescriberDetails.prefix)} ${prescriberDetails.fullName}\n`;
    narration += `Registration Number: ${prescriberDetails.registrationNumber}\n`;
    narration += `Specialization: ${prescriberDetails.specialization}\n`;
    narration += `Contact Number: ${prescriberDetails.contactNumber}\n`;
    narration += `Email: ${prescriberDetails.email}\n`;
    narration += `Address: ${prescriberDetails.address}\n\n`;
  }

  // Lab Results Section
  narration += '=== LABORATORY RESULTS ===\n\n';
  if (labResults.length === 0) {
    narration += 'No lab results recorded.\n\n';
  } else {
    labResults.forEach((lab, index) => {
      narration += `Lab Result #${index + 1} (${formatDate(lab.timestamp)}):\n`;
      if (lab.uricAcid !== undefined && lab.uricAcid !== null) {
        narration += `  - Uric Acid: ${lab.uricAcid} mg/dL\n`;
      }
      if (lab.creatinine !== undefined && lab.creatinine !== null) {
        narration += `  - Creatinine: ${lab.creatinine} mg/dL\n`;
      }
      if (lab.bloodPressureSystolic !== undefined && lab.bloodPressureSystolic !== null) {
        narration += `  - Blood Pressure: ${Number(lab.bloodPressureSystolic)}/${Number(lab.bloodPressureDiastolic || 0)} mmHg\n`;
      }
      narration += '\n';
    });
  }

  // Medications Section
  narration += '=== MEDICATIONS ===\n\n';
  if (medications.length === 0) {
    narration += 'No medications recorded.\n\n';
  } else {
    medications.forEach((med, index) => {
      narration += `Medication #${index + 1}: ${med.name}\n`;
      if (med.dosage) {
        narration += `  - Dosage: ${med.dosage}\n`;
      }
      if (med.frequency) {
        narration += `  - Frequency: ${med.frequency}\n`;
      }
      if (med.startDate) {
        narration += `  - Start Date: ${formatDate(med.startDate)}\n`;
      }
      if (med.endDate) {
        narration += `  - End Date: ${formatDate(med.endDate)}\n`;
      }
      narration += '\n';
    });
  }

  // Adverse Drug Reactions Section
  narration += '=== ADVERSE DRUG REACTIONS ===\n\n';
  if (adrs.length === 0) {
    narration += 'No adverse drug reactions recorded.\n\n';
  } else {
    adrs.forEach((adr, index) => {
      narration += `ADR #${index + 1}:\n`;
      narration += `  - Suspected Drug: ${adr.suspectedDrug}\n`;
      narration += `  - Severity: ${adr.severity}\n`;
      narration += `  - Description: ${adr.description}\n`;
      if (adr.onsetDate) {
        narration += `  - Onset Date: ${formatDate(adr.onsetDate)}\n`;
      }
      narration += `  - Reported: ${formatDate(adr.timestamp)}\n`;
      narration += '\n';
    });
  }

  narration += '=== END OF CASE NARRATION ===\n';

  return narration;
}

/**
 * Generates a structured prompt for external LLM tools (Perplexity/Copilot/ChatGPT/Gemini)
 */
export function generateExternalToolPrompt(data: CaseSummaryData): string {
  const { patient, prescriberDetails, labResults, medications, adrs } = data;
  
  let prompt = '';

  prompt += 'Please generate a comprehensive clinical case narration based on the following patient data:\n\n';

  // Patient Section
  prompt += '## PATIENT INFORMATION\n\n';
  prompt += `- Name: ${patient.name}\n`;
  prompt += `- Age: ${Number(patient.age)} years\n`;
  prompt += `- Gender: ${patient.gender}\n`;
  prompt += `- Nationality: ${patient.nationality}\n`;
  prompt += `- Height: ${patient.height} cm\n`;
  prompt += `- Weight: ${patient.weight} kg\n`;
  prompt += `- BMI: ${patient.bmi.toFixed(1)} (${getBmiCategory(patient.bmi)})\n`;
  
  if (patient.bloodGroup) {
    prompt += `- Blood Group: ${patient.bloodGroup}\n`;
  }
  if (patient.phone) {
    prompt += `- Phone: ${patient.phone}\n`;
  }
  if (patient.address) {
    prompt += `- Address: ${patient.address}\n`;
  }
  
  prompt += '\n';

  // Prescriber Section
  if (prescriberDetails) {
    prompt += '## PRESCRIBER INFORMATION\n\n';
    prompt += `- Name: ${getPrefixLabel(prescriberDetails.prefix)} ${prescriberDetails.fullName}\n`;
    prompt += `- Registration Number: ${prescriberDetails.registrationNumber}\n`;
    prompt += `- Specialization: ${prescriberDetails.specialization}\n`;
    prompt += `- Contact Number: ${prescriberDetails.contactNumber}\n`;
    prompt += `- Email: ${prescriberDetails.email}\n`;
    prompt += `- Address: ${prescriberDetails.address}\n\n`;
  }

  // Lab Results Section
  prompt += '## LABORATORY RESULTS\n\n';
  if (labResults.length === 0) {
    prompt += 'No lab results recorded.\n\n';
  } else {
    labResults.forEach((lab, index) => {
      prompt += `### Lab Result #${index + 1} (${formatDate(lab.timestamp)})\n\n`;
      if (lab.uricAcid !== undefined && lab.uricAcid !== null) {
        prompt += `- Uric Acid: ${lab.uricAcid} mg/dL\n`;
      }
      if (lab.creatinine !== undefined && lab.creatinine !== null) {
        prompt += `- Creatinine: ${lab.creatinine} mg/dL\n`;
      }
      if (lab.bloodPressureSystolic !== undefined && lab.bloodPressureSystolic !== null) {
        prompt += `- Blood Pressure: ${Number(lab.bloodPressureSystolic)}/${Number(lab.bloodPressureDiastolic || 0)} mmHg\n`;
      }
      prompt += '\n';
    });
  }

  // Medications Section
  prompt += '## MEDICATIONS\n\n';
  if (medications.length === 0) {
    prompt += 'No medications recorded.\n\n';
  } else {
    medications.forEach((med, index) => {
      prompt += `### Medication #${index + 1}\n\n`;
      prompt += `- Drug Name: ${med.name}\n`;
      if (med.dosage) {
        prompt += `- Dosage: ${med.dosage}\n`;
      }
      if (med.frequency) {
        prompt += `- Frequency: ${med.frequency}\n`;
      }
      if (med.startDate) {
        prompt += `- Start Date: ${formatDate(med.startDate)}\n`;
      }
      if (med.endDate) {
        prompt += `- End Date: ${formatDate(med.endDate)}\n`;
      }
      prompt += '\n';
    });
  }

  // ADRs Section
  prompt += '## ADVERSE DRUG REACTIONS\n\n';
  if (adrs.length === 0) {
    prompt += 'No adverse drug reactions recorded.\n\n';
  } else {
    adrs.forEach((adr, index) => {
      prompt += `### ADR #${index + 1}\n\n`;
      prompt += `- Suspected Drug: ${adr.suspectedDrug}\n`;
      prompt += `- Severity: ${adr.severity}\n`;
      prompt += `- Description: ${adr.description}\n`;
      if (adr.onsetDate) {
        prompt += `- Onset Date: ${formatDate(adr.onsetDate)}\n`;
      }
      prompt += `- Reported: ${formatDate(adr.timestamp)}\n`;
      prompt += '\n';
    });
  }

  prompt += '---\n\n';
  prompt += 'Please provide a comprehensive clinical case narration that:\n';
  prompt += '1. Summarizes the patient demographics and clinical presentation\n';
  prompt += '2. Analyzes the laboratory findings and their clinical significance\n';
  prompt += '3. Reviews the medication regimen and potential interactions\n';
  prompt += '4. Evaluates the adverse drug reactions and their relationship to the medications\n';
  prompt += '5. Provides clinical recommendations and follow-up suggestions\n';

  return prompt;
}
