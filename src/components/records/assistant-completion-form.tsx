"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import type { Customer } from "@/features/records/mock-data";

const customerTypes = ["早餐", "飲料", "咖啡廳", "餐廳", "飯店", "食品工廠", "食品原料", "經銷商", "烘焙原料", "倉庫", "南北貨", "貿易商"];
const supplierOptions = ["裕展", "T世家", "桔揚", "東爵", "大中和", "天仁", "明芳", "立頓"];
const teaOptions = ["阿薩姆", "錫蘭", "伯爵", "麥香", "咖啡"];
const chainModes = ["直營", "加盟", "合作", "混合"];

export type AssistantSupplement = {
  address: string;
  email: string;
  website: string;
  customerType: string;
  suppliers: string[];
  teas: string[];
  monthly: string;
  oem: boolean;
  oemFactory: string;
  delivery: boolean;
  vehicleCount: string;
  chain: boolean;
  branchCount: string;
  chainRegions: string;
  chainMode: string;
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div><label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>{children}</div>;
}

function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" />;
}

function Chip({ selected, children, onClick }: { selected: boolean; children: ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${selected ? "border-emerald-700 bg-emerald-700 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-emerald-400"}`}>{children}</button>;
}

function YesNo({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) {
  return <div className="flex gap-2"><Chip selected={value} onClick={() => onChange(true)}>YES</Chip><Chip selected={!value} onClick={() => onChange(false)}>NO</Chip></div>;
}

function MultiChoice({ options, values, onChange }: { options: string[]; values: string[]; onChange: (values: string[]) => void }) {
  const [custom, setCustom] = useState("");
  const toggle = (value: string) => onChange(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  const add = () => {
    const value = custom.trim();
    if (!value) return;
    if (!values.includes(value)) onChange([...values, value]);
    setCustom("");
  };

  return <div><div className="flex flex-wrap gap-2">{[...new Set([...options, ...values])].map((option) => <Chip key={option} selected={values.includes(option)} onClick={() => toggle(option)}>{option}</Chip>)}</div><div className="mt-3 flex gap-2"><Input value={custom} onChange={(event) => setCustom(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); add(); } }} placeholder="自行新增" /><button type="button" onClick={add} className="rounded-xl bg-slate-800 px-4 text-sm font-medium text-white">新增</button></div></div>;
}

export function AssistantCompletionForm({ customer, onCancel, onSaved }: { customer: Customer; onCancel: () => void; onSaved: (data: AssistantSupplement) => void }) {
  const [address, setAddress] = useState(customer.address);
  const [email, setEmail] = useState(customer.email);
  const [website, setWebsite] = useState(customer.website);
  const [customerType, setCustomerType] = useState(customer.type.replace("店", ""));
  const [suppliers, setSuppliers] = useState<string[]>(customer.competitors);
  const [teas, setTeas] = useState<string[]>([]);
  const [monthly, setMonthly] = useState(customer.monthly === "尚未確認" ? "" : customer.monthly);
  const [oem, setOem] = useState(false);
  const [oemFactory, setOemFactory] = useState("");
  const [delivery, setDelivery] = useState(false);
  const [vehicleCount, setVehicleCount] = useState("");
  const [chain, setChain] = useState(false);
  const [branchCount, setBranchCount] = useState("");
  const [chainRegions, setChainRegions] = useState("");
  const [chainMode, setChainMode] = useState("直營");
  const conditionalFieldsComplete = (!oem || oemFactory.trim()) && (!delivery || vehicleCount.trim()) && (!chain || (branchCount.trim() && chainRegions.trim() && chainMode));

  return <section className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 sm:p-6"><div className="mb-6 flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Assistant workspace</p><h3 className="mt-2 text-xl font-semibold text-slate-900">助理後台補資料</h3><p className="mt-1 text-sm text-slate-500">單頁完成基本資料與商業資訊，目標 5 分鐘內完成。</p></div><span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">畫面暫存模式</span></div><div className="grid gap-5 sm:grid-cols-2"><Field label="地址"><Input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="完整店家地址" /></Field><Field label="Email"><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="contact@example.com" /></Field><div className="sm:col-span-2"><Field label="官網／社群媒體"><Input type="url" value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="官網、Facebook、Instagram 或 LINE" /></Field></div><div className="sm:col-span-2"><Field label="客戶類型（顯示於大標）"><div className="flex flex-wrap gap-2">{customerTypes.map((type) => <Chip key={type} selected={customerType === type} onClick={() => setCustomerType(type)}>{type}</Chip>)}</div></Field></div><div className="sm:col-span-2"><Field label="目前使用茶商（可複選）"><MultiChoice options={supplierOptions} values={suppliers} onChange={setSuppliers} /></Field></div><div className="sm:col-span-2"><Field label="目前使用茶款（可複選）"><MultiChoice options={teaOptions} values={teas} onChange={setTeas} /></Field></div><div className="sm:col-span-2"><Field label="月用量"><Input value={monthly} onChange={(event) => setMonthly(event.target.value)} placeholder="例如：500 kg／月、50 箱／月" /></Field></div><Field label="是否 OEM"><YesNo value={oem} onChange={setOem} />{oem && <div className="mt-3"><Input value={oemFactory} onChange={(event) => setOemFactory(event.target.value)} placeholder="代工廠名稱 *" /></div>}</Field><Field label="是否配送"><YesNo value={delivery} onChange={setDelivery} />{delivery && <div className="mt-3"><Input type="number" min="0" value={vehicleCount} onChange={(event) => setVehicleCount(event.target.value)} placeholder="約幾台車 *" /></div>}</Field><div className="sm:col-span-2"><Field label="是否連鎖"><YesNo value={chain} onChange={setChain} />{chain && <div className="mt-4 grid gap-4 rounded-xl border border-emerald-100 bg-white p-4 sm:grid-cols-2"><Input type="number" min="1" value={branchCount} onChange={(event) => setBranchCount(event.target.value)} placeholder="家數 *" /><Input value={chainRegions} onChange={(event) => setChainRegions(event.target.value)} placeholder="分布區域 *" /><div className="sm:col-span-2"><p className="mb-2 text-xs font-semibold text-slate-500">經營型態 *</p><div className="flex flex-wrap gap-2">{chainModes.map((mode) => <Chip key={mode} selected={chainMode === mode} onClick={() => setChainMode(mode)}>{mode}</Chip>)}</div></div></div>}</Field></div></div><div className="mt-7 grid grid-cols-2 gap-3"><button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 bg-white py-3 font-medium text-slate-600">取消</button><button type="button" disabled={!conditionalFieldsComplete} onClick={() => onSaved({ address, email, website, customerType, suppliers, teas, monthly, oem, oemFactory, delivery, vehicleCount, chain, branchCount, chainRegions, chainMode })} className="rounded-xl bg-emerald-700 py-3 font-medium text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-40">完成補資料</button></div>{!conditionalFieldsComplete && <p className="mt-3 text-center text-xs text-rose-600">請完成 YES 選項所展開的必填欄位。</p>}</section>;
}
