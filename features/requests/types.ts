export type RequestQueueRecord = {
  id: string;
  employee_name: string;
  type: string;
  starts_at?: string | null;
  ends_at?: string | null;
  status: string;
  created_at: string;
};
export type ShiftClaimQueueRecord = {
  id: string;
  employee_name: string;
  starts_at?: string | null;
  ends_at?: string | null;
  status: string;
  created_at: string;
};
export type ShiftTransferQueueRecord = {
  id: string;
  requested_by_name?: string | null;
  type: "SWAP" | "HANDOVER" | string;
  starts_at?: string | null;
  ends_at?: string | null;
  status: string;
  created_at: string;
};
