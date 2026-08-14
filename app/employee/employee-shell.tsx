"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, CalendarDays, Clock3, Home, SlidersHorizontal, Umbrella } from "lucide-react";
import { WorkspaceSidebar, WorkspaceTopbar, type WorkspaceChromeItem } from "@/components/shell/workspace-chrome";
import type { AppRole } from "@/lib/auth/session";

const employeeItems: Array<WorkspaceChromeItem & { href: string }> = [
  { id: "home", href: "/employee", label: "Home", icon: Home },
  { id: "schedule", href: "/employee/shifts", label: "Schedule", icon: CalendarDays },
  { id: "clock", href: "/employee/hours", label: "Clock", icon: Clock3 },
  { id: "requests", href: "/employee/requests", label: "Requests", icon: Umbrella },
  { id: "availability", href: "/employee/availability", label: "Availability", icon: SlidersHorizontal },
  { id: "notifications", href: "/employee/notifications", label: "Notifications", icon: Bell },
];

function activeEmployeeItem(path: string) {
  if (path.startsWith("/employee/shifts")) return "schedule";
  if (path.startsWith("/employee/hours")) return "clock";
  if (path.startsWith("/employee/requests")) return "requests";
  if (path.startsWith("/employee/availability")) return "availability";
  if (path.startsWith("/employee/notifications")) return "notifications";
  return "home";
}

export function EmployeeShell({
  name,
  role,
  devMode,
  locationName,
  children,
}: {
  name: string;
  role: AppRole;
  devMode: boolean;
  locationName: string;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const router = useRouter();
  const active = activeEmployeeItem(path);
  const [mobileNav, setMobileNav] = useState(false);
  function navigate(id: string) {
    const item = employeeItems.find(entry => entry.id === id);
    if (!item) return;
    setMobileNav(false);
    router.push(item.href);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return <div className="app-frame employee-app">
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <WorkspaceSidebar
      items={employeeItems}
      active={active}
      onNavigate={navigate}
      open={mobileNav}
      onClose={() => setMobileNav(false)}
      userName={name}
      userRole={role}
      devMode={devMode}
      locationLabel={locationName}
      onSignOut={logout}
    />
    <main id="main-content" className="main-shell" tabIndex={-1}>
      <WorkspaceTopbar
        items={employeeItems}
        onMenu={() => setMobileNav(true)}
        staticLocationLabel={locationName}
        onNavigate={navigate}
        notificationItems={[
          { id: "schedule", label: "Schedule", detail: "Review upcoming and available shifts", icon: CalendarDays },
          { id: "clock", label: "Time & attendance", detail: "Open your clock and worked hours", icon: Clock3 },
          { id: "requests", label: "Requests", detail: "Review time off and shift requests", icon: Umbrella },
          { id: "notifications", label: "Notifications", detail: "Open your employee notifications", icon: Bell },
        ]}
      />
      <div className="page-wrap employee-page-wrap" data-workspace={`employee-${active}`}>
        {children}
      </div>
    </main>
  </div>;
}
