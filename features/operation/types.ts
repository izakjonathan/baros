export type OperationArticleKind = "HANDBOOK" | "NEWS";
export type OperationNeedStatus = "NEEDED" | "ORDERED";
export type OperationStorageStatus = "ready" | "migration-required";
export type OperationTaskRepeatUnit = "NONE" | "DAY" | "WEEK" | "MONTH" | "YEAR";
export type OperationTaskPriority = "LOW" | "NORMAL" | "HIGH";
export type OperationTaskType = "OPENING" | "SERVICE" | "CLOSING" | "MAINTENANCE" | "ADMIN";

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
  assignedEmployeeId: string | null;
  assignedEmployeeName: string | null;
  completedByName: string | null;
  completed: boolean;
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
  if (task.repeatUnit === "MONTH") return target.getUTCDate() === start.getUTCDate() && ((target.getUTCFullYear() - start.getUTCFullYear()) * 12 + target.getUTCMonth() - start.getUTCMonth()) % task.repeatInterval === 0;
  return target.getUTCMonth() === start.getUTCMonth() && target.getUTCDate() === start.getUTCDate() && (target.getUTCFullYear() - start.getUTCFullYear()) % task.repeatInterval === 0;
}

export type OperationNeed = {
  id: string;
  title: string;
  note: string | null;
  status: OperationNeedStatus;
  createdAt: string;
};

export type OperationModuleState = {
  userRole: string;
  canManageContent: boolean;
  storageStatus: OperationStorageStatus;
  today: string;
  handbook: OperationArticle[];
  news: OperationArticle[];
  dailyTasks: OperationDailyTask[];
  assignees: OperationAssignee[];
  needs: OperationNeed[];
};
