export type OperationArticleKind = "HANDBOOK" | "NEWS";
export type OperationNeedStatus = "NEEDED" | "ORDERED" | "RESOLVED" | "DISMISSED";
export type OperationReminderType = "RESTOCK" | "NEW_ITEM" | "ISSUE";
export type OperationReminderStockLevel = "LOW" | "OUT_OF" | null;
export type OperationStorageStatus = "ready" | "migration-required";
export type OperationTaskRepeatUnit = "NONE" | "DAY" | "WEEK" | "MONTH" | "YEAR";
export type OperationTaskPriority = "LOW" | "NORMAL" | "HIGH";
export type OperationTaskType = "OPENING" | "SERVICE" | "CLOSING" | "MAINTENANCE" | "ADMIN";
export type OperationTaskAssignmentScope = "EMPLOYEE" | "ON_SHIFT" | "EVERYONE";

export type OperationRichTextOp = {
  insert: string | { image: string };
  attributes?: Record<string, string | number | boolean | null>;
};

export type OperationRichTextDelta = {
  ops: OperationRichTextOp[];
};

export type OperationTiptapNode = {
  type: string;
  attrs?: Record<string, string | number | boolean | null>;
  marks?: Array<{ type: string; attrs?: Record<string, string | number | boolean | null> }>;
  text?: string;
  content?: OperationTiptapNode[];
};

export type OperationTiptapDocument = {
  type: "doc";
  content: OperationTiptapNode[];
};

export type OperationContentBlock =
  | { type: "title"; text: string }
  | { type: "h1"; text: string }
  | { type: "h2"; text: string }
  | { type: "body"; text: string }
  | { type: "bullets"; items: string[] }
  | { type: "numbered"; items: string[] }
  | { type: "image"; src: string; alt: string }
  | { type: "richText"; delta: OperationRichTextDelta }
  | { type: "tiptap"; document: OperationTiptapDocument }
  | { type: "articleLink"; articleId: string; label: string };

export type OperationArticle = {
  id: string;
  kind: OperationArticleKind;
  category: string;
  title: string;
  description: string;
  content: OperationContentBlock[];
  published: boolean;
  updatedAt: string;
};

export type OperationDailyTask = {
  id: string;
  weekday: number;
  title: string;
  description: string;
  dueDate: string;
  repeatUnit: OperationTaskRepeatUnit;
  repeatInterval: number;
  repeatEndDate: string | null;
  dueTime: string | null;
  reminderMinutes: number | null;
  priority: OperationTaskPriority;
  taskType: OperationTaskType;
  assignmentScope: OperationTaskAssignmentScope;
  assignedEmployeeId: string | null;
  assignedEmployeeName: string | null;
  completedByName: string | null;
  checklist: Array<{ id: string; label: string; completed: boolean }>;
  completed: boolean;
};

export type OperationTaskTemplate = {
  id: string;
  title: string;
  description: string;
  taskType: OperationTaskType;
  priority: OperationTaskPriority;
  dueTime: string | null;
  reminderMinutes: number | null;
  checklist: Array<{ id: string; label: string }>;
};

export type OperationAssignee = {
  id: string;
  name: string;
};

export function isOperationTaskDue(task: Pick<OperationDailyTask, "dueDate" | "repeatUnit" | "repeatInterval" | "repeatEndDate">, date: string) {
  const start = new Date(`${task.dueDate}T00:00:00Z`);
  const target = new Date(`${date}T00:00:00Z`);
  const end = task.repeatEndDate ? new Date(`${task.repeatEndDate}T00:00:00Z`) : null;
  if (Number.isNaN(start.valueOf()) || target < start || (end && target > end)) return false;
  const days = Math.floor((target.valueOf() - start.valueOf()) / 86_400_000);
  if (task.repeatUnit === "NONE") return days === 0;
  if (task.repeatUnit === "DAY") return days % task.repeatInterval === 0;
  if (task.repeatUnit === "WEEK") return target.getUTCDay() === start.getUTCDay() && Math.floor(days / 7) % task.repeatInterval === 0;
  if (task.repeatUnit === "MONTH") {
    const months = (target.getUTCFullYear() - start.getUTCFullYear()) * 12 + target.getUTCMonth() - start.getUTCMonth();
    const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
    return months % task.repeatInterval === 0 && target.getUTCDate() === Math.min(start.getUTCDate(), lastDay);
  }
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), start.getUTCMonth() + 1, 0)).getUTCDate();
  return target.getUTCMonth() === start.getUTCMonth() && target.getUTCDate() === Math.min(start.getUTCDate(), lastDay) && (target.getUTCFullYear() - start.getUTCFullYear()) % task.repeatInterval === 0;
}

export type OperationNeed = {
  id: string;
  title: string;
  note: string | null;
  status: OperationNeedStatus;
  createdAt: string;
  updatedAt: string;
  type: OperationReminderType;
  stockLevel: OperationReminderStockLevel;
};

export type OperationMetrics = {
  completionRate: number;
  completedCount: number;
  dueCount: number;
  overdueCount: number;
  openNeedsCount: number;
  overdueNeedsCount: number;
};

export type OperationModuleState = {
  userRole: string;
  canManageContent: boolean;
  canManageTasks: boolean;
  storageStatus: OperationStorageStatus;
  today: string;
  handbook: OperationArticle[];
  news: OperationArticle[];
  dailyTasks: OperationDailyTask[];
  assignees: OperationAssignee[];
  taskTemplates: OperationTaskTemplate[];
  metrics: OperationMetrics;
  needs: OperationNeed[];
};
