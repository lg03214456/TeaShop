"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import {
  QuickDashboardContent,
  QuickExportContent,
  QuickHomeContent,
  QuickInventoryContent,
  QuickQuotesContent,
  QuickSearchContent,
  type QuickSection,
} from "@/components/records/quick-home-views";
import { useAccessControl } from "@/features/auth/access-control";

type Screen = QuickSection | "create" | "detail";
type DetailTab = "info" | "value" | "quotes" | "strategy";

type QuickCustomer = {
  id: number;
  name: string;
  region: string;
  samples: string[];
  contact: string;
  phone: string;
  note: string;
  photoUrl: string;
  photoName: string;
  address: string;
  email: string;
  website: string;
  customerType: string;
  source: string;
  sales: string;
  status: string;
  grade: "A" | "B" | "C";
  nextFollow: string;
  updatedAt: string;
};

const regions = ["台北", "新北", "桃園", "新竹", "台中", "彰化", "台南", "高雄"];
const sampleGroups = [
  { label: "茶葉", tone: "green", items: ["錫蘭300", "阿薩姆180", "阿薩姆200"] },
  { label: "茶包", tone: "brown", items: ["錫蘭", "阿薩姆", "大麥越南", "咖啡紅越南", "大麥印尼", "復刻印尼"] },
  { label: "調味茶", tone: "pink", items: ["P", "L", "E"] },
] as const;
const sampleToneClasses = {
  green: { selected: "border-[#347444] bg-[#347444] text-white", idle: "border-[#8db694] bg-[#eef7ef] text-[#276036]" },
  brown: { selected: "border-[#8a603c] bg-[#8a603c] text-white", idle: "border-[#c6aa8e] bg-[#f7efe7] text-[#755034]" },
  pink: { selected: "border-[#b8647a] bg-[#b8647a] text-white", idle: "border-[#d9a4b2] bg-[#fbedf1] text-[#9a4d61]" },
  purple: { selected: "border-[#765395] bg-[#765395] text-white", idle: "border-[#b8a0cb] bg-[#f2edf7] text-[#684681]" },
} as const;
const supplierOptions = ["裕展", "T世家", "桔揚", "東爵", "大中和", "天仁", "明芳", "立頓"];
const teaOptions = ["阿薩姆", "錫蘭", "咖啡", "麥香", "伯爵"];
const customerTypeOptions = ["早餐店", "飲料店", "咖啡廳", "餐廳", "飯店", "食品工廠", "食品原料商", "經銷商", "烘焙原料商", "倉庫", "南北貨", "貿易商", "其他"];
const sourceOptions = ["陌生開發", "展覽", "介紹", "官網", "社群", "既有客戶轉介", "其他"];
const developmentStatuses = ["新名單", "已建立聯絡", "寄樣試用中", "報價談判中", "已成交", "結單", "停止追蹤"];

function ChoiceChip({ selected, children, onClick }: { selected: boolean; children: ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`rounded-lg border px-3 py-2 text-sm transition ${selected ? "border-[#286533] bg-[#286533] text-white shadow-sm" : "border-[#cfbd95] bg-[#fffdf8] text-[#4d4a42] hover:border-[#286533]"}`}>{children}</button>;
}

