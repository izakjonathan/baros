export type OperationArticleKind = "HANDBOOK" | "NEWS";
export type OperationNeedStatus = "NEEDED" | "ORDERED";

export type OperationContentBlock =
  | { type: "title"; text: string }
  | { type: "h1"; text: string }
  | { type: "h2"; text: string }
  | { type: "body"; text: string }
  | { type: "bullets"; items: string[] }
  | { type: "numbered"; items: string[] }
  | { type: "image"; src: string; alt: string }
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
  completed: boolean;
};

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
  today: string;
  handbook: OperationArticle[];
  news: OperationArticle[];
  dailyTasks: OperationDailyTask[];
  needs: OperationNeed[];
};
