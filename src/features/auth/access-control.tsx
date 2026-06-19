"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type UserRole = "admin" | "sales" | "assistant" | "owner";

export type Permissions = {
  createRecords: boolean;
  editRecords: boolean;
  deleteRecords: boolean;
  uploadAttachments: boolean;
  updateSamples: boolean;
  updateQuotes: boolean;
  manageTasks: boolean;
  viewDashboard: boolean;
  readOnly: boolean;
};

export const roleLabels: Record<UserRole, string> = {
  admin: "管理者",
  sales: "專案經理／業務",
  assistant: "助理",
  owner: "主管／老闆（唯讀）",
};

const rolePermissions: Record<UserRole, Permissions> = {
  admin: { createRecords: true, editRecords: true, deleteRecords: true, uploadAttachments: true, updateSamples: true, updateQuotes: true, manageTasks: true, viewDashboard: true, readOnly: false },
  sales: { createRecords: true, editRecords: true, deleteRecords: false, uploadAttachments: true, updateSamples: true, updateQuotes: true, manageTasks: true, viewDashboard: false, readOnly: false },
  assistant: { createRecords: true, editRecords: true, deleteRecords: false, uploadAttachments: true, updateSamples: true, updateQuotes: true, manageTasks: false, viewDashboard: false, readOnly: false },
  owner: { createRecords: false, editRecords: false, deleteRecords: false, uploadAttachments: false, updateSamples: false, updateQuotes: false, manageTasks: false, viewDashboard: true, readOnly: true },
};

type AccessControlValue = {
  role: UserRole;
  setRole: (role: UserRole) => void;
  permissions: Permissions;
};

const AccessControlContext = createContext<AccessControlValue | null>(null);

export function AccessControlProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>("admin");
  return <AccessControlContext.Provider value={{ role, setRole, permissions: rolePermissions[role] }}>{children}</AccessControlContext.Provider>;
}

export function useAccessControl() {
  const value = useContext(AccessControlContext);
  if (!value) throw new Error("useAccessControl must be used within AccessControlProvider");
  return value;
}

export function RoleSelector() {
  const { role, setRole, permissions } = useAccessControl();
  return <div className="fixed right-3 top-14 z-[80] flex items-center gap-2 rounded-full border border-[#cbb88b] bg-[#fffdf8]/95 p-1.5 pl-3 shadow-lg backdrop-blur md:top-3"><span className={`size-2 rounded-full ${permissions.readOnly ? "bg-amber-500" : "bg-emerald-600"}`} /><select aria-label="預覽使用者角色" value={role} onChange={(event) => setRole(event.target.value as UserRole)} className="max-w-36 border-0 bg-transparent pr-2 text-xs font-semibold text-[#514b40] outline-none">{Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>;
}
