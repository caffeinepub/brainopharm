/**
 * Drug Dataset Import Service
 * Client-side parsing and normalization for admin bulk drug imports
 * Supports JSON and CSV formats with validation
 */

import { Drug, DrugStatus, DrugSource } from '../backend';

export interface ParsedDrugDataset {
  drugs: Drug[];
  errors: string[];
  warnings: string[];
  totalParsed: number;
}

/**
 * Parse JSON drug dataset
 */
export function parseJSONDataset(jsonContent: string): ParsedDrugDataset {
  const errors: string[] = [];
  const warnings: string[] = [];
  const drugs: Drug[] = [];

  try {
    const parsed = JSON.parse(jsonContent);
    const drugArray = Array.isArray(parsed) ? parsed : [parsed];

    for (let i = 0; i < drugArray.length; i++) {
      const item = drugArray[i];
      
      try {
        const drug = normalizeDrugRecord(item, i);
        if (drug) {
          drugs.push(drug);
        } else {
          warnings.push(`Row ${i + 1}: Skipped due to missing required fields`);
        }
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`);
      }
    }

    return {
      drugs,
      errors,
      warnings,
      totalParsed: drugArray.length,
    };
  } catch (error) {
    return {
      drugs: [],
      errors: [`Invalid JSON format: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: [],
      totalParsed: 0,
    };
  }
}

/**
 * Parse CSV drug dataset
 */
export function parseCSVDataset(csvContent: string): ParsedDrugDataset {
  const errors: string[] = [];
  const warnings: string[] = [];
  const drugs: Drug[] = [];

  try {
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      return {
        drugs: [],
        errors: ['CSV file is empty'],
        warnings: [],
        totalParsed: 0,
      };
    }

    // Parse header
    const header = parseCSVLine(lines[0]);
    const headerMap = createHeaderMap(header);

    // Validate required columns
    const requiredColumns = ['name', 'status'];
    const missingColumns = requiredColumns.filter(col => !headerMap.has(col));
    
    if (missingColumns.length > 0) {
      return {
        drugs: [],
        errors: [`Missing required columns: ${missingColumns.join(', ')}`],
        warnings: [],
        totalParsed: 0,
      };
    }

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i]);
        const rowData: Record<string, string> = {};
        
        header.forEach((col, idx) => {
          rowData[col.toLowerCase().trim()] = values[idx] || '';
        });

        const drug = normalizeDrugRecord(rowData, i);
        if (drug) {
          drugs.push(drug);
        } else {
          warnings.push(`Row ${i + 1}: Skipped due to missing required fields`);
        }
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`);
      }
    }

    return {
      drugs,
      errors,
      warnings,
      totalParsed: lines.length - 1,
    };
  } catch (error) {
    return {
      drugs: [],
      errors: [`CSV parse error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: [],
      totalParsed: 0,
    };
  }
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * Create a map of column names to indices
 */
function createHeaderMap(header: string[]): Map<string, number> {
  const map = new Map<string, number>();
  header.forEach((col, idx) => {
    map.set(col.toLowerCase().trim(), idx);
  });
  return map;
}

/**
 * Normalize a drug record from parsed data
 */
function normalizeDrugRecord(data: any, rowIndex: number): Drug | null {
  // Extract and validate name
  const name = String(data.name || data.drugName || data.drug_name || '').trim();
  if (!name) {
    return null;
  }

  // Extract and validate status
  const statusStr = String(data.status || '').toLowerCase().trim();
  let status: DrugStatus;
  
  if (statusStr === 'approved' || statusStr === 'approve') {
    status = DrugStatus.approved;
  } else if (statusStr === 'banned' || statusStr === 'ban') {
    status = DrugStatus.banned;
  } else {
    throw new Error(`Invalid status "${statusStr}". Must be "approved" or "banned"`);
  }

  // Extract optional fields with defaults
  const category = String(data.category || data.type || 'General').trim();
  const description = String(data.description || data.desc || 'No description available').trim();
  const safetyInfo = String(data.safetyInfo || data.safety_info || data.safety || 'No safety information available').trim();

  // Parse source
  const sourceStr = String(data.source || 'other').toLowerCase().trim();
  let source: DrugSource;
  
  if (sourceStr === 'cdsco') {
    source = { __kind__: 'cdsco', cdsco: null };
  } else if (sourceStr === 'mims' || sourceStr === 'mimsindia' || sourceStr === 'mims india') {
    source = { __kind__: 'mimsIndia', mimsIndia: null };
  } else if (sourceStr === 'applicationdata' || sourceStr === 'application') {
    source = { __kind__: 'applicationData', applicationData: null };
  } else {
    source = { __kind__: 'other', other: sourceStr || 'Unknown' };
  }

  // Parse date (use current time if not provided)
  let date: bigint;
  if (data.date) {
    try {
      const parsedDate = new Date(data.date);
      if (!isNaN(parsedDate.getTime())) {
        date = BigInt(parsedDate.getTime() * 1000000);
      } else {
        date = BigInt(Date.now() * 1000000);
      }
    } catch {
      date = BigInt(Date.now() * 1000000);
    }
  } else {
    date = BigInt(Date.now() * 1000000);
  }

  return {
    name,
    status,
    date,
    category,
    description,
    source,
    safetyInfo,
  };
}

/**
 * Validate parsed dataset before sending to backend
 */
export function validateDataset(drugs: Drug[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (drugs.length === 0) {
    errors.push('Dataset is empty');
    return { valid: false, errors };
  }

  // Check for empty names
  const emptyNames = drugs.filter(d => !d.name || d.name.trim() === '');
  if (emptyNames.length > 0) {
    errors.push(`${emptyNames.length} drug(s) have empty names`);
  }

  // Check for duplicate names (case-insensitive)
  const nameMap = new Map<string, number>();
  drugs.forEach(drug => {
    const normalizedName = drug.name.toLowerCase().trim();
    nameMap.set(normalizedName, (nameMap.get(normalizedName) || 0) + 1);
  });
  
  const duplicates = Array.from(nameMap.entries()).filter(([_, count]) => count > 1);
  if (duplicates.length > 0) {
    errors.push(`${duplicates.length} duplicate drug name(s) detected (backend will handle deduplication)`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
