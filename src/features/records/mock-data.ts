export type Customer = {
  id: number;
  name: string;
  region: string;
  address: string;
  contact: string;
  phone: string;
  email: string;
  website: string;
  type: string;
  source: string;
  sales: string;
  status: string;
  grade: "A" | "B" | "C";
  nextFollow: string;
  createdAt: string;
  closedAt?: string;
  monthly: string;
  samples: string[];
  competitors: string[];
  pain: string;
  strategy: string;
  note: string;
};

export type Quote = {
  id: number;
  customerId: number;
  number: string;
  date: string;
  status: string;
  attachment: string;
  items: Array<{
    name: string;
    spec: string;
    unit: string;
    qty: number;
    price: number;
  }>;
};

export type Task = {
  id: number;
  title: string;
  customerId: number;
  start: string;
  due: string;
  status: "待處理" | "進行中" | "已完成" | "延後";
  note: string;
};

export type InventoryItem = {
  name: string;
  category: string;
  qty: number;
  unit: string;
  location: string;
  note: string;
  lastUpdated?: string;
};

export type SampleRecord = {
  id: number;
  customerId: number;
  samples: string[];
  sentAt: string;
  sentBy: string;
  status: "待準備" | "已寄出" | "已收到" | "待回覆" | "完成";
  feedback: string;
  nextFollow: string;
};

export const customers: Customer[] = [
  {
    id: 1,
    name: "春田早餐",
    region: "台中",
    address: "台中市西區民生路12號",
    contact: "陳志明",
    phone: "0912-345-678",
    email: "",
    website: "",
    type: "飲料店",
    source: "陌生開發",
    sales: "林業務",
    status: "寄樣試用中",
    grade: "A",
    nextFollow: "2026-06-21",
    createdAt: "2026-06-03",
    monthly: "約 200 包/月",
    samples: ["錫蘭 300", "阿薩姆茶包"],
    competitors: ["裕展", "T世家"],
    pain: "現有茶商品質不穩定，價格偏高",
    strategy: "先從樣品切入，建立信任後推薦月供方案",
    note: "老闆對品質要求高，下次拜訪帶比較試喝",
  },
  {
    id: 2,
    name: "聚鮮飲料行",
    region: "台北",
    address: "台北市大安區復興南路一段100號",
    contact: "李美玲",
    phone: "0928-111-222",
    email: "lily@juxian.com",
    website: "",
    type: "飲料店",
    source: "展覽",
    sales: "張業務",
    status: "已成交",
    grade: "A",
    nextFollow: "",
    createdAt: "2026-05-15",
    closedAt: "2026-06-10",
    monthly: "約 500 包/月",
    samples: ["阿薩姆 180"],
    competitors: ["東爵", "桔揚"],
    pain: "想找穩定供應商，之前斷貨過",
    strategy: "強調穩定供貨能力，提供安全庫存服務",
    note: "",
  },
  {
    id: 3,
    name: "鑫享餐廳",
    region: "台南",
    address: "台南市東區東門路二段55號",
    contact: "王大明",
    phone: "0935-222-333",
    email: "",
    website: "",
    type: "餐廳",
    source: "介紹",
    sales: "林業務",
    status: "報價談判中",
    grade: "B",
    nextFollow: "2026-06-22",
    createdAt: "2026-06-12",
    monthly: "約 100 包/月",
    samples: ["錫蘭茶包", "P"],
    competitors: ["天仁"],
    pain: "餐廳想要有特色的下午茶茶款",
    strategy: "推薦調味茶系列，差異化競爭",
    note: "",
  },
  {
    id: 4,
    name: "日出咖啡",
    region: "台中",
    address: "台中市北區崇德路一段200號",
    contact: "林小燕",
    phone: "0956-444-555",
    email: "",
    website: "https://sunrisecafe.tw",
    type: "咖啡廳",
    source: "陌生開發",
    sales: "張業務",
    status: "新名單",
    grade: "C",
    nextFollow: "2026-06-24",
    createdAt: "2026-06-18",
    monthly: "尚未確認",
    samples: ["L", "E"],
    competitors: [],
    pain: "",
    strategy: "",
    note: "外出拜訪認識",
  },
  {
    id: 5,
    name: "金豐食品",
    region: "高雄",
    address: "高雄市前鎮區中山三路300號",
    contact: "張建國",
    phone: "0911-666-777",
    email: "kf@food.com.tw",
    website: "",
    type: "食品工廠",
    source: "官網",
    sales: "林業務",
    status: "已建立聯絡",
    grade: "B",
    nextFollow: "2026-06-20",
    createdAt: "2026-04-20",
    monthly: "約 2000 包/月",
    samples: ["錫蘭 300", "阿薩姆 200"],
    competitors: ["立頓", "明芳"],
    pain: "目前用量大，希望壓低採購成本",
    strategy: "量大給優惠價，綁定長期供應合約",
    note: "",
  },
];

