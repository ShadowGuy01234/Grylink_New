"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type ActiveRole = "subcontractor" | "epc" | "nbfc";

type ActiveRoleContextValue = {
  activeRole: ActiveRole;
  setActiveRole: (role: ActiveRole) => void;
};

const ActiveRoleContext = createContext<ActiveRoleContextValue | undefined>(undefined);

export function ActiveRoleProvider({ children }: { children: React.ReactNode }) {
  const [activeRole, setActiveRole] = useState<ActiveRole>("subcontractor");

  const value = useMemo(
    () => ({
      activeRole,
      setActiveRole,
    }),
    [activeRole]
  );

  return <ActiveRoleContext.Provider value={value}>{children}</ActiveRoleContext.Provider>;
}

export function useActiveRole() {
  const ctx = useContext(ActiveRoleContext);
  if (!ctx) {
    throw new Error("useActiveRole must be used within ActiveRoleProvider");
  }
  return ctx;
}
