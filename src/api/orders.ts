export interface SaleItemInput {
  sku: string;
  cantidad: number;
  precio?: number;
}

export interface SaleItem {
  sku: string;
  cantidad: number;
  precio?: number;
}

export interface Sale {
  _id: string;
  numero_venta: string;
  almacen: string;
  items: SaleItem[];
  total: number;
  creado_en: string;
}

export interface CreateSalePayload {
  numero_venta: string;
  almacen: string;
  items: SaleItemInput[];
}

const API_BASE = (import.meta.env.VITE_API_BASE)
  .replace(/\/$/, "");

/** Pequeño wrapper con timeout y validación básica de JSON */
async function request<T>(path: string, init?: RequestInit, timeoutMs = 10000): Promise<T> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { Accept: "application/json", ...(init?.headers ?? {}) },
      signal: controller.signal,
      ...init,
    });

    const text = await res.text();
    if (!res.ok) {
      const msg = text ? ` - ${text}` : "";
      throw new Error(`${res.status} ${res.statusText}${msg}`);
    }

    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      return JSON.parse(text) as T;
    }
    // Si esperas siempre JSON, puedes lanzar error aquí:
    throw new Error("Respuesta no-JSON del servidor");
  } finally {
    clearTimeout(id);
  }
}

export function listSales(page = 1, limit = 50): Promise<Sale[]> {
  return request<Sale[]>(`/sales?page=${page}&limit=${limit}`);
}

export async function nextNumber(): Promise<string> {
  const data = await request<{ numero_venta: string }>(`/sales/next-number`, { method: "POST" });
  return data.numero_venta;
}

export function createSale(payload: CreateSalePayload): Promise<Sale> {
  return request<Sale>(`/sales`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