function SampleChip({ selected, tone, children, onClick }: { selected: boolean; tone: keyof typeof sampleToneClasses; children: ReactNode; onClick: () => void }) {
  const classes = sampleToneClasses[tone];
  return <button type="button" onClick={onClick} className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${selected ? classes.selected : classes.idle}`}>{children}</button>;
}

function getSampleTone(sample: string): keyof typeof sampleToneClasses {
  if (sampleGroups[0].items.some((item) => item === sample)) return "green";
  if (sampleGroups[1].items.some((item) => item === sample)) return "brown";
  if (sampleGroups[2].items.some((item) => item === sample)) return "pink";
  return "purple";
}

function YesNo({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) {
  return <div className="flex gap-3"><ChoiceChip selected={value} onClick={() => onChange(true)}>YES</ChoiceChip><ChoiceChip selected={!value} onClick={() => onChange(false)}>NO</ChoiceChip></div>;
}

function BottomNavigation({ onNavigate }: { onNavigate?: (screen: QuickSection) => void }) {
  return <nav className="sticky bottom-0 z-20 grid grid-cols-3 border-t border-[#d7c9a7] bg-[#fffdf8]/95 px-6 py-3 backdrop-blur"><button type="button" onClick={() => onNavigate?.("home")} className="flex flex-col items-center gap-1 text-[#286533]"><span className="text-xl">⌂</span><span className="text-xs">首頁</span></button><button type="button" onClick={() => onNavigate?.("search")} className="flex flex-col items-center gap-1 text-[#8a8983]"><span className="text-xl">⌕</span><span className="text-xs">搜尋</span></button><button type="button" onClick={() => onNavigate?.("export")} className="flex flex-col items-center gap-1 text-[#8a8983]"><span className="text-xl">⇩</span><span className="text-xs">匯出</span></button></nav>;
}

function PhoneHeader({ title, back }: { title: string; back?: () => void }) {
  return <header className="sticky top-0 z-20 flex h-16 items-center border-b border-[#e5ddca] bg-[#fffdf8]/95 px-4 backdrop-blur"><div className="w-20">{back && <button type="button" onClick={back} className="text-sm font-medium text-[#285d34]">← 返回</button>}</div><h1 className="flex-1 text-center text-lg font-bold text-[#252521]">{title}</h1><div className="w-20" /></header>;
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="mb-2 block text-sm font-semibold text-[#37362f]">{children}</label>;
}

function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="w-full rounded-xl border border-[#cfbd95] bg-[#fffdf8] px-4 py-3 text-sm text-[#35332e] outline-none placeholder:text-[#9a968c] focus:border-[#286533] focus:ring-4 focus:ring-[#286533]/10" />;
}

function CreateScreen({ onCancel, onSave }: { onCancel: () => void; onSave: (customer: QuickCustomer) => void }) {
  const [name, setName] = useState("");
  const [region, setRegion] = useState("新北");
  const [contact, setContact] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedSamples, setSelectedSamples] = useState<string[]>([]);
  const [customSample, setCustomSample] = useState("");
  const [customSamples, setCustomSamples] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<{ name: string; url: string } | null>(null);

  const toggleSample = (sample: string) => setSelectedSamples((current) => current.includes(sample) ? current.filter((item) => item !== sample) : [...current, sample]);
  const isComplete = Boolean(name.trim() && region && contact.trim() && phone.trim() && selectedSamples.length && photo && note.trim());

  const addCustomSample = () => {
    const value = customSample.trim();
    if (!value || customSamples.includes(value)) return;
    setCustomSamples((current) => [...current, value]);
    setSelectedSamples((current) => [...current, value]);
    setCustomSample("");
  };

  const handlePhoto = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto({ name: file.name, url: String(reader.result) });
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#fffdf8]">
      <PhoneHeader title="快速建立店家" back={onCancel} />
      <main className="flex-1 space-y-5 p-4 pb-24">
        <section className="space-y-5 rounded-xl border border-[#cfbd95] bg-[#f6f1e8] p-4 shadow-sm">
          <div><FieldLabel>店名／廠商名稱 *</FieldLabel><TextInput value={name} onChange={(event) => setName(event.target.value)} placeholder="輸入店家或廠商名稱" autoFocus /></div>
          <div><FieldLabel>區域 *</FieldLabel><div className="flex flex-wrap gap-2">{regions.map((item) => <ChoiceChip key={item} selected={region === item} onClick={() => setRegion(item)}>{item}</ChoiceChip>)}</div></div>
          <div><FieldLabel>聯絡人 *</FieldLabel><TextInput value={contact} onChange={(event) => setContact(event.target.value)} placeholder="輸入聯絡人姓名" /></div>
          <div><FieldLabel>電話 *</FieldLabel><TextInput type="tel" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="例如：0912-345-678" /></div>
          <div>
            <FieldLabel>樣品需求 *（可複選）</FieldLabel>
            <div className="space-y-4">
              {sampleGroups.map((group) => <div key={group.label}><p className="mb-2 text-xs font-semibold text-[#777269]">{group.label}</p><div className="flex flex-wrap gap-2">{group.items.map((item) => <SampleChip key={item} tone={group.tone} selected={selectedSamples.includes(item)} onClick={() => toggleSample(item)}>{item}</SampleChip>)}</div></div>)}
              <div><p className="mb-2 text-xs font-semibold text-[#765395]">特殊 OEM／其他</p><div className="flex gap-2"><TextInput value={customSample} onChange={(event) => setCustomSample(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addCustomSample(); } }} placeholder="自行填寫" /><button type="button" onClick={addCustomSample} className="rounded-xl bg-[#765395] px-4 text-sm text-white">新增</button></div>{customSamples.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{customSamples.map((item) => <SampleChip key={item} tone="purple" selected={selectedSamples.includes(item)} onClick={() => toggleSample(item)}>{item}</SampleChip>)}</div>}</div>
            </div>
          </div>
          <div>
            <FieldLabel>拍照 *</FieldLabel>
            <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-[#b8a273] bg-[#fffdf8] p-3 transition hover:border-[#286533]">
              {photo ? <img src={photo.url} alt="店家現場預覽" className="size-20 rounded-lg object-cover" /> : <span className="flex size-20 items-center justify-center rounded-lg bg-[#ece5d7] text-3xl">＋</span>}
              <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-[#3d3a33]">{photo ? "更換照片" : "拍照或選擇照片"}</span><span className="mt-1 block truncate text-xs text-[#8b877d]">{photo?.name ?? "支援手機相機與相簿"}</span></span>
              <input type="file" accept="image/*" capture="environment" onChange={(event) => handlePhoto(event.target.files?.[0])} className="sr-only" />
            </label>
          </div>
          <div><FieldLabel>備註 *</FieldLabel><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="記下現場需求與後續需要補充的資訊…" className="min-h-28 w-full resize-none rounded-xl border border-[#cfbd95] bg-[#fffdf8] p-4 text-sm outline-none focus:border-[#286533]" /></div>
        </section>
        <div className="grid grid-cols-2 gap-3"><button type="button" onClick={onCancel} className="rounded-xl border border-[#cfbd95] bg-white py-3.5 font-medium text-[#403e37]">取消</button><button type="button" disabled={!isComplete} onClick={() => photo && onSave({ id: Date.now(), name: name.trim(), region, contact: contact.trim(), phone: phone.trim(), samples: selectedSamples, photoUrl: photo.url, photoName: photo.name, note: note.trim(), address: "", email: "", website: "", customerType: "未分類", source: "快速建檔", sales: "未指派", status: "新名單", grade: "C", nextFollow: "", updatedAt: new Date().toISOString().slice(0, 10) })} className="rounded-xl bg-[#286533] py-3.5 font-medium text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-40">快速建立</button></div>
        {!isComplete && <p className="text-center text-xs leading-5 text-[#9a655a]">請完成所有必填欄位後再建立。</p>}
      </main>
    </div>
  );
}

function SummaryCard({ customer }: { customer: QuickCustomer }) {
  return <section className="overflow-hidden rounded-xl border border-[#cfbd95] bg-[#f6f1e8]"><div className="grid gap-4 p-4 sm:grid-cols-[1fr_96px]"><div><p className="text-xs text-[#777269]">店名／廠商名稱</p><h2 className="mt-1 text-2xl font-bold text-[#292823]">{customer.name}</h2><div className="mt-3 flex flex-wrap gap-2"><span className="rounded-full bg-[#286533] px-3 py-1 text-xs text-white">{customer.region}</span><span className="rounded-full bg-[#e8e0d1] px-3 py-1 text-xs font-medium text-[#665b47]">{customer.customerType}</span><span className="rounded-full bg-[#fff4cf] px-3 py-1 text-xs font-medium text-[#8a6518]">{customer.status}</span></div><div className="mt-3 flex flex-wrap items-center gap-2"><span className="text-sm font-medium text-[#47443d]">{customer.contact}</span><span className="text-sm text-[#69655b]">{customer.phone}</span></div></div>{customer.photoUrl && <img src={customer.photoUrl} alt={`${customer.name} 現場照片`} className="size-24 rounded-xl object-cover" />}</div><div className="border-t border-[#ded2b7] px-4 py-4"><p className="text-xs text-[#777269]">樣品需求</p><div className="mt-2 flex flex-wrap gap-2">{customer.samples.map((sample) => <span key={sample} className={`rounded-full border px-2.5 py-1 text-xs font-medium ${sampleToneClasses[getSampleTone(sample)].idle}`}>{sample}</span>)}</div></div></section>;
}

function InfoTab({ customer, onOpenQuotes }: { customer: QuickCustomer; onOpenQuotes: () => void }) {
  const { permissions } = useAccessControl();
  const [status, setStatus] = useState(customer.status);
  const [grade, setGrade] = useState(customer.grade);
  const [nextFollow, setNextFollow] = useState(customer.nextFollow);
  const [attachments, setAttachments] = useState<Record<string, string>>(customer.photoName ? { "門市照片": customer.photoName } : {});
  const fields = [["廠商名稱", customer.name], ["區域", customer.region], ["地址", customer.address], ["聯絡人", customer.contact], ["電話", customer.phone], ["Email", customer.email], ["官網／社群媒體", customer.website], ["客戶類型", customer.customerType], ["客戶來源", customer.source], ["負責業務", customer.sales]];
  const attachmentTypes = ["名片照片", "門市照片", "菜單照片", "產品照片", "茶樣照片", "其他附件"];

  return <fieldset disabled={permissions.readOnly} className="space-y-5 disabled:opacity-75"><section className="rounded-xl border border-[#cfbd95] bg-[#f6f1e8] p-4"><div className="mb-5 flex items-center justify-between"><h3 className="font-bold">詳細資料</h3>{permissions.editRecords && <button type="button" className="rounded-lg bg-[#286533] px-4 py-2 text-sm text-white">編輯</button>}</div><dl className="grid gap-4 sm:grid-cols-2">{fields.map(([label, value]) => <div key={label}><dt className="text-xs text-[#777269]">{label}</dt><dd className={`mt-1 text-sm font-medium ${value ? "text-[#333129]" : "text-[#a09b91]"}`}>{value || "未填寫"}</dd></div>)}</dl><div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="text-xs font-medium text-[#777269]">客戶類型<select defaultValue={customer.customerType} className="mt-1 w-full rounded-lg border border-[#cfbd95] bg-white px-3 py-2 text-sm text-[#333129]">{["未分類", ...customerTypeOptions].map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-xs font-medium text-[#777269]">客戶來源<select defaultValue={customer.source} className="mt-1 w-full rounded-lg border border-[#cfbd95] bg-white px-3 py-2 text-sm text-[#333129]">{["快速建檔", ...sourceOptions].map((item) => <option key={item}>{item}</option>)}</select></label></div></section><section className="rounded-xl border border-[#cfbd95] bg-[#f6f1e8] p-4"><h3 className="font-bold">開發資訊</h3><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-xs font-medium text-[#777269]">開發狀態<select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1 w-full rounded-lg border border-[#cfbd95] bg-white px-3 py-2 text-sm text-[#333129]">{developmentStatuses.map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-xs font-medium text-[#777269]">客戶等級<select value={grade} onChange={(event) => setGrade(event.target.value as "A" | "B" | "C")} className="mt-1 w-full rounded-lg border border-[#cfbd95] bg-white px-3 py-2 text-sm text-[#333129]"><option value="A">A：高潛力，優先追蹤</option><option value="B">B：有機會，可持續培養</option><option value="C">C：低優先，暫時觀察</option></select></label><label className="text-xs font-medium text-[#777269]">下次追蹤日期<input type="date" value={nextFollow} onChange={(event) => setNextFollow(event.target.value)} className="mt-1 w-full rounded-lg border border-[#cfbd95] bg-white px-3 py-2 text-sm text-[#333129]" /></label><div><p className="text-xs text-[#777269]">最後更新日期</p><p className="mt-2 text-sm font-medium text-[#333129]">{customer.updatedAt}</p></div></div></section><section className="rounded-xl border border-[#cfbd95] bg-[#f6f1e8] p-4"><h3 className="font-bold">附件</h3><p className="mt-1 text-xs text-[#777269]">目前只顯示本機檔名，尚未上傳 Supabase Storage。</p><div className="mt-4 grid grid-cols-2 gap-3">{attachmentTypes.map((type) => <label key={type} className={`rounded-xl border border-dashed border-[#c9b78e] bg-white p-3 ${permissions.uploadAttachments ? "cursor-pointer" : "opacity-60"}`}><span className="block text-sm font-medium text-[#4a473f]">＋ {type}</span><span className="mt-1 block truncate text-xs text-[#999388]">{attachments[type] || "尚未選擇"}</span><input disabled={!permissions.uploadAttachments} type="file" accept={type === "其他附件" ? undefined : "image/*"} onChange={(event) => { const file = event.target.files?.[0]; if (file) setAttachments((current) => ({ ...current, [type]: file.name })); }} className="sr-only" /></label>)}</div></section><button type="button" onClick={onOpenQuotes} className="w-full rounded-xl bg-[#286533] py-3.5 font-semibold text-white shadow-sm">查看報價單</button></fieldset>;
}

function CommercialValueTab() {
  const [suppliers, setSuppliers] = useState<string[]>(["裕展"]);
  const [teas, setTeas] = useState<string[]>(["阿薩姆"]);
  const [oem, setOem] = useState(false);
  const [delivery, setDelivery] = useState(false);
  const [chain, setChain] = useState(false);
  const [chainType, setChainType] = useState("直營");
  const toggle = (value: string, values: string[], setter: (next: string[]) => void) => setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);

  return <section className="space-y-6 rounded-xl border border-[#cfbd95] bg-[#f6f1e8] p-4"><div><FieldLabel>目前使用茶商 *</FieldLabel><div className="flex flex-wrap gap-2">{supplierOptions.map((item) => <ChoiceChip key={item} selected={suppliers.includes(item)} onClick={() => toggle(item, suppliers, setSuppliers)}>{item}</ChoiceChip>)}</div><div className="mt-2 flex gap-2"><TextInput placeholder="其他茶商" /><button type="button" className="rounded-xl bg-[#286533] px-4 text-sm text-white">新增</button></div></div><div><FieldLabel>目前使用茶款 *</FieldLabel><div className="flex flex-wrap gap-2">{teaOptions.map((item) => <ChoiceChip key={item} selected={teas.includes(item)} onClick={() => toggle(item, teas, setTeas)}>{item}</ChoiceChip>)}</div><div className="mt-2 flex gap-2"><TextInput placeholder="其他茶款" /><button type="button" className="rounded-xl bg-[#286533] px-4 text-sm text-white">新增</button></div></div><div><FieldLabel>預估月用量 *</FieldLabel><TextInput placeholder="例如：500 kg、50 箱" /></div><div><FieldLabel>是否 OEM *</FieldLabel><YesNo value={oem} onChange={setOem} />{oem && <div className="mt-3"><TextInput placeholder="OEM 廠商名稱" /></div>}</div><div><FieldLabel>是否有配送 *</FieldLabel><YesNo value={delivery} onChange={setDelivery} />{delivery && <div className="mt-3"><TextInput type="number" min="0" placeholder="配送車數" /></div>}</div><div><FieldLabel>是否連鎖 *</FieldLabel><YesNo value={chain} onChange={setChain} />{chain && <div className="mt-3 space-y-3"><TextInput placeholder="連鎖店數和分佈" /><div><FieldLabel>連鎖類型</FieldLabel><div className="flex flex-wrap gap-2">{["直營", "加盟", "合作", "混合"].map((item) => <ChoiceChip key={item} selected={chainType === item} onClick={() => setChainType(item)}>{item}</ChoiceChip>)}</div></div></div>}</div><div className="grid grid-cols-2 gap-3 pt-2"><button type="button" className="rounded-xl border border-[#cfbd95] bg-white py-3 font-medium">取消</button><button type="button" className="rounded-xl bg-[#286533] py-3 font-medium text-white">儲存畫面</button></div></section>;
}

