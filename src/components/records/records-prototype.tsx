"use client";

import { useEffect, useMemo, useState } from "react";
import { AssistantCompletionForm, type AssistantSupplement } from "@/components/records/assistant-completion-form";
import { SampleManagementView } from "@/components/records/sample-management-view";
import { roleLabels, useAccessControl } from "@/features/auth/access-control";
import {
  customers,
  inventory,
  quotes,
  tasks,
  type Customer,
} from "@/features/records/mock-data";

type View = "dashboard" | "customers" | "samples" | "inventory" | "quotes" | "tasks";

const navigation: Array<{ id: View; label: string; icon: string }> = [
  { id: "dashboard", label: "儀表板", icon: "⌂" },
  { id: "customers", label: "廠家管理", icon: "◫" },
  { id: "samples", label: "樣品管理", icon: "◈" },
  { id: "inventory", label: "樣品庫存", icon: "◇" },
  { id: "quotes", label: "報價單", icon: "▤" },
  { id: "tasks", label: "任務管理", icon: "✓" },
];

const statusTone: Record<string, string> = {
  新名單: "bg-sky-50 text-sky-700 ring-sky-600/20",
  已建立聯絡: "bg-violet-50 text-violet-700 ring-violet-600/20",
  寄樣試用中: "bg-amber-50 text-amber-700 ring-amber-600/20",
  報價談判中: "bg-orange-50 text-orange-700 ring-orange-600/20",
  已成交: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  議價中: "bg-orange-50 text-orange-700 ring-orange-600/20",
  待回覆: "bg-amber-50 text-amber-700 ring-amber-600/20",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        statusTone[status] ?? "bg-slate-100 text-slate-600 ring-slate-500/20"
      }`}
    >
      {status}
    </span>
  );
}

function DashboardView({ onSelect }: { onSelect: (customer: Customer) => void }) {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const newThisMonth = customers.filter((item) => item.createdAt.startsWith(currentMonth));
  const followUpCustomers = customers.filter((item) => item.nextFollow && item.status !== "已成交");
  const sampleCustomers = customers.filter((item) => ["待送樣", "寄樣試用中"].includes(item.status));
  const quoteCustomers = customers.filter((item) => ["待報價", "報價談判中"].includes(item.status));
  const wonThisMonth = customers.filter((item) => item.closedAt?.startsWith(currentMonth));
  const importantThisWeek = customers.filter((item) => item.grade === "A" && item.status !== "已成交");
  const stats = [
    ["目前客戶", customers.length, "全部有效客戶", "text-slate-900"],
    ["本月新增", newThisMonth.length, currentMonth, "text-sky-700"],
    ["本月成交", wonThisMonth.length, currentMonth, "text-emerald-700"],
    ["待追蹤", followUpCustomers.length, "已有追蹤日期", "text-amber-700"],
    ["待送樣", sampleCustomers.length, "含寄樣試用中", "text-orange-700"],
    ["待報價", quoteCustomers.length, "含報價談判中", "text-violet-700"],
    ["本週重要客戶", importantThisWeek.length, "A 級優先追蹤", "text-rose-700"],
  ] as const;

  const queues = [
    { label: "待追蹤", customers: followUpCustomers, empty: "目前沒有待追蹤客戶" },
    { label: "待送樣", customers: sampleCustomers, empty: "目前沒有待送樣客戶" },
    { label: "待報價", customers: quoteCustomers, empty: "目前沒有待報價客戶" },
  ];

  const statusCounts = ["新名單", "已建立聯絡", "寄樣試用中", "報價談判中", "已成交"].map(
    (status) => ({ status, count: customers.filter((item) => item.status === status).length }),
  );
  const regionCounts = [...new Set(customers.map((item) => item.region))].map((region) => ({ label: region, count: customers.filter((item) => item.region === region).length }));
  const typeCounts = [...new Set(customers.map((item) => item.type))].map((type) => ({ label: type, count: customers.filter((item) => item.type === type).length }));
  const competitorCounts = [...new Set(customers.flatMap((item) => item.competitors))].map((competitor) => ({ label: competitor, count: customers.filter((item) => item.competitors.includes(competitor)).length }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(([label, value, hint, tone]) => (
          <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className={`mt-3 text-3xl font-semibold tracking-tight ${tone}`}>{value}</p>
            <p className="mt-2 text-xs text-slate-400">{hint}</p>
          </article>
        ))}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-4"><div><h2 className="font-semibold text-slate-900">主管行動清單</h2><p className="mt-1 text-sm text-slate-500">點選客戶即可查看詳情與補資料狀態</p></div><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">即時摘要</span></div>
        <div className="grid gap-4 lg:grid-cols-3">
          {queues.map((queue) => <div key={queue.label} className="rounded-xl border border-slate-100 bg-slate-50 p-4"><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold text-slate-800">{queue.label}</h3><span className="flex size-7 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-600 shadow-sm">{queue.customers.length}</span></div><div className="space-y-2">{queue.customers.length ? queue.customers.map((customer) => <button key={customer.id} type="button" onClick={() => onSelect(customer)} className="flex w-full items-center justify-between rounded-lg bg-white px-3 py-2.5 text-left text-sm shadow-sm transition hover:-translate-y-0.5"><span className="font-medium text-slate-700">{customer.name}</span><span className="text-xs text-slate-400">{queue.label === "待追蹤" ? customer.nextFollow : customer.region}</span></button>) : <p className="py-3 text-center text-xs text-slate-400">{queue.empty}</p>}</div></div>)}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">開發進度</h2>
              <p className="mt-1 text-sm text-slate-500">目前測試名單狀態分布</p>
            </div>
            <span className="text-xs font-medium text-emerald-700">Mock data</span>
          </div>
          <div className="space-y-4">
            {statusCounts.map(({ status, count }) => (
              <div key={status}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="text-slate-600">{status}</span>
                  <span className="font-medium text-slate-900">{count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${Math.max((count / customers.length) * 100, 4)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <DistributionCard title="各區域客戶數" items={regionCounts} tone="bg-sky-500" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2"><DistributionCard title="各茶商競品分布" items={competitorCounts} tone="bg-amber-500" /><DistributionCard title="各客戶類型占比" items={typeCounts} tone="bg-violet-500" /></div>
    </div>
  );
}

function DistributionCard({ title, items, tone }: { title: string; items: Array<{ label: string; count: number }>; tone: string }) {
  const total = items.reduce((sum, item) => sum + item.count, 0) || 1;
  return <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-semibold text-slate-900">{title}</h2><div className="mt-5 space-y-4">{items.map((item) => <div key={item.label}><div className="mb-1.5 flex justify-between text-sm"><span className="text-slate-600">{item.label}</span><span className="font-medium text-slate-900">{item.count}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.max((item.count / total) * 100, 4)}%` }} /></div></div>)}</div></section>;
}

