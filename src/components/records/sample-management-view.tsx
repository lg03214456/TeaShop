"use client";

import { useState } from "react";
import { customers, sampleRecords as initialRecords, type SampleRecord } from "@/features/records/mock-data";

const groups = [
  { label: "茶葉", tone: "bg-emerald-50 text-emerald-700 border-emerald-200", items: ["錫蘭300", "阿薩姆180", "阿薩姆200"] },
  { label: "茶包", tone: "bg-amber-50 text-amber-800 border-amber-200", items: ["錫蘭", "阿薩姆", "大麥越南", "咖啡紅越南", "大麥印尼", "復刻印尼"] },
  { label: "調味茶", tone: "bg-pink-50 text-pink-700 border-pink-200", items: ["P", "L", "E"] },
] as const;
const statuses: SampleRecord["status"][] = ["待準備", "已寄出", "已收到", "待回覆", "完成"];

function toneFor(sample: string) {
  if (groups[0].items.some((item) => item === sample)) return groups[0].tone;
  if (groups[1].items.some((item) => item === sample)) return groups[1].tone;
  if (groups[2].items.some((item) => item === sample)) return groups[2].tone;
  return "bg-violet-50 text-violet-700 border-violet-200";
}

export function SampleManagementView() {
  const [records, setRecords] = useState(initialRecords);
  const [isAdding, setIsAdding] = useState(false);
  const [customerId, setCustomerId] = useState(customers[0].id);
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState("");
  const [sentAt, setSentAt] = useState("");
  const [sentBy, setSentBy] = useState("");
  const [status, setStatus] = useState<SampleRecord["status"]>("待準備");
  const [feedback, setFeedback] = useState("");
  const [nextFollow, setNextFollow] = useState("");

  const toggle = (sample: string) => setSelected((current) => current.includes(sample) ? current.filter((item) => item !== sample) : [...current, sample]);
  const addCustom = () => {
    const value = custom.trim();
    if (value && !selected.includes(value)) setSelected((current) => [...current, value]);
    setCustom("");
  };
  const save = () => {
    if (!selected.length || !sentBy.trim()) return;
    setRecords((current) => [...current, { id: Date.now(), customerId, samples: selected, sentAt, sentBy: sentBy.trim(), status, feedback: feedback.trim(), nextFollow }]);
    setSelected([]); setSentAt(""); setSentBy(""); setStatus("待準備"); setFeedback(""); setNextFollow(""); setIsAdding(false);
  };

  return <div className="space-y-6"><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-lg font-semibold text-slate-900">樣品需求與送樣紀錄</h2><p className="mt-1 text-sm text-slate-500">管理選樣、寄送進度、客戶回饋與下次追蹤。</p></div><button type="button" onClick={() => setIsAdding((current) => !current)} className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white">＋ 新增送樣紀錄</button></div>{isAdding && <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5"><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700">對應廠商<select value={customerId} onChange={(event) => setCustomerId(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-normal">{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</select></label><label className="text-sm font-semibold text-slate-700">送樣人<input value={sentBy} onChange={(event) => setSentBy(event.target.value)} placeholder="業務姓名 *" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal" /></label></div><div className="mt-5 space-y-4"><p className="text-sm font-semibold text-slate-700">樣品需求（可複選）</p>{groups.map((group) => <div key={group.label}><p className="mb-2 text-xs font-semibold text-slate-500">{group.label}</p><div className="flex flex-wrap gap-2">{group.items.map((item) => <button key={item} type="button" onClick={() => toggle(item)} className={`rounded-lg border px-3 py-2 text-sm ${selected.includes(item) ? "bg-slate-800 text-white border-slate-800" : group.tone}`}>{item}</button>)}</div></div>)}<div><p className="mb-2 text-xs font-semibold text-violet-700">特殊 OEM／其他</p><div className="flex gap-2"><input value={custom} onChange={(event) => setCustom(event.target.value)} placeholder="自行填寫" className="min-w-0 flex-1 rounded-xl border border-violet-200 px-4 py-3" /><button type="button" onClick={addCustom} className="rounded-xl bg-violet-700 px-4 text-white">新增</button></div></div></div><div className="mt-5 grid gap-4 sm:grid-cols-3"><label className="text-sm font-semibold text-slate-700">送樣日期<input type="date" value={sentAt} onChange={(event) => setSentAt(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal" /></label><label className="text-sm font-semibold text-slate-700">樣品狀態<select value={status} onChange={(event) => setStatus(event.target.value as SampleRecord["status"])} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-normal">{statuses.map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-sm font-semibold text-slate-700">下次追蹤日期<input type="date" value={nextFollow} onChange={(event) => setNextFollow(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal" /></label></div><label className="mt-5 block text-sm font-semibold text-slate-700">客戶回饋<textarea value={feedback} onChange={(event) => setFeedback(event.target.value)} className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 p-4 font-normal" placeholder="記錄試喝結果與回饋…" /></label><div className="mt-5 grid grid-cols-2 gap-3"><button type="button" onClick={() => setIsAdding(false)} className="rounded-xl border border-slate-200 bg-white py-3">取消</button><button type="button" onClick={save} disabled={!selected.length || !sentBy.trim()} className="rounded-xl bg-emerald-700 py-3 text-white disabled:opacity-40">儲存畫面</button></div></div>}</section><section className="grid gap-4 xl:grid-cols-2">{records.map((record) => { const customer = customers.find((item) => item.id === record.customerId); return <article key={record.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-slate-900">{customer?.name}</h3><p className="mt-1 text-sm text-slate-500">送樣人：{record.sentBy} · {record.sentAt || "尚未寄出"}</p></div><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">{record.status}</span></div><div className="mt-4 flex flex-wrap gap-2">{record.samples.map((sample) => <span key={sample} className={`rounded-full border px-2.5 py-1 text-xs font-medium ${toneFor(sample)}`}>{sample}</span>)}</div><div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2"><div><p className="text-xs text-slate-400">客戶回饋</p><p className="mt-1 text-slate-700">{record.feedback || "尚無回饋"}</p></div><div><p className="text-xs text-slate-400">下次追蹤</p><p className="mt-1 text-slate-700">{record.nextFollow || "尚未安排"}</p></div></div></article>; })}</section></div>;
}
