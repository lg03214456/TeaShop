"use client";

import { useState } from "react";
import { QuickEntryPrototype } from "@/components/records/quick-entry-prototype";
import { RecordsPrototype } from "@/components/records/records-prototype";
import { AccessControlProvider, RoleSelector } from "@/features/auth/access-control";

type Mode = "quick" | "admin";

export function PrototypeSwitcher() {
  const [mode, setMode] = useState<Mode>("quick");

  return <AccessControlProvider><RoleSelector /><div className={`tea-consultant-theme ${mode === "quick" ? "min-h-screen bg-[#e9e1d2] py-0 sm:py-6" : "min-h-screen"}`}><div className="fixed left-1/2 top-3 z-[70] flex -translate-x-1/2 rounded-full border border-[#cbb88b] bg-[#fffdf8]/95 p-1 shadow-lg backdrop-blur"><button type="button" onClick={() => setMode("quick")} className={`rounded-full px-4 py-2 text-xs font-semibold transition ${mode === "quick" ? "bg-[#285b39] text-white" : "text-[#756c5b]"}`}>快速建單</button><button type="button" onClick={() => setMode("admin")} className={`rounded-full px-4 py-2 text-xs font-semibold transition ${mode === "admin" ? "bg-[#285b39] text-white" : "text-[#756c5b]"}`}>後台管理</button></div>{mode === "quick" ? <div className="mx-auto min-h-[100dvh] max-w-[480px] overflow-hidden bg-[#fffdf8] shadow-2xl sm:rounded-[2rem]"><QuickEntryPrototype /></div> : <RecordsPrototype />}</div></AccessControlProvider>;
}
