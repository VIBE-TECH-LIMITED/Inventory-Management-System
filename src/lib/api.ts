// Typed REST client for the Quick Save Spring Boot backend.
// Mirrors the DTOs defined in com.Merlin.Inventory.Management.System.*

const DEFAULT_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8080";

export function getApiBase(): string {
  if (typeof window !== "undefined") {
    const override = window.localStorage.getItem("qs_api_url");
    if (override) return override.replace(/\/$/, "");
  }
  return DEFAULT_BASE.replace(/\/$/, "");
}

export function setApiBase(url: string) {
  if (typeof window !== "undefined") window.localStorage.setItem("qs_api_url", url);
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("qs_token");
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem("qs_token", token);
  else window.localStorage.removeItem("qs_token");
}

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

type Options = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | undefined>;
};

export async function api<T>(path: string, opts: Options = {}): Promise<T> {
  const { method = "GET", body, query } = opts;
  const base = getApiBase();
  const url = new URL(base + path);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }
  const headers: Record<string, string> = { Accept: "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    const msg =
      (data && typeof data === "object" && "message" in data && String((data as { message: unknown }).message)) ||
      (typeof data === "string" && data) ||
      `Request failed (${res.status})`;
    throw new ApiError(msg, res.status, data);
  }
  return data as T;
}

// ===== DTO Types (mirror the Java records) =====

export type AuthRegisterDto = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
};
export type AuthLogInDto = { email: string; password: string };
export type AuthResponseDto = { email: string; message: string };
export type AuthTokenResponse = { token: string; type?: string; email?: string; role?: string };

export type UserDto = AuthRegisterDto;
export type UserResponseDto = {
  Id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: "ADMIN" | "CASHIER" | string;
};
export type ChangePasswordDto = {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};
export type ForgortResponse = { message: string };

export type CategoryDto = { categoryName: string };
export type CategoryResponseDto = { id: number; categoryName: string };

export type ProductDto = {
  productName: string;
  description?: string;
  sellingPrice: number;
  minimumQuantity: number;
  supplierId: number;
  categoryId: number;
};
export type ProductResponseDto = {
  Id: number;
  productName: string;
  description: string;
  sellingPrice: number;
  minimumQuantity: number;
  supplierId: number;
  categoryId: number;
};

export type SupplierDto = {
  supplierName: string;
  contactName: string;
  contactNumber: string;
  address?: string;
};
export type SupplierResponseDto = {
  id: number;
  supplierName: string;
  contactName: string;
  contactNumber: string;
  address: string;
  isActive: boolean;
};

export type StockStatus = "PENDING" | "APPROVED" | "REJECTED";
export type StockDto = {
  productId: number;
  arrivedQuantity: number;
  buyingPrice: number;
  supplierId: number;
};
export type StockResponseDto = {
  Id: number;
  productId: number;
  arrivedQuantity: number;
  boughtPrice: number;
  supplierName: string;
  addedByName: string;
  approvedByName: string | null;
  approvedDate: string | null;
  status: StockStatus;
};

export type AdjustmentType = "INCREASE" | "DECREASE";
export type StockAdjustmentDto = {
  productId: number;
  quantity: number;
  adjustmentType: AdjustmentType;
  reason: string;
};
export type StockAdjustmentResponse = {
  Id: number;
  productName: string;
  quantity: number;
  adjustmentType: AdjustmentType;
  reason: string;
};

