"use client";

import { Crown, Shield, UserCog, UserRound } from "lucide-react";
import { useState } from "react";

const roles = [
  { value: "OWNER", label: "Owner", icon: Crown },
  { value: "MANAGER", label: "Manager", icon: UserCog },
  { value: "SHIFT_MANAGER", label: "Shift manager", icon: Shield },
  { value: "EMPLOYEE", label: "Employee", icon: UserRound },
] as const;

export function DevRoleSwitcher({ currentRole }: { currentRole: string }) {
  const [open, setOpen] = useState(false);
  const active = roles.find((role) => role.value === currentRole) || roles[0];
  const ActiveIcon = active.icon;

  return (
    <div className="dev-role-switcher">
      <button type="button" className="dev-role-trigger" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <span className="dev-role-dot" />
        <ActiveIcon size={15} />
        <span>{active.label}</span>
      </button>
      {open && (
        <div className="dev-role-menu">
          <div className="dev-role-menu-head">
            <strong>Developer mode</strong>
            <small>Preview permissions</small>
          </div>
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <form action="/api/auth/dev-login" method="post" key={role.value}>
                <input type="hidden" name="role" value={role.value} />
                <button type="submit" className={currentRole === role.value ? "selected" : ""}>
                  <Icon size={17} />
                  <span>{role.label}</span>
                </button>
              </form>
            );
          })}
        </div>
      )}
    </div>
  );
}