function CustomersView({ onSelect }: { onSelect: (customer: Customer) => void }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [region, setRegion] = useState("");
  const [sample, setSample] = useState("");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return customers.filter((customer) => {
      const matchesQuery = !normalized || [customer.name, customer.contact, customer.phone, customer.region, customer.status, ...customer.samples]
        .some((value) => value.toLowerCase().includes(normalized));
      return matchesQuery && (!status || customer.status === status) && (!region || customer.region === region) && (!sample || customer.samples.includes(sample));
    });
  }, [query, region, sample, status]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜尋廠家、聯絡人或電話"
          className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        />
        <select
          value={region}
          onChange={(event) => setRegion(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 outline-none"
        >
          <option value="">全部區域</option>
          {[...new Set(customers.map((item) => item.region))].map((item) => <option key={item}>{item}</option>)}
        </select>
        <select
          value={sample}
          onChange={(event) => setSample(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 outline-none"
        >
          <option value="">全部樣品</option>
          {[...new Set(customers.flatMap((item) => item.samples))].map((item) => <option key={item}>{item}</option>)}
        </select>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 outline-none"
        >
          <option value="">全部狀態</option>
          {[...new Set(customers.map((item) => item.status))].map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      <div className="divide-y divide-slate-100">
        {filtered.map((customer) => (
          <button
            key={customer.id}
            type="button"
            onClick={() => onSelect(customer)}
            className="grid w-full gap-4 p-5 text-left transition hover:bg-slate-50 sm:grid-cols-[1.4fr_1fr_auto] sm:items-center"
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900">{customer.name}</h3>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{customer.grade} 級</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{customer.type} · {customer.region} · {customer.sales}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">{customer.samples.slice(0, 3).map((sample) => <span key={sample} className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">{sample}</span>)}</div>
            </div>
            <div className="text-sm text-slate-500">
              <p>{customer.contact}</p>
              <p className="mt-1 text-xs text-slate-400">{customer.phone}</p>
            </div>
            <StatusBadge status={customer.status} />
          </button>
        ))}
      </div>
    </section>
  );
}

function CustomerDetail({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const { permissions } = useAccessControl();
  const [isCompleting, setIsCompleting] = useState(false);
  const [customerType, setCustomerType] = useState(customer.type);
  const [supplement, setSupplement] = useState<AssistantSupplement | null>(null);
  const fields = [
    ["區域", customer.region], ["地址", supplement?.address || customer.address], ["聯絡人", customer.contact],
    ["電話", customer.phone], ["Email", supplement?.email || customer.email || "—"], ["官網／社群", supplement?.website || customer.website || "—"],
    ["客戶類型", customerType],
    ["客戶來源", customer.source], ["負責業務", customer.sales], ["月用量", customer.monthly],
    ["下次追蹤", customer.nextFollow || "—"],
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/35 backdrop-blur-sm" onClick={onClose}>
      <aside
        className="h-full w-full max-w-2xl overflow-y-auto bg-slate-50 p-6 shadow-2xl sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" onClick={onClose} className="mb-6 text-sm font-medium text-slate-500 hover:text-slate-900">← 返回列表</button>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-emerald-700">廠家詳情 · 測試資料</p>
            <div className="mt-2 flex flex-wrap items-center gap-3"><h2 className="text-3xl font-semibold text-slate-950">{customer.name}</h2><span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">{customerType}</span></div>
          </div>
          <div className="flex items-center gap-2"><StatusBadge status={customer.status} />{permissions.editRecords && <button type="button" onClick={() => setIsCompleting((current) => !current)} className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm">{isCompleting ? "返回詳情" : "助理補資料"}</button>}{permissions.deleteRecords && <button type="button" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">刪除</button>}</div>
        </div>
        {isCompleting ? <div className="mt-8"><AssistantCompletionForm customer={customer} onCancel={() => setIsCompleting(false)} onSaved={(data) => { setSupplement(data); setCustomerType(data.customerType); setIsCompleting(false); }} /></div> : <>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {fields.map(([label, value]) => (
            <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
              <p className="mt-2 text-sm font-medium text-slate-800">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <DetailCard title="樣品需求" values={customer.samples} />
          <DetailCard title="競爭品牌" values={customer.competitors} />
          {supplement && <DetailCard title="目前使用茶商" values={supplement.suppliers} />}
          {supplement && <DetailCard title="目前使用茶款" values={supplement.teas} />}
        </div>
        {supplement && <div className="mt-6 grid gap-4 sm:grid-cols-2"><TextCard title="月用量" text={supplement.monthly} /><TextCard title="OEM" text={supplement.oem ? `YES · ${supplement.oemFactory}` : "NO"} /><TextCard title="配送" text={supplement.delivery ? `YES · 約 ${supplement.vehicleCount} 台車` : "NO"} /><TextCard title="連鎖" text={supplement.chain ? `YES · ${supplement.branchCount} 家 · ${supplement.chainRegions} · ${supplement.chainMode}` : "NO"} /></div>}
        <div className="mt-6 space-y-4">
          <TextCard title="客戶痛點" text={customer.pain} />
          <TextCard title="開發策略" text={customer.strategy} />
          <TextCard title="備註" text={customer.note} />
        </div>
        </>}
      </aside>
    </div>
  );
}

function DetailCard({ title, values }: { title: string; values: string[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {values.length ? values.map((value) => <span key={value} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">{value}</span>) : <span className="text-sm text-slate-400">尚未填寫</span>}
      </div>
    </div>
  );
}

function TextCard({ title, text }: { title: string; text: string }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-5"><h3 className="text-sm font-semibold text-slate-800">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text || "尚未填寫"}</p></div>;
}

function InventoryView() {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5"><h2 className="font-semibold text-slate-900">樣品庫存盤點</h2><p className="mt-1 text-sm text-slate-500">數量僅供模板確認，不會寫入資料庫</p></div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-3xl text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400"><tr><th className="px-5 py-3">樣品名稱</th><th className="px-5 py-3">樣品類別</th><th className="px-5 py-3">現有庫存</th><th className="px-5 py-3">單位</th><th className="px-5 py-3">存放位置</th><th className="px-5 py-3">最後更新</th><th className="px-5 py-3">備註</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {inventory.map((item) => <tr key={item.name}><td className="px-5 py-4 font-medium text-slate-800">{item.name}</td><td className="px-5 py-4 text-slate-500">{item.category}</td><td className="px-5 py-4"><span className={item.qty <= 5 ? "font-semibold text-rose-600" : "text-slate-700"}>{item.qty}</span></td><td className="px-5 py-4 text-slate-500">{item.unit}</td><td className="px-5 py-4 text-slate-500">{item.location}</td><td className="px-5 py-4 text-slate-500">{item.lastUpdated ?? "2026-06-20"}</td><td className="px-5 py-4 text-slate-500">{item.note || "—"}</td></tr>)}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function QuotesView() {
  return <div className="grid gap-4 xl:grid-cols-2">{quotes.map((quote) => {
    const customer = customers.find((item) => item.id === quote.customerId);
    const total = quote.items.reduce((sum, item) => sum + item.qty * item.price, 0);
    return <article key={quote.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold tracking-wider text-emerald-700">報價單編號 · {quote.number}</p><h2 className="mt-2 font-semibold text-slate-900">{customer?.name}</h2><p className="mt-1 text-sm text-slate-400">報價日期：{quote.date}</p><p className="mt-1 text-xs text-slate-400">附件：{quote.attachment || "尚未上傳"}</p></div><StatusBadge status={quote.status} /></div><div className="mt-5 divide-y divide-slate-100 rounded-xl bg-slate-50 px-4">{quote.items.map((item) => { const subtotal = item.qty * item.price; return <div key={item.name} className="grid grid-cols-[44px_1fr_auto] items-center gap-3 py-3 text-sm"><div className="flex size-11 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-700">圖片</div><div><p className="font-medium text-slate-700">{item.name}</p><p className="mt-1 text-xs text-slate-400">{item.spec} · {item.unit} · {item.qty} × ${item.price.toLocaleString()}</p></div><div className="text-right"><p className="text-xs text-slate-400">小計</p><p className="font-semibold text-slate-800">${subtotal.toLocaleString()}</p></div></div>; })}</div><div className="mt-4 flex justify-between text-sm"><span className="text-slate-500">合計</span><strong className="text-lg text-slate-900">${total.toLocaleString()}</strong></div></article>;
  })}</div>;
}

function TasksView() {
  const [isAdding, setIsAdding] = useState(false);
  const examples = ["寄樣品", "回覆報價", "安排拜訪", "追蹤試喝回饋", "補齊客戶資料"];
  return <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 p-5"><div><h2 className="font-semibold text-slate-900">任務管理</h2><p className="mt-1 text-sm text-slate-500">每位客戶可建立執行與截止日期明確的任務。</p></div><button type="button" onClick={() => setIsAdding((current) => !current)} className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white">＋ 新增任務</button></div>{isAdding && <div className="grid gap-3 border-b border-slate-100 bg-emerald-50/40 p-5 sm:grid-cols-2"><select className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">{customers.map((customer) => <option key={customer.id}>{customer.name}</option>)}</select><select className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">{examples.map((example) => <option key={example}>{example}</option>)}</select><label className="text-xs text-slate-500">執行日期<input type="date" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" /></label><label className="text-xs text-slate-500">截止日期<input type="date" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" /></label><select className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"><option>待處理</option><option>進行中</option><option>已完成</option><option>延後</option></select><input placeholder="備註" className="rounded-xl border border-slate-200 px-4 py-3 text-sm" /><div className="grid grid-cols-2 gap-2 sm:col-span-2"><button type="button" onClick={() => setIsAdding(false)} className="rounded-xl border border-slate-200 bg-white py-3">取消</button><button type="button" onClick={() => setIsAdding(false)} className="rounded-xl bg-emerald-700 py-3 text-white">儲存畫面</button></div></div>}<div className="divide-y divide-slate-100">{tasks.map((task) => { const customer = customers.find((item) => item.id === task.customerId); const complete = task.status === "已完成"; return <article key={task.id} className="flex gap-4 p-5"><span className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-xs ${complete ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 text-transparent"}`}>✓</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className={`font-medium ${complete ? "text-slate-400 line-through" : "text-slate-900"}`}>{task.title}</h3><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{task.status}</span></div><p className="mt-1 text-sm text-slate-500">{customer?.name} · 執行 {task.start} · 截止 {task.due}</p>{task.note && <p className="mt-2 text-sm text-slate-400">備註：{task.note}</p>}</div></article>; })}</div></section>;
}

export function RecordsPrototype() {
  const { role, permissions } = useAccessControl();
  const [view, setView] = useState<View>("dashboard");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const allowedNavigation = navigation.filter((item) => item.id !== "dashboard" || permissions.viewDashboard);
  const currentLabel = navigation.find((item) => item.id === view)?.label;

  useEffect(() => {
    if (view === "dashboard" && !permissions.viewDashboard) setView("customers");
  }, [permissions.viewDashboard, view]);

  const openCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  return (
    <div className="min-h-screen bg-[#f5f7f4] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-[#173f35] text-white lg:flex">
        <div className="border-b border-white/10 px-6 py-6"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-xl">葉</span><div><p className="font-semibold tracking-wide">品超製茶</p><p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-white/45">Customer Data System</p></div></div></div>
        <nav className="flex-1 space-y-1 px-3 py-6">{allowedNavigation.map((item) => <button key={item.id} type="button" onClick={() => setView(item.id)} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${view === item.id ? "bg-white text-emerald-950 shadow-sm" : "text-white/65 hover:bg-white/8 hover:text-white"}`}><span className="w-5 text-center text-base">{item.icon}</span>{item.label}</button>)}</nav>
        <div className="border-t border-white/10 p-5"><div className="rounded-xl bg-white/7 p-4"><p className="text-xs font-semibold text-emerald-200">介面模板模式</p><p className="mt-1 text-xs leading-5 text-white/45">目前資料皆為前端測試資料</p></div></div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-[#f5f7f4]/90 px-5 py-4 backdrop-blur md:px-8"><div className="mx-auto flex max-w-7xl items-center justify-between"><div><p className="text-xs font-medium text-emerald-700">PIN CHAU CDS · {roleLabels[role]}</p><h1 className="mt-1 text-xl font-semibold">{currentLabel}</h1></div><span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${permissions.readOnly ? "border-amber-200 bg-amber-50 text-amber-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{permissions.readOnly ? "唯讀權限" : "可編輯"}</span></div><nav className="mt-4 flex gap-2 overflow-x-auto lg:hidden">{allowedNavigation.map((item) => <button key={item.id} type="button" onClick={() => setView(item.id)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${view === item.id ? "bg-emerald-800 text-white" : "bg-white text-slate-500"}`}>{item.label}</button>)}</nav></header>
        <main className="mx-auto max-w-7xl p-5 md:p-8">
          {view === "dashboard" && <DashboardView onSelect={openCustomer} />}
          {view === "customers" && <CustomersView onSelect={openCustomer} />}
          {view === "samples" && <SampleManagementView />}
          {view === "inventory" && <InventoryView />}
          {view === "quotes" && <QuotesView />}
          {view === "tasks" && <TasksView />}
        </main>
      </div>
      {selectedCustomer && <CustomerDetail customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />}
    </div>
  );
}
