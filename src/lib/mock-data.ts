export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  reorderLevel: number;
  image?: string;
};

export const categories = ["All", "Beverages", "Bakery", "Dairy", "Household", "Snacks", "Produce"];

export const products: Product[] = [
  { id: "P001", name: "Coca-Cola 500ml", sku: "BEV-001", category: "Beverages", price: 80, stock: 142, reorderLevel: 30 },
  { id: "P002", name: "Brookside Milk 1L", sku: "DRY-014", category: "Dairy", price: 120, stock: 24, reorderLevel: 25 },
  { id: "P003", name: "Supa Loaf 400g", sku: "BAK-007", category: "Bakery", price: 65, stock: 58, reorderLevel: 20 },
  { id: "P004", name: "Omo Detergent 1kg", sku: "HSE-021", category: "Household", price: 320, stock: 12, reorderLevel: 15 },
  { id: "P005", name: "Pringles Original", sku: "SNK-003", category: "Snacks", price: 280, stock: 76, reorderLevel: 20 },
  { id: "P006", name: "Sukari Brown 1kg", sku: "PRD-009", category: "Produce", price: 180, stock: 0, reorderLevel: 30 },
  { id: "P007", name: "Tropical Heat Nuts", sku: "SNK-011", category: "Snacks", price: 150, stock: 44, reorderLevel: 20 },
  { id: "P008", name: "Dasani Water 1L", sku: "BEV-005", category: "Beverages", price: 70, stock: 210, reorderLevel: 40 },
  { id: "P009", name: "Blue Band 250g", sku: "DRY-002", category: "Dairy", price: 195, stock: 18, reorderLevel: 20 },
  { id: "P010", name: "Tilapia Frozen 1kg", sku: "PRD-022", category: "Produce", price: 540, stock: 9, reorderLevel: 10 },
];

export const transactions = [
  { id: "TX-10231", time: "10:42", cashier: "Jane K.", items: 6, total: 1240, method: "M-Pesa" },
  { id: "TX-10230", time: "10:38", cashier: "Peter O.", items: 2, total: 240, method: "Cash" },
  { id: "TX-10229", time: "10:31", cashier: "Jane K.", items: 12, total: 3870, method: "M-Pesa" },
  { id: "TX-10228", time: "10:22", cashier: "Mary W.", items: 4, total: 690, method: "Cash" },
  { id: "TX-10227", time: "10:15", cashier: "Peter O.", items: 8, total: 2105, method: "M-Pesa" },
];

export const salesByDay = [
  { day: "Mon", sales: 42000, orders: 138 },
  { day: "Tue", sales: 51200, orders: 162 },
  { day: "Wed", sales: 47800, orders: 151 },
  { day: "Thu", sales: 58400, orders: 184 },
  { day: "Fri", sales: 72300, orders: 221 },
  { day: "Sat", sales: 91500, orders: 287 },
  { day: "Sun", sales: 64800, orders: 199 },
];

export const categoryShare = [
  { name: "Beverages", value: 32 },
  { name: "Dairy", value: 21 },
  { name: "Bakery", value: 15 },
  { name: "Household", value: 14 },
  { name: "Snacks", value: 12 },
  { name: "Produce", value: 6 },
];

export const stockRequests = [
  { id: "REQ-441", product: "Brookside Milk 1L", qty: 60, requested: "2026-05-24", by: "Branch A", status: "pending" as const },
  { id: "REQ-440", product: "Sukari Brown 1kg", qty: 80, requested: "2026-05-24", by: "Branch B", status: "pending" as const },
  { id: "REQ-439", product: "Omo Detergent 1kg", qty: 40, requested: "2026-05-23", by: "Branch A", status: "approved" as const },
  { id: "REQ-438", product: "Tilapia Frozen 1kg", qty: 20, requested: "2026-05-23", by: "Branch C", status: "rejected" as const },
  { id: "REQ-437", product: "Dasani Water 1L", qty: 200, requested: "2026-05-22", by: "Branch A", status: "approved" as const },
];

export const notifications = [
  { id: 1, type: "danger" as const, title: "Out of stock: Sukari Brown 1kg", time: "10 min ago" },
  { id: 2, type: "warning" as const, title: "Low stock: Brookside Milk 1L (24 left)", time: "32 min ago" },
  { id: 3, type: "info" as const, title: "New stock request REQ-441 from Branch A", time: "1 hr ago" },
  { id: 4, type: "success" as const, title: "Restock approved: Dasani Water 1L (+200)", time: "3 hrs ago" },
  { id: 5, type: "danger" as const, title: "Rejected request REQ-438 (Tilapia)", time: "5 hrs ago" },
  { id: 6, type: "info" as const, title: "Daily sales summary: KSh 91,500 (287 orders)", time: "Yesterday" },
];

export const topProducts = [
  { name: "Coca-Cola 500ml", sold: 412, revenue: 32960 },
  { name: "Supa Loaf 400g", sold: 388, revenue: 25220 },
  { name: "Dasani Water 1L", sold: 356, revenue: 24920 },
  { name: "Brookside Milk 1L", sold: 241, revenue: 28920 },
  { name: "Pringles Original", sold: 187, revenue: 52360 },
];
