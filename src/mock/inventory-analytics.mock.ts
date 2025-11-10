// src/mock/inventory-analytics.mock.ts

export interface InventoryProduct {
  sku: string;
  nombre: string;
  categoria: string;
  cantidadDisponible: number;
  cantidadReservada: number;
  puntoReorden: number;
  stockSeguridad: number;
  diasCobertura: number;
  rotacion: number;
  costoUnitario: number;
  precioVenta: number;
  margen: number;
}

export interface SalesData {
  fecha: string;
  ventas: number;
  revenue: number;
  categoria: string;
}

export interface ForecastData {
  sku: string;
  producto: string;
  prediccionDia: number;
  demandaPredicha: number;
  confianzaLower: number;
  confianzaUpper: number;
}

export interface KPI {
  label: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
}

// Generador de datos ficticios
export const generateMockInventoryData = (): InventoryProduct[] => {
  const productos = [
    { nombre: "Camiseta Tesla Negra", categoria: "Camisetas", base: 150 },
    { nombre: "Sudadera Tesla Blanca", categoria: "Sudaderas", base: 80 },
    { nombre: "Chaqueta Tesla Gris", categoria: "Chaquetas", base: 45 },
    { nombre: "Gorra Tesla Logo", categoria: "Accesorios", base: 200 },
    { nombre: "Mochila Tesla Urban", categoria: "Accesorios", base: 60 },
    { nombre: "Hoodie Cybertruck", categoria: "Sudaderas", base: 90 },
    { nombre: "Polo Tesla Classic", categoria: "Camisetas", base: 120 },
    { nombre: "Chaqueta Windbreaker", categoria: "Chaquetas", base: 35 },
    { nombre: "Camiseta Model S", categoria: "Camisetas", base: 180 },
    { nombre: "Bufanda Tesla Winter", categoria: "Accesorios", base: 70 },
  ];

  return productos.map((p, i) => {
    const stock = Math.floor(p.base + Math.random() * 50 - 25);
    const reservada = Math.floor(Math.random() * 20);
    const ventaDiaria = Math.floor(5 + Math.random() * 15);
    const costo = 20 + Math.random() * 60;
    const precio = costo * (1.5 + Math.random() * 0.8);

    return {
      sku: `TSL-${(1000 + i).toString()}`,
      nombre: p.nombre,
      categoria: p.categoria,
      cantidadDisponible: stock,
      cantidadReservada: reservada,
      puntoReorden: Math.floor(p.base * 0.3),
      stockSeguridad: Math.floor(p.base * 0.15),
      diasCobertura: parseFloat((stock / ventaDiaria).toFixed(1)),
      rotacion: parseFloat((ventaDiaria * 30 / stock).toFixed(2)),
      costoUnitario: parseFloat(costo.toFixed(2)),
      precioVenta: parseFloat(precio.toFixed(2)),
      margen: parseFloat(((precio - costo) / precio * 100).toFixed(1)),
    };
  });
};

export const generateMockSalesData = (): SalesData[] => {
  const categorias = ["Camisetas", "Sudaderas", "Chaquetas", "Accesorios"];
  const data: SalesData[] = [];
  
  // Últimos 30 días
  for (let i = 30; i >= 0; i--) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - i);
    
    categorias.forEach(cat => {
      const baseVentas = cat === "Camisetas" ? 45 : 
                        cat === "Sudaderas" ? 30 :
                        cat === "Chaquetas" ? 20 : 35;
      
      data.push({
        fecha: fecha.toISOString().split('T')[0],
        ventas: Math.floor(baseVentas + Math.random() * 20 - 10),
        revenue: parseFloat((baseVentas * 35 + Math.random() * 500).toFixed(2)),
        categoria: cat,
      });
    });
  }
  
  return data;
};

export const generateMockForecastData = (): ForecastData[] => {
  const productos = generateMockInventoryData().slice(0, 5);
  const forecast: ForecastData[] = [];
  
  productos.forEach(p => {
    const baseDemand = 10 + Math.random() * 20;
    
    for (let day = 1; day <= 30; day++) {
      const trend = day * 0.1; // Tendencia creciente
      const seasonality = Math.sin(day / 7 * Math.PI) * 3; // Patrón semanal
      const noise = Math.random() * 4 - 2;
      
      const predicted = baseDemand + trend + seasonality + noise;
      
      forecast.push({
        sku: p.sku,
        producto: p.nombre,
        prediccionDia: day,
        demandaPredicha: parseFloat(predicted.toFixed(1)),
        confianzaLower: parseFloat((predicted * 0.8).toFixed(1)),
        confianzaUpper: parseFloat((predicted * 1.2).toFixed(1)),
      });
    }
  });
  
  return forecast;
};

export const generateMockKPIs = (): KPI[] => {
  return [
    {
      label: "Cobertura Promedio",
      value: "18.5 días",
      change: "+2.3 días vs. mes anterior",
      changeType: "positive",
      icon: "Calendar",
    },
    {
      label: "Fill Rate",
      value: "94.2%",
      change: "-1.2% vs. mes anterior",
      changeType: "negative",
      icon: "TrendingUp",
    },
    {
      label: "Rotación Inventario",
      value: "6.8x",
      change: "+0.5x vs. mes anterior",
      changeType: "positive",
      icon: "RefreshCw",
    },
    {
      label: "Margen Bruto",
      value: "48.3%",
      change: "+2.1% vs. mes anterior",
      changeType: "positive",
      icon: "DollarSign",
    },
    {
      label: "Productos Críticos",
      value: "12",
      change: "Cobertura < 10 días",
      changeType: "negative",
      icon: "AlertTriangle",
    },
    {
      label: "MAPE Forecast",
      value: "8.4%",
      change: "-1.1% vs. modelo anterior",
      changeType: "positive",
      icon: "Target",
    },
  ];
};