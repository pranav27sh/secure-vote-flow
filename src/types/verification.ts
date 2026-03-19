export type VerificationStage = 'aadhaar' | 'biometric' | 'voterId' | 'token';
export type StageStatus = 'pending' | 'active' | 'success' | 'failed';
export type VerificationMode = 'primary' | 'manual';

export interface AuditEntry {
  id: string;
  timestamp: Date;
  action: string;
  status: 'info' | 'success' | 'error' | 'warning';
  details?: string;
}

export interface VerificationState {
  mode: VerificationMode;
  currentStage: number;
  stages: {
    aadhaar: StageStatus;
    biometric: StageStatus;
    voterId: StageStatus;
  };
  token: string | null;
  auditLog: AuditEntry[];
  isOnline: boolean;
}
