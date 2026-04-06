/**
 * Client-side drug list verification service
 * Validates drug datasets using the same normalization/deduplication rules as the curated dataset
 */

import { Drug, DrugStatus } from '../backend';
import { normalizeDrugName } from '../data/curatedDrugDataset';

export interface DrugVerificationReport {
  passed: boolean;
  totalCount: number;
  emptyNameCount: number;
  invalidStatusCount: number;
  duplicateCount: number;
  summary: string;
}

/**
 * Verify a drug list for common data quality issues
 * Returns a detailed report with pass/fail status and English summary
 */
export function verifyDrugList(drugs: Drug[]): DrugVerificationReport {
  const totalCount = drugs.length;
  let emptyNameCount = 0;
  let invalidStatusCount = 0;
  let duplicateCount = 0;

  // Track normalized names to detect duplicates
  const normalizedNames = new Map<string, number>();

  for (const drug of drugs) {
    // Check for empty names
    if (!drug.name || drug.name.trim() === '') {
      emptyNameCount++;
    }

    // Check for invalid/missing status
    if (drug.status !== DrugStatus.approved && drug.status !== DrugStatus.banned) {
      invalidStatusCount++;
    }

    // Check for duplicates using normalized names
    if (drug.name) {
      const normalized = normalizeDrugName(drug.name);
      const count = normalizedNames.get(normalized) || 0;
      normalizedNames.set(normalized, count + 1);
    }
  }

  // Count duplicates (entries that appear more than once)
  for (const count of normalizedNames.values()) {
    if (count > 1) {
      duplicateCount += count - 1; // Count extra occurrences as duplicates
    }
  }

  // Determine pass/fail
  const passed = totalCount > 0 && emptyNameCount === 0 && invalidStatusCount === 0 && duplicateCount === 0;

  // Generate English summary
  let summary = '';
  if (passed) {
    summary = `✓ Verification passed: ${totalCount} drugs validated successfully with no issues detected.`;
  } else {
    const issues: string[] = [];
    if (totalCount === 0) {
      issues.push('no drugs found');
    }
    if (emptyNameCount > 0) {
      issues.push(`${emptyNameCount} drug${emptyNameCount > 1 ? 's' : ''} with empty names`);
    }
    if (invalidStatusCount > 0) {
      issues.push(`${invalidStatusCount} drug${invalidStatusCount > 1 ? 's' : ''} with invalid status`);
    }
    if (duplicateCount > 0) {
      issues.push(`${duplicateCount} duplicate drug${duplicateCount > 1 ? 's' : ''} detected`);
    }
    summary = `✗ Verification failed: ${issues.join(', ')}. Total drugs: ${totalCount}.`;
  }

  return {
    passed,
    totalCount,
    emptyNameCount,
    invalidStatusCount,
    duplicateCount,
    summary,
  };
}