function CustomerQuotesTab({ customer }: { customer: QuickCustomer }) {
  const [isAdding, setIsAdding] = useState(false);
  const [items, setItems] = useState([{ id: 1, image: "", name: "錫蘭茶包 100入", specification: "100包／箱", unit: "箱", quantity: 2, unitPrice: 280 }]);
  const [draft, setDraft] = useState({ image: "", name: "", specification: "", unit: "包", quantity: "1", unitPrice: "" });
  const addItem = () => {
    if (!draft.name.trim() || !draft.specification.trim() || !draft.quantity || !draft.unitPrice) return;
    setItems((current) => [...current, { id: Date.now(), image: draft.image, name: draft.name.trim(), specification: draft.specification.trim(), unit: draft.unit.trim() || "包", quantity: Number(draft.quantity), unitPrice: Number(draft.unitPrice) }]);
    setDraft({ image: "", name: "", specification: "", unit: "包", quantity: "1", unitPrice: "" });
    setIsAdding(false);
  };
  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  return <section className="rounded-xl border border-[#cfbd95] bg-[#f6f1e8] p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-[#777269]">廠家報價單</p><h3 className="mt-1 font-bold">{customer.name}</h3></div><button type="button" onClick={() => setIsAdding((current) => !current)} className="rounded-lg bg-[#286533] px-4 py-2 text-sm text-white">＋ 新增報價單</button></div>{isAdding && <div className="mt-4 space-y-3 rounded-xl border border-[#d6c7a7] bg-white p-4"><label className="block cursor-pointer rounded-lg border border-dashed border-[#c9b78e] p-3 text-sm text-[#665f53]">{draft.image || "＋ 商品圖片"}<input type="file" accept="image/*" onChange={(event) => setDraft((current) => ({ ...current, image: event.target.files?.[0]?.name || "" }))} className="sr-only" /></label><TextInput value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} placeholder="商品名稱 *" /><TextInput value={draft.specification} onChange={(event) => setDraft((current) => ({ ...current, specification: event.target.value }))} placeholder="規格／包裝量 *" /><div className="grid grid-cols-3 gap-2"><TextInput value={draft.unit} onChange={(event) => setDraft((current) => ({ ...current, unit: event.target.value }))} placeholder="單位" /><TextInput type="number" min="1" value={draft.quantity} onChange={(event) => setDraft((current) => ({ ...current, quantity: event.target.value }))} placeholder="數量" /><TextInput type="number" min="0" value={draft.unitPrice} onChange={(event) => setDraft((current) => ({ ...current, unitPrice: event.target.value }))} placeholder="單價" /></div><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setIsAdding(false)} className="rounded-lg border border-[#cfbd95] py-2.5 text-sm">取消</button><button type="button" onClick={addItem} className="rounded-lg bg-[#286533] py-2.5 text-sm text-white">暫存報價</button></div></div>}<div className="mt-4 space-y-3">{items.map((item) => <article key={item.id} className="grid grid-cols-[48px_1fr_auto] items-center gap-3 rounded-xl bg-white p-3"><div className="flex size-12 items-center justify-center rounded-lg bg-[#e6eee3] text-xs text-[#286533]">{item.image ? "圖片" : "茶"}</div><div><p className="text-sm font-semibold text-[#34322d]">{item.name}</p><p className="mt-1 text-xs text-[#8b877d]">{item.specification} · {item.quantity} {item.unit}</p></div><p className="text-sm font-bold text-[#286533]">${item.unitPrice.toLocaleString()}</p></article>)}</div><div className="mt-4 flex justify-between border-t border-[#ded2b7] pt-4"><span className="text-sm text-[#777269]">合計</span><strong>${total.toLocaleString()}</strong></div></section>;
}