export type PaymentMethod = "CASH" | "MPESA";
export type TransactionItemRequest = { productId: number; quantity: number };
export type TransactionDTO = {
  items: TransactionItemRequest[];
  paymentMethod: PaymentMethod;
  phoneNumber?: string;
};
export type TransactionResponse = {
  Id: number;
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
};
export type TransactionResponseDto = {
  Id: number;
  transactionId: number;
  cashierName: string;
  items: TransactionResponse[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
};

export type ItemsSold = { productName: string; quantitySold: number };
export type DailyReportDto = {
  date: string;
  totalSales: number;
  numberOfTransactions: number;
  itemsSoldList: ItemsSold[];
};
export type MonthlyReportDto = {
  month: string;
  totalSales: number;
  numberOfTransactions: number;
  mostSoldItem: ItemsSold[];
  profit: number;
  loss: number;
};
export type DateRangeReportDto = {
  startDate: string;
  endDate: string;
  totalSales: number;
  numberOfTransactions: number;
  topSellingItems: ItemsSold[];
  profit: number;
  loss: number;
};

// ===== Endpoint helpers =====

export const AuthAPI = {
  register: (dto: AuthRegisterDto) =>
    api<AuthResponseDto>("/api/auth/register", { method: "POST", body: dto }),
  logIn: (dto: AuthLogInDto) =>
    api<AuthTokenResponse>("/api/auth/logIn", { method: "POST", body: dto }),
};

export const UsersAPI = {
  list: () => api<UserResponseDto[]>("/api/users"),
  create: (dto: UserDto) => api<UserResponseDto>("/api/users/create", { method: "POST", body: dto }),
  update: (dto: UserDto) => api<UserResponseDto>("/api/users/update", { method: "PATCH", body: dto }),
  byName: (firstName: string, lastName: string) =>
    api<UserResponseDto[]>("/api/users/userName", { query: { firstName, lastName } }),
  activate: (userId: number) => api<void>(`/api/users/activate/${userId}`, { method: "POST" }),
  deactivate: (userId: number) => api<void>(`/api/users/deactivate/${userId}`, { method: "POST" }),
  changePassword: (dto: ChangePasswordDto) =>
    api<void>("/api/users/changepassword", { method: "POST", body: dto }),
  forgotPassword: (userEmail: string) =>
    api<ForgortResponse>("/api/users/forgotPassword", { method: "POST", query: { userEmail } }),
};

export const CategoriesAPI = {
  list: () => api<CategoryResponseDto[]>("/api/categories"),
  get: (categoryId: number) =>
    api<CategoryResponseDto>("/api/categories/category/", { query: { categoryId } }),
  create: (dto: CategoryDto) =>
    api<CategoryResponseDto>("/api/categories/create", { method: "POST", body: dto }),
  update: (categoryId: number, dto: CategoryDto) =>
    api<CategoryResponseDto>(`/api/categories/update/${categoryId}`, { method: "PATCH", body: dto }),
  remove: (categoryId: number) =>
    api<void>(`/api/categories/delete/${categoryId}`, { method: "DELETE" }),
};

export const ProductsAPI = {
  all: () => api<ProductResponseDto[]>("/api/products/all"),
  active: () => api<ProductResponseDto[]>("/api/products/active"),
  deactivated: () => api<ProductResponseDto[]>("/api/products/deactivated"),
  create: (dto: ProductDto) =>
    api<ProductResponseDto>("/api/products/create", { method: "POST", body: dto }),
  update: (productId: number, dto: ProductDto) =>
    api<ProductResponseDto>(`/api/products/update/${productId}`, { method: "PATCH", body: dto }),
  activate: (productId: number) =>
    api<void>(`/api/products/activate/${productId}`, { method: "PATCH" }),
  deactivate: (productId: number) =>
    api<void>(`/api/products/deactivate/${productId}`, { method: "PATCH" }),
  remove: (productId: number) =>
    api<void>(`/api/products/delete/${productId}`, { method: "DELETE" }),
};

export const StocksAPI = {
  list: () => api<StockResponseDto[]>("/api/stocks"),
  byProduct: (productId: number) => api<StockResponseDto[]>(`/api/stocks/product/${productId}`),
  byStatus: (status: StockStatus) => api<StockResponseDto[]>(`/api/stocks/status/${status}`),
  bySupplier: (supplierId: number) => api<StockResponseDto[]>(`/api/stocks/supplier/${supplierId}`),
  create: (dto: StockDto) => api<StockDto>("/api/stocks/create", { method: "POST", body: dto }),
  approve: (stockId: number) => api<void>(`/api/stocks/approve/${stockId}`, { method: "PATCH" }),
  reject: (stockId: number) => api<void>(`/api/stocks/reject/${stockId}`, { method: "PATCH" }),
};

export const StockAdjustmentsAPI = {
  list: () => api<StockAdjustmentResponse[]>("/api/stockAdjustments"),
  request: (dto: StockAdjustmentDto) =>
    api<StockAdjustmentResponse>("/api/stockAdjustments/adjustRequest", { method: "POST", body: dto }),
  approve: (id: number) =>
    api<void>(`/api/stockAdjustments/approve/${id}`, { method: "PATCH" }),
  reject: (id: number) =>
    api<void>(`/api/stockAdjustments/reject/${id}`, { method: "PATCH" }),
  byProduct: (productId: number) =>
    api<StockAdjustmentResponse[]>(`/api/stockAdjustments/product/${productId}`),
  byStatus: (status: StockStatus) =>
    api<StockAdjustmentResponse[]>(`/api/stockAdjustments/status/${status}`),
};

export const TransactionsAPI = {
  list: () => api<TransactionResponseDto[]>("/api/Transactions"),
  today: () => api<TransactionResponseDto[]>("/api/Transactions/today"),
  byId: (id: number) => api<TransactionResponseDto>(`/api/Transactions/${id}`),
  create: (dto: TransactionDTO) =>
    api<TransactionResponseDto>("/api/Transactions/create", { method: "POST", body: dto }),
};

export const ReportsAPI = {
  today: () => api<DailyReportDto>("/api/report/today"),
  thisMonth: () => api<MonthlyReportDto>("/api/report/thisMonth"),
  dateRange: (startDate: string, endDate: string) =>
    api<DateRangeReportDto>("/api/report/dateRange", { query: { startDate, endDate } }),
};
