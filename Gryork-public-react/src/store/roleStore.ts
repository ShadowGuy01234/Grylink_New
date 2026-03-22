import { create } from "zustand";

export type ActiveRole = "subcontractor" | "epc" | "nbfc";

type RoleState = {
  activeRole: ActiveRole;
  setActiveRole: (role: ActiveRole) => void;
};

export const useRoleStore = create<RoleState>((set) => ({
  activeRole: "subcontractor",
  setActiveRole: (activeRole) => set({ activeRole }),
}));