function StrategyTab() {
  return <section className="space-y-5 rounded-xl border border-[#cfbd95] bg-[#f6f1e8] p-4">{[["顧客痛點 *", "描述客戶主要面臨的問題和需求…"], ["備註 *", "補充說明或其他重要信息…"], ["長期策略 *", "描述與該客戶的長期合作策略和目標…"]].map(([label, placeholder]) => <div key={label}><FieldLabel>{label}</FieldLabel><textarea placeholder={placeholder} className="min-h-24 w-full resize-none rounded-xl border border-[#cfbd95] bg-[#fffdf8] p-4 text-sm outline-none focus:border-[#286533]" /></div>)}<div className="grid grid-cols-2 gap-3"><button type="button" className="rounded-xl border border-[#cfbd95] bg-white py-3 font-medium">取消</button><button type="button" className="rounded-xl bg-[#286533] py-3 font-medium text-white">儲存畫面</button></div></section>;
}

function DetailScreen({ customer, onBack }: { customer: QuickCustomer; onBack: () => void }) {
  const { permissions } = useAccessControl();
  const [tab, setTab] = useState<DetailTab>("info");
  const tabs: Array<[DetailTab, string]> = [["info", "詳細資料"], ["value", "商業價值"], ["quotes", "報價單"], ["strategy", "策略思考"]];
  return <div className="flex min-h-[100dvh] flex-col bg-[#fffdf8]"><PhoneHeader title="廠家詳細資訊" back={onBack} /><main className="flex-1 p-4 pb-10"><SummaryCard customer={customer} /><div className="mt-5 grid grid-cols-4 border-b border-[#cfbd95]">{tabs.map(([id, label]) => <button key={id} type="button" onClick={() => setTab(id)} className={`border-b-2 px-1 py-3 text-xs font-medium ${tab === id ? "border-[#286533] text-[#285d34]" : "border-transparent text-[#777269]"}`}>{label}</button>)}</div>{permissions.readOnly && <p className="mt-4 rounded-lg bg-[#f3ead7] px-3 py-2 text-center text-xs font-medium text-[#765f39]">目前為主管／老闆唯讀模式</p>}<div className={`mt-5 ${permissions.readOnly ? "pointer-events-none opacity-80" : ""}`}>{tab === "info" && <InfoTab customer={customer} onOpenQuotes={() => setTab("quotes")} />}{tab === "value" && <CommercialValueTab />}{tab === "quotes" && <CustomerQuotesTab customer={customer} />}{tab === "strategy" && <StrategyTab />}</div></main><BottomNavigation /></div>;
}

