export type DataSet = 'minimal' | 'standard' | 'full';
export type PurgeLevel = 'transactions_only' | 'all_non_seed' | 'complete_reset';

export interface PopulationConfig {
  dataSet: DataSet;
  companyId?: string;
  modules?: string[];
}

export interface PurgeConfig {
  purgeLevel: PurgeLevel;
  companyId?: string;
  dryRun?: boolean;
  confirmationToken?: string;
}

export interface TableStatistics {
  table_name: string;
  total_records: number;
  protected_records: number;
  deletable_records: number;
}

export interface PopulationResult {
  success: boolean;
  tablesPopulated: number;
  recordsCreated: number;
  errors: string[];
  details: { table: string; count: number }[];
}

export interface PurgeResult {
  success: boolean;
  tablesAffected: number;
  recordsDeleted: number;
  preservedRecords: number;
  errors: string[];
  details: { table: string; deleted: number; preserved: number }[];
}

export interface TableDependency {
  table_name: string;
  depth: number;
  parent_tables: string[];
}

export const DATA_SET_DESCRIPTIONS: Record<DataSet, { label: string; description: string; employees: string; duration: string }> = {
  minimal: {
    label: 'Minimal',
    description: '1 company, basic configuration',
    employees: '5 employees',
    duration: 'Current month only'
  },
  standard: {
    label: 'Standard',
    description: '1 company, full configuration',
    employees: '25 employees',
    duration: '3 months of data'
  },
  full: {
    label: 'Full',
    description: '3 companies, comprehensive setup',
    employees: '100+ employees',
    duration: '12 months of data'
  }
};

export const PURGE_LEVEL_DESCRIPTIONS: Record<PurgeLevel, { label: string; description: string; preserves: string; color: string }> = {
  transactions_only: {
    label: 'Transactions Only',
    description: 'Delete time entries, leave requests, payroll runs, goals',
    preserves: 'Config, employees, org structure preserved',
    color: 'bg-yellow-500/10 text-yellow-600'
  },
  all_non_seed: {
    label: 'All Non-Seed Data',
    description: 'Delete employees, org structure, company data',
    preserves: 'System roles, lookup values, templates preserved',
    color: 'bg-orange-500/10 text-orange-600'
  },
  complete_reset: {
    label: 'Complete Reset',
    description: 'Delete everything except seed data',
    preserves: 'Only seed data preserved',
    color: 'bg-red-500/10 text-red-600'
  }
};
