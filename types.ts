
export enum Severity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface LintRule {
  id: string;
  name: string;
  description: string;
  severity: Severity;
  impact: string;
  fix: string;
}

export interface ScanFinding {
  ruleId: string;
  detected: boolean;
  evidence?: string;
  details?: string;
}

export interface ScanResult {
  score: number;
  findings: ScanFinding[];
  timestamp: string;
  targetAddress: string;
}

export interface TransactionMock {
  signature: string;
  slot: number;
  instructions: string[];
  memo?: string;
  computeUnits: number;
}
