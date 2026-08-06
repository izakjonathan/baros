export type OperationChecklistRecord = {
  id: string;
  title: string;
  task_type: "Opening" | "Closing" | "Task" | "Maintenance";
  owner_label?: string | null;
  due_label?: string | null;
  completed_at?: string | null;
};

export function parseOperationChecklistRecords(value: unknown): OperationChecklistRecord[] {
  if (typeof value !== "object" || value === null || !Array.isArray((value as { items?: unknown }).items)) {
    throw new Error("Checklist response is invalid");
  }
  return (value as { items: OperationChecklistRecord[] }).items;
}
