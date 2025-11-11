// src/features/orders/OrdersPage.tsx
import React from "react";
import {
  createSale,
  listSales,
  nextNumber,
  type Sale,
  type SaleItemInput,
} from "./mock";

function fmtMoney(v: number) {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
    maximumFractionDigits: 2,
  }).format(v);
}

function fmtDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("es-BO", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function OrdersPage() {
  const [sales, setSales] = React.useState<Sale[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [openNew, setOpenNew] = React.useState(false);

  async function reload() {
    setLoading(true);
    setError(null);
    try {
      const data = await listSales(1, 50);
      setSales(data);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError(String(e));
      }
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    reload();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Órdenes</h1>
          <p className="text-sm text-slate-500">
            Lista de ventas (mock) y creación de nuevas órdenes.
          </p>
        </div>
        <button
          onClick={() => setOpenNew(true)}
          className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          + Nueva venta
        </button>
      </header>

      {loading && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-slate-600">
          Cargando…
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          Error: {error}
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3"># Venta</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Almacén</th>
                <th className="px-4 py-3">Ítems</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sales.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-slate-500"
                  >
                    Sin ventas registradas aún.
                  </td>
                </tr>
              )}
              {sales.map((s) => (
                <tr key={s._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{s.numero_venta}</td>
                  <td className="px-4 py-3">{fmtDate(s.creado_en)}</td>
                  <td className="px-4 py-3">{s.almacen}</td>
                  <td className="px-4 py-3">{s.items.length}</td>
                  <td className="px-4 py-3 text-right">
                    {fmtMoney(s.total ?? 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {openNew && (
        <NewSaleDialog
          onClose={() => setOpenNew(false)}
          onCreated={() => {
            setOpenNew(false);
            reload();
          }}
        />
      )}
    </div>
  );
}

function NewSaleDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [numero, setNumero] = React.useState("");
  const [almacen, setAlmacen] = React.useState("PRINCIPAL");
  const [sku, setSku] = React.useState("");
  const [cantidad, setCantidad] = React.useState<number>(1);
  const [precio, setPrecio] = React.useState<string>("");
  const [items, setItems] = React.useState<SaleItemInput[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        setNumero(await nextNumber());
      } catch {
        setNumero(`V-${Date.now()}`);
      }
    })();
  }, []);

  function addItem() {
    if (!sku.trim() || !cantidad || cantidad <= 0) return;
    const p = precio.trim() ? Number(precio) : undefined;
    setItems((prev) => [...prev, { sku: sku.trim(), cantidad, precio: p }]);
    setSku("");
    setCantidad(1);
    setPrecio("");
  }

  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function submit() {
    if (items.length === 0) {
      setError("Agrega al menos un ítem");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createSale({
        numero_venta: numero.trim(),
        almacen: almacen.trim(),
        items,
      });
      onCreated();
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError(String(e));
      }
    } finally {
      setSubmitting(false);
    }
  }

  const total = items.reduce((s, it) => s + (it.precio ?? 0) * it.cantidad, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-semibold">Nueva venta</h2>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm text-slate-600">
                Número de venta
              </label>
              <input
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600">Almacén</label>
              <input
                value={almacen}
                onChange={(e) => setAlmacen(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <p className="mb-3 text-sm font-medium text-slate-700">
              Agregar ítem
            </p>
            <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr_auto]">
              <input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="SKU"
                className="rounded-lg border px-3 py-2 outline-none focus:border-indigo-500"
              />
              <input
                type="number"
                min={1}
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
                className="rounded-lg border px-3 py-2 outline-none focus:border-indigo-500"
                placeholder="Cant."
              />
              <input
                type="number"
                step="0.01"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                className="rounded-lg border px-3 py-2 outline-none focus:border-indigo-500"
                placeholder="Precio (opcional)"
              />
              <button
                onClick={addItem}
                className="rounded-lg bg-slate-800 px-4 py-2 text-white hover:bg-slate-900"
              >
                Añadir
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {items.length === 0 && (
                <div className="text-sm text-slate-500">Sin items aún</div>
              )}
              {items.map((it, i) => (
                <div
                  key={`${it.sku}-${i}`}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <div className="text-sm">
                    <div className="font-medium">{it.sku}</div>
                    <div className="text-slate-500">
                      Cant: {it.cantidad}{" "}
                      {typeof it.precio === "number"
                        ? `· Precio: ${fmtMoney(it.precio)}`
                        : ""}
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(i)}
                    className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100"
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Total preliminar:{" "}
              <span className="font-semibold">{fmtMoney(total)}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="rounded-lg border px-4 py-2 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={submit}
                disabled={submitting}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {submitting ? "Guardando…" : "Registrar venta"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}