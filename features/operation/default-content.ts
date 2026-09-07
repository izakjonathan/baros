import type { OperationModuleState } from "./types";

export const defaultOperationState: OperationModuleState = {
  userRole: "OWNER",
  canManageContent: true,
  today: new Date().toISOString().slice(0, 10),
  handbook: [
    {
      id: "handbook-opening",
      kind: "HANDBOOK",
      category: "Opening",
      title: "Opening the bar",
      description: "Core opening routine before the first guests arrive.",
      published: true,
      updatedAt: new Date().toISOString(),
      content: [
        { type: "title", text: "Opening the bar" },
        { type: "h1", text: "Before service" },
        { type: "body", text: "Arrive with enough time to make the room guest-ready before the doors open." },
        { type: "bullets", items: ["Turn on music and lights", "Check tills and card terminals", "Restock ice, fruit and clean glassware"] },
        { type: "articleLink", articleId: "handbook-closing", label: "Read the closing routine" },
      ],
    },
    {
      id: "handbook-closing",
      kind: "HANDBOOK",
      category: "Closing",
      title: "Closing routine",
      description: "How to close the bar cleanly and leave a useful handover.",
      published: true,
      updatedAt: new Date().toISOString(),
      content: [
        { type: "title", text: "Closing routine" },
        { type: "h1", text: "After last orders" },
        { type: "numbered", items: ["Clean down stations", "Count and secure cash", "Lock doors", "Write any handover notes"] },
      ],
    },
  ],
  news: [
    {
      id: "news-welcome",
      kind: "NEWS",
      category: "Team",
      title: "Welcome to Operation",
      description: "A new home for bar updates, routines and daily notes.",
      published: true,
      updatedAt: new Date().toISOString(),
      content: [
        { type: "title", text: "Welcome to Operation" },
        { type: "body", text: "News posts appear here for the whole team and open in the same full-screen reading view as handbook articles." },
      ],
    },
  ],
  dailyTasks: [
    { id: "daily-ice", weekday: new Date().getDay(), title: "Check ice and fridges", description: "Make sure the bar has enough ice and cold stock for service.", completed: false },
    { id: "daily-glassware", weekday: new Date().getDay(), title: "Polish front-bar glassware", description: "Fill the main shelves before the evening rush.", completed: false },
  ],
  needs: [
    { id: "need-tonic", title: "Tonic water", note: "Low stock behind the bar", status: "NEEDED", createdAt: new Date().toISOString() },
  ],
};