export function QuickEntryPrototype() {
  const { permissions } = useAccessControl();
  const [screen, setScreen] = useState<Screen>("home");
  const [customers, setCustomers] = useState<QuickCustomer[]>([{ id: 1, name: "鈺祥食品", region: "新北", contact: "王先生", phone: "0912-345-678", samples: ["錫蘭300", "OEM: 9087"], note: "現場快速建立，詳細資料待後台補齊。", photoUrl: "", photoName: "", address: "新北市板橋區文化路一段", email: "contact@yuxiang.example", website: "instagram.com/yuxiang", customerType: "食品工廠", source: "陌生開發", sales: "林業務", status: "寄樣試用中", grade: "A", nextFollow: "2026-06-24", updatedAt: "2026-06-20" }]);
  const [selected, setSelected] = useState<QuickCustomer | null>(null);
  const navigate = (section: QuickSection) => setScreen(section);

  if (screen === "create") return <CreateScreen onCancel={() => setScreen("home")} onSave={(customer) => { setCustomers((current) => [customer, ...current]); setSelected(customer); setScreen("detail"); }} />;
  if (screen === "detail" && selected) return <DetailScreen customer={selected} onBack={() => setScreen("list")} />;

  if (screen === "home") return <div className="flex min-h-[100dvh] flex-col bg-[#fffdf8]"><QuickHomeContent onNavigate={navigate} onCreate={() => setScreen("create")} canCreate={permissions.createRecords} /><BottomNavigation onNavigate={navigate} /></div>;

  if (["inventory", "quotes", "search", "export", "dashboard"].includes(screen)) {
    const title = { inventory: "樣品庫存", quotes: "報價單", search: "搜尋", export: "匯出 Excel", dashboard: "儀表板" }[screen as Exclude<QuickSection, "home" | "list">];
    let content: ReactNode;
    if (screen === "inventory") content = <QuickInventoryContent />;
    else if (screen === "quotes") content = <QuickQuotesContent />;
    else if (screen === "search") content = <QuickSearchContent />;
    else if (screen === "export") content = <QuickExportContent />;
    else content = <QuickDashboardContent />;

    return <div className="flex min-h-[100dvh] flex-col bg-[#fffdf8]"><PhoneHeader title={title} back={() => setScreen("home")} />{content}<BottomNavigation onNavigate={navigate} /></div>;
  }

  return <div className="flex min-h-[100dvh] flex-col bg-[#fffdf8]"><PhoneHeader title="廠家" back={() => setScreen("home")} /><main className="relative flex-1 p-5 pb-28"><div className="flex items-end justify-between"><div><h1 className="text-3xl font-bold tracking-tight text-[#252521]">廠家列表</h1><p className="mt-2 text-[#777269]">{customers.length} 家店家</p></div>{permissions.createRecords && <button type="button" onClick={() => setScreen("create")} className="rounded-xl bg-[#286533] px-4 py-2.5 text-sm font-semibold text-white">＋ 新增廠家</button>}</div><div className="mt-6 space-y-3">{customers.map((customer) => <button key={customer.id} type="button" onClick={() => { setSelected(customer); setScreen("detail"); }} className="w-full rounded-xl border border-[#cfbd95] bg-[#f6f1e8] p-5 text-left shadow-sm transition active:scale-[0.99]"><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-bold text-[#2e2d28]">{customer.name}</h2><p className="mt-2 text-sm text-[#68645b]">{customer.contact} · {customer.phone}</p><div className="mt-2 flex flex-wrap gap-2"><span className="rounded-full bg-[#e8e0d1] px-2.5 py-1 text-xs text-[#665b47]">{customer.customerType}</span><span className="rounded-full bg-[#fff4cf] px-2.5 py-1 text-xs text-[#8a6518]">{customer.status}</span></div></div><span className="rounded-full bg-[#286533] px-3 py-1 text-sm text-white">{customer.region}</span></div><p className="mt-4 text-xs text-[#777269]">樣品需求摘要</p><div className="mt-2 flex flex-wrap gap-2">{customer.samples.map((sample) => <span key={sample} className={`rounded-full border px-2.5 py-1 text-xs font-medium ${sampleToneClasses[getSampleTone(sample)].idle}`}>{sample}</span>)}</div></button>)}</div>{permissions.createRecords && <button type="button" onClick={() => setScreen("create")} aria-label="快速建立店家" className="fixed bottom-24 right-[max(1.5rem,calc((100vw-30rem)/2+1.5rem))] z-20 flex size-16 items-center justify-center rounded-full bg-[#286533] text-4xl font-light text-white shadow-xl transition hover:scale-105 active:scale-95">＋</button>}</main><BottomNavigation onNavigate={navigate} /></div>;
}