export const quotes: Quote[] = [
  {
    id: 1,
    customerId: 1,
    number: "QT-2025-001",
    date: "2025-07-01",
    status: "議價中",
    attachment: "QT-2025-001.pdf",
    items: [
      { name: "錫蘭茶包 100入", spec: "100包/箱", unit: "箱", qty: 2, price: 280 },
      { name: "阿薩姆茶包 100入", spec: "100包/箱", unit: "箱", qty: 2, price: 260 },
    ],
  },
  {
    id: 2,
    customerId: 2,
    number: "QT-2025-002",
    date: "2025-07-05",
    status: "已成交",
    attachment: "QT-2025-002.pdf",
    items: [
      { name: "阿薩姆 180 茶葉", spec: "180g/包", unit: "包", qty: 10, price: 120 },
    ],
  },
  {
    id: 3,
    customerId: 3,
    number: "QT-2025-003",
    date: "2025-07-08",
    status: "待回覆",
    attachment: "",
    items: [
      { name: "錫蘭茶包 100入", spec: "100包/箱", unit: "箱", qty: 1, price: 280 },
      { name: "P 調味茶", spec: "1kg/包", unit: "包", qty: 2, price: 350 },
    ],
  },
];

export const tasks: Task[] = [
  { id: 1, title: "寄送樣品給春田早餐", customerId: 1, start: "2026-06-20", due: "2026-06-21", status: "進行中", note: "送錫蘭 300 + 阿薩姆茶包各一份" },
  { id: 2, title: "回覆報價 → 鑫享餐廳", customerId: 3, start: "2026-06-20", due: "2026-06-22", status: "待處理", note: "" },
  { id: 3, title: "補齊客戶資料 → 日出咖啡", customerId: 4, start: "2026-06-18", due: "2026-06-20", status: "已完成", note: "" },
];

export const sampleRecords: SampleRecord[] = [
  { id: 1, customerId: 1, samples: ["錫蘭300", "阿薩姆"], sentAt: "2026-06-20", sentBy: "林業務", status: "已寄出", feedback: "等待客戶試喝", nextFollow: "2026-06-24" },
  { id: 2, customerId: 3, samples: ["P", "錫蘭"], sentAt: "", sentBy: "張業務", status: "待準備", feedback: "", nextFollow: "2026-06-23" },
];

export const inventory: InventoryItem[] = [
  { name: "錫蘭 300", category: "茶葉", qty: 45, unit: "包", location: "A 架", note: "" },
  { name: "阿薩姆 180", category: "茶葉", qty: 3, unit: "包", location: "A 架", note: "庫存偏低，需補貨" },
  { name: "阿薩姆 200", category: "茶葉", qty: 22, unit: "包", location: "A 架", note: "" },
  { name: "錫蘭茶包", category: "茶包", qty: 60, unit: "盒", location: "B 架", note: "" },
  { name: "阿薩姆茶包", category: "茶包", qty: 5, unit: "盒", location: "B 架", note: "庫存偏低" },
  { name: "大麥越南", category: "茶包", qty: 30, unit: "盒", location: "B 架", note: "" },
  { name: "咖啡紅越南", category: "茶包", qty: 18, unit: "盒", location: "B 架", note: "" },
  { name: "大麥印尼", category: "茶包", qty: 25, unit: "盒", location: "B 架", note: "" },
  { name: "復刻印尼", category: "茶包", qty: 12, unit: "盒", location: "B 架", note: "" },
  { name: "P 調味茶", category: "調味茶", qty: 18, unit: "包", location: "C 架", note: "" },
  { name: "L 調味茶", category: "調味茶", qty: 12, unit: "包", location: "C 架", note: "" },
  { name: "E 調味茶", category: "調味茶", qty: 8, unit: "包", location: "C 架", note: "" },
  { name: "OEM 9087", category: "特殊OEM/其他", qty: 6, unit: "包", location: "D 架", note: "客製樣品" },
];
