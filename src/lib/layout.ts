// Single source of truth for the sidebar width, consumed by Sidebar (its
// own width), Topbar (its left offset) and DashboardLayout (main's left
// margin) — previously these were three independently hardcoded magic
// numbers that had to be kept in sync by hand.
export const SIDEBAR_WIDTH_COLLAPSED = 80;
export const SIDEBAR_WIDTH_EXPANDED = 256;

export function getSidebarWidth(isCollapsed: boolean): number {
  return isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;
}
