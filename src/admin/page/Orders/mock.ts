// src/features/orders/mock.ts
// Mock simple con persistencia en localStorage para desarrollo.

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
  creado_en: string; // ISO string
}

const LS_KEY = "mock_sales_v1";
const PRODUCT_SKUS = [
  "PARA-500",
  "IBUP-400",
  "AMOX-500",
  "ATV-20",
  "LPR-10",
  "MET-500",
  "OMP-20",
];
const PRODUCT_PRICES = {
  "PARA-500": 5.5,
  "IBUP-400": 7.2,
  "AMOX-500": 12.0,
  "ATV-20": 18.5,
  "LPR-10": 4.0,
  "MET-500": 9.9,
  "OMP-20": 15.0,
};
const WAREHOUSES = ["PRINCIPAL", "SUCURSAL A", "SUCURSAL B"];
const NUM_SALES_TO_SEED = 50; // ¡Generaremos 50 ventas!

function nextSeqFrom(s: string): string {
  // toma el último bloque numérico y lo incrementa con padding
  const m = s.match(/(\d+)(?!.*\d)/);
  const n = m ? parseInt(m[1], 10) : 0;
  const next = (n + 1)
    .toString()
    .padStart(Math.max(4, m?.[1]?.length ?? 4), "0");
  return s.replace(/(\d+)(?!.*\d)/, next) || `V-${next}`;
}

/**
 * Genera datos mock adicionales de forma aleatoria.
 * @param count Número de ventas a generar.
 * @param startNumber Número de venta inicial (ej: "V-0003").
 */
function seedMockData(count: number, startNumber: string): Sale[] {
  const sales: Sale[] = [];
  let currentNumber = startNumber;

  for (let i = 0; i < count; i++) {
    const numItems = Math.floor(Math.random() * 3) + 1; // 1 a 3 items
    const items: SaleItem[] = [];
    let total = 0;

    // Seleccionar SKUs únicos para esta venta
    const availableSKUs = [...PRODUCT_SKUS];
    const itemsForSale = [];
    while (itemsForSale.length < numItems && availableSKUs.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableSKUs.length);
      itemsForSale.push(availableSKUs.splice(randomIndex, 1)[0]);
    }

    // Construir los items
    for (const sku of itemsForSale) {
      const cantidad = Math.floor(Math.random() * 5) + 1; // 1 a 5 unidades
      const precio = PRODUCT_PRICES[sku as keyof typeof PRODUCT_PRICES];
      items.push({ sku, cantidad, precio });
      total += cantidad * precio;
    }

    // Generar fecha de forma progresiva (hacia el pasado)
    const timeOffset = (i + 1) * 1000 * 60 * (Math.random() * 120 + 1); // 1 a 120 minutos en el pasado
    const date = new Date(Date.now() - timeOffset);

    sales.push({
      _id: crypto.randomUUID?.() ?? String(Date.now() + i),
      numero_venta: currentNumber,
      almacen: WAREHOUSES[Math.floor(Math.random() * WAREHOUSES.length)],
      items,
      total: parseFloat(total.toFixed(2)),
      creado_en: date.toISOString(),
    });

    currentNumber = nextSeqFrom(currentNumber); // Siguiente número de venta
  }

  return sales;
}

function load(): Sale[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw) as Sale[];
  } catch {
    // Error al leer localStorage
  }

  // --- Seed inicial base ---
  const initialTime = Date.now() - 1000 * 60 * 60 * 5; // Hace 5 horas
  const seed: Sale[] = [
    {
      _id: String(initialTime),
      numero_venta: "V-0001",
      almacen: "PRINCIPAL",
      items: [
        { sku: "PARA-500", cantidad: 2, precio: 5.5 },
        { sku: "IBUP-400", cantidad: 1, precio: 7.2 },
      ],
      total: 2 * 5.5 + 1 * 7.2, // 18.2
      creado_en: new Date(initialTime).toISOString(),
    },
    {
      _id: String(initialTime + 1000 * 60 * 10),
      numero_venta: "V-0002",
      almacen: "SUCURSAL A",
      items: [{ sku: "AMOX-500", cantidad: 1, precio: 12 }],
      total: 12,
      creado_en: new Date(initialTime + 1000 * 60 * 10).toISOString(),
    },
  ];

  // --- Generar datos adicionales ---
  const additionalSales = seedMockData(NUM_SALES_TO_SEED, "V-0003");
  const allSales = [...seed, ...additionalSales];

  save(allSales);
  return allSales;
}

function save(data: Sale[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch {
    // Error al escribir localStorage
  }
}

let SALES: Sale[] = load();

/* ===== API MOCK compatible con la real ===== */

export async function listSales(page = 1, limit = 50): Promise<Sale[]> {
  // ordena desc por fecha
  const sorted = [...SALES].sort((a, b) =>
    b.creado_en.localeCompare(a.creado_en)
  );
  const start = (page - 1) * limit;
  return Promise.resolve(sorted.slice(start, start + limit));
}

export async function nextNumber(): Promise<string> {
  if (SALES.length === 0) return "V-0001";
  // Obtener el número más alto, incluso si no está al final del array
  const last = [...SALES]
    .sort((a, b) => a.numero_venta.localeCompare(b.numero_venta))
    .at(-1)!;
  return Promise.resolve(nextSeqFrom(last.numero_venta));
}

export async function createSale(payload: {
  numero_venta: string;
  almacen: string;
  items: SaleItemInput[];
}): Promise<Sale> {
  // El cálculo del total debe usar los precios del payload, que ya son opcionales.
  const total = payload.items.reduce(
    (s, it) => s + (it.precio ?? 0) * it.cantidad,
    0
  );
  const sale: Sale = {
    _id: crypto.randomUUID?.() ?? String(Date.now()),
    numero_venta: payload.numero_venta,
    almacen: payload.almacen,
    // Aseguramos que los items sean del tipo SaleItem
    items: payload.items.map((i) => ({
      sku: i.sku,
      cantidad: i.cantidad,
      precio: i.precio,
    })),
    total: parseFloat(total.toFixed(2)), // Redondear a 2 decimales
    creado_en: new Date().toISOString(),
  };
  SALES.push(sale);
  save(SALES);
  return Promise.resolve(sale);
}

/* Utilidad para tests/manual */
export function resetMocks(data?: Sale[]) {
  SALES = data ?? [];
  save(SALES);
}

// Exportar la función de seeding para uso manual si se desea
export function generateAndSaveMocks() {
    SALES = seedMockData(NUM_SALES_TO_SEED, "V-0001");
    save(SALES);
    return SALES.length;
}