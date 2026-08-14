/**
 * Global CSS class contracts for the application shell and feature surfaces.
 * Shift Plan remains the only feature with a dedicated CSS module.
 */
export const surfaceStyles = {
  workspace: "workspace", actions: "actions", card: "card", cardHeader: "card-header",
  control: "control", empty: "empty-state", metrics: "metrics", outline: "control-outline",
  search: "search-field", sectionHeader: "section-header", solid: "control-solid", toolbar: "toolbar",
} as const;

export const overviewStyles = {
  amber: "tone-amber", attentionIcon: "attention-icon", attentionItem: "attention-item", blue: "tone-blue",
  metric: "metric", metricLabel: "metric-label", metricTrend: "metric-trend", panelTitle: "panel-title",
  quickAction: "quick-action", quickGrid: "quick-grid", quickIcon: "quick-icon", statusDot: "status-dot",
  violet: "tone-violet", warning: "warning",
} as const;

export const dashboardStyles = {
  attention:"dashboard-attention", contentGrid:"dashboard-content-grid", dashboard:"dashboard", empty:"dashboard-empty",
  heroPanel:"dashboard-hero", liveList:"dashboard-live-list", livePerson:"dashboard-live-person", liveRow:"dashboard-live-row",
  liveStatus:"dashboard-live-status", metrics:"dashboard-metrics", noteCategory:"dashboard-note-category", notesList:"dashboard-notes",
  panel:"dashboard-panel", quickPanel:"dashboard-quick", summary:"dashboard-summary", summaryGrid:"dashboard-summary-grid",
  timelineAction:"dashboard-timeline-action",
} as const;

export const teamStyles = {
  actions:"team-actions", activeStatus:"status-active", addButton:"team-add", avatar:"team-avatar", card:"team-card",
  cardHeader:"team-card-header", clearButton:"team-clear", details:"team-details", empty:"team-empty", filledButton:"team-filled",
  grid:"team-grid", identity:"team-identity", inactive:"team-inactive", inactiveStatus:"status-inactive", indicator:"team-indicator",
  note:"team-note", outlineButton:"team-outline", portalRow:"team-portal-row", resultCount:"result-count", role:"team-role",
  search:"search-field", summary:"team-summary", toolbar:"toolbar",
} as const;

export const attendanceStyles = {
  actions:"attendance-actions", alertText:"alert-text", approveAll:"approve-all", avatar:"attendance-avatar", dateControl:"date-control",
  edited:"is-edited", empty:"attendance-empty", exceptions:"attendance-exceptions", export:"attendance-export", filterFields:"filter-fields",
  filterFooter:"filter-footer", filters:"attendance-filters", hero:"attendance-hero", history:"attendance-history", locked:"is-locked",
  needsAction:"needs-action", outline:"control-outline", periodFields:"period-fields", preview:"attendance-preview",
  previewList:"attendance-preview-list", primaryAction:"primary-action", record:"attendance-record", recordActions:"record-actions",
  recordException:"record-exception", recordList:"record-list", recordStats:"record-stats", records:"attendance-records",
  sectionHeader:"section-header", status:"status", statusRunning:"status-running", statusPending:"status-pending",
  statusApproved:"status-approved", statusRejected:"status-rejected", summary:"attendance-summary", timeLine:"time-line", workspace:"attendance-workspace",
} as const;

export const executionStyles = {
  actionGrid:"execution-action-grid", actionsPanel:"execution-actions", board:"execution-board", header:"execution-header",
  list:"execution-list", metrics:"execution-metrics", state:"execution-state", workspace:"execution-workspace",
} as const;

export const inventoryStyles = {
  clear:"inventory-clear", editButton:"inventory-edit", empty:"inventory-empty", history:"inventory-history", low:"is-low",
  lowFilter:"low-filter", negative:"negative", ok:"ok", positive:"positive", productCard:"product-card", productList:"product-list",
  productsPanel:"products-panel", resultCount:"result-count", selected:"selected", stockControl:"stock-control", stockRow:"stock-row",
  suggestion:"suggestion", summary:"inventory-summary", toolbar:"toolbar",
} as const;

export const orderStyles = {
  addButton:"order-add", clear:"order-clear", delivery:"delivery", empty:"order-empty", filter:"order-filter", orderCard:"order-card",
  orderList:"order-list", ordersPanel:"orders-panel", receiveButton:"receive-button", resultCount:"result-count", suggestion:"suggestion", toolbar:"toolbar",
} as const;

export const operationsStyles = {
  checklist:"ops-checklist", compose:"ops-compose", create:"ops-create", dateInput:"ops-date-input", header:"ops-header",
  headerActions:"ops-header-actions", layout:"ops-layout", logEntry:"ops-log-entry", logList:"ops-log-list", logbook:"ops-logbook",
  panel:"ops-panel", presets:"ops-presets", progress:"ops-progress", rowActions:"ops-row-actions", summary:"ops-summary",
  task:"ops-task", taskList:"ops-task-list", workspace:"ops-workspace",
} as const;

export const settingsStyles = {
  actions:"settings-actions", fields:"settings-fields", form:"settings-form", header:"settings-header", help:"settings-help",
  layout:"settings-layout", loading:"settings-loading", nav:"settings-nav", panel:"settings-panel", summary:"settings-summary",
  toggle:"settings-toggle", workspace:"settings-workspace",
} as const;

export const requestStyles = {
  actions:"request-actions", approve:"request-approve", card:"request-card", cardHeader:"request-card-header", empty:"request-empty",
  eyebrow:"request-eyebrow", header:"request-header", headerCopy:"request-header-copy", kind:"request-kind", list:"request-list",
  liveStatus:"request-live-status", loadingIcon:"request-loading-icon", meta:"request-meta", queue:"request-queue",
  queueHeader:"request-queue-header", refresh:"request-refresh", reject:"request-reject", status:"request-status",
  subtitle:"request-subtitle", summary:"request-summary",
} as const;
