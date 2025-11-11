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

// Generador de datos ficticios - AUMENTADO
export const generateMockInventoryData = (): InventoryProduct[] => {
  const productos = [
    // Camisetas (12 productos)
    { nombre: "Camiseta Tesla Negra", categoria: "Camisetas", base: 150 },
    { nombre: "Camiseta Tesla Blanca", categoria: "Camisetas", base: 160 },
    { nombre: "Camiseta Model S", categoria: "Camisetas", base: 180 },
    { nombre: "Camiseta Model 3", categoria: "Camisetas", base: 175 },
    { nombre: "Camiseta Model X", categoria: "Camisetas", base: 140 },
    { nombre: "Camiseta Model Y", categoria: "Camisetas", base: 165 },
    { nombre: "Camiseta Cybertruck", categoria: "Camisetas", base: 200 },
    { nombre: "Camiseta Roadster", categoria: "Camisetas", base: 130 },
    { nombre: "Polo Tesla Classic", categoria: "Camisetas", base: 120 },
    { nombre: "Polo Tesla Premium", categoria: "Camisetas", base: 110 },
    { nombre: "Camiseta Tesla Logo Rojo", categoria: "Camisetas", base: 155 },
    { nombre: "Camiseta Tesla Vintage", categoria: "Camisetas", base: 145 },
    
    // Sudaderas (10 productos)
    { nombre: "Sudadera Tesla Blanca", categoria: "Sudaderas", base: 80 },
    { nombre: "Sudadera Tesla Negra", categoria: "Sudaderas", base: 85 },
    { nombre: "Hoodie Cybertruck", categoria: "Sudaderas", base: 90 },
    { nombre: "Hoodie Model S", categoria: "Sudaderas", base: 88 },
    { nombre: "Sudadera Tesla Logo Grande", categoria: "Sudaderas", base: 95 },
    { nombre: "Sudadera Tesla Tech", categoria: "Sudaderas", base: 78 },
    { nombre: "Hoodie Tesla Racing", categoria: "Sudaderas", base: 92 },
    { nombre: "Sudadera Model 3 Performance", categoria: "Sudaderas", base: 82 },
    { nombre: "Hoodie Tesla Plaid", categoria: "Sudaderas", base: 100 },
    { nombre: "Sudadera Tesla Classic", categoria: "Sudaderas", base: 75 },
    
    // Chaquetas (8 productos)
    { nombre: "Chaqueta Tesla Gris", categoria: "Chaquetas", base: 45 },
    { nombre: "Chaqueta Windbreaker", categoria: "Chaquetas", base: 35 },
    { nombre: "Chaqueta Tesla Impermeable", categoria: "Chaquetas", base: 50 },
    { nombre: "Chaqueta Bomber Tesla", categoria: "Chaquetas", base: 40 },
    { nombre: "Chaqueta Tesla Winter", categoria: "Chaquetas", base: 38 },
    { nombre: "Chaqueta Tesla Softshell", categoria: "Chaquetas", base: 48 },
    { nombre: "Chaqueta Tesla Puffer", categoria: "Chaquetas", base: 42 },
    { nombre: "Chaqueta Tesla Racing Edition", categoria: "Chaquetas", base: 55 },
    
    // Accesorios (15 productos)
    { nombre: "Gorra Tesla Logo", categoria: "Accesorios", base: 200 },
    { nombre: "Gorra Tesla Snapback", categoria: "Accesorios", base: 190 },
    { nombre: "Gorra Cybertruck", categoria: "Accesorios", base: 210 },
    { nombre: "Mochila Tesla Urban", categoria: "Accesorios", base: 60 },
    { nombre: "Mochila Tesla Tech", categoria: "Accesorios", base: 65 },
    { nombre: "Bufanda Tesla Winter", categoria: "Accesorios", base: 70 },
    { nombre: "Guantes Tesla", categoria: "Accesorios", base: 75 },
    { nombre: "Calcetines Tesla Pack 3", categoria: "Accesorios", base: 150 },
    { nombre: "Termo Tesla 500ml", categoria: "Accesorios", base: 80 },
    { nombre: "Taza Tesla Cerámica", categoria: "Accesorios", base: 120 },
    { nombre: "Llavero Tesla Model S", categoria: "Accesorios", base: 250 },
    { nombre: "Paraguas Tesla", categoria: "Accesorios", base: 55 },
    { nombre: "Bolso Tesla Messenger", categoria: "Accesorios", base: 45 },
    { nombre: "Cartera Tesla Leather", categoria: "Accesorios", base: 50 },
    { nombre: "Gafas de Sol Tesla", categoria: "Accesorios", base: 40 },
    
    // Electrónicos (8 productos)
    { nombre: "Cargador Portátil Tesla 10000mAh", categoria: "Electrónicos", base: 35 },
    { nombre: "Cable USB-C Tesla", categoria: "Electrónicos", base: 100 },
    { nombre: "Mouse Inalámbrico Tesla", categoria: "Electrónicos", base: 42 },
    { nombre: "Teclado Tesla Mecánico", categoria: "Electrónicos", base: 28 },
    { nombre: "Auriculares Tesla Wireless", categoria: "Electrónicos", base: 30 },
    { nombre: "Webcam Tesla HD", categoria: "Electrónicos", base: 25 },
    { nombre: "Hub USB Tesla", categoria: "Electrónicos", base: 55 },
    { nombre: "Lámpara LED Tesla", categoria: "Electrónicos", base: 38 },
    
    // Hogar (7 productos)
    { nombre: "Manta Tesla Polar", categoria: "Hogar", base: 32 },
    { nombre: "Almohada Tesla Memory Foam", categoria: "Hogar", base: 28 },
    { nombre: "Alfombrilla Tesla Gaming", categoria: "Hogar", base: 70 },
    { nombre: "Poster Tesla Model S", categoria: "Hogar", base: 150 },
    { nombre: "Cuadro Tesla Factory", categoria: "Hogar", base: 45 },
    { nombre: "Reloj de Pared Tesla", categoria: "Hogar", base: 35 },
    { nombre: "Tapete Tesla Logo", categoria: "Hogar", base: 50 },
  ];

  return productos.map((p, i) => {
    const stock = Math.floor(p.base + Math.random() * 50 - 25);
    const reservada = Math.floor(Math.random() * 20);
    const ventaDiaria = Math.floor(5 + Math.random() * 15);
    const costo = 20 + Math.random() * 80; // Aumentado el rango
    const precio = costo * (1.5 + Math.random() * 0.8);

    return {
      sku: `TSL-${(1000 + i).toString().padStart(4, '0')}`,
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
  const categorias = ["Camisetas", "Sudaderas", "Chaquetas", "Accesorios", "Electrónicos", "Hogar"];
  const data: SalesData[] = [];
  
  // Últimos 90 días (3 meses)
  for (let i = 90; i >= 0; i--) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - i);
    
    categorias.forEach(cat => {
      const baseVentas = cat === "Camisetas" ? 45 : 
                        cat === "Sudaderas" ? 30 :
                        cat === "Chaquetas" ? 20 : 
                        cat === "Accesorios" ? 35 :
                        cat === "Electrónicos" ? 25 : 28;
      
      // Agregar variación por día de semana
      const dayOfWeek = fecha.getDay();
      const weekendBoost = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.3 : 1.0;
      
      data.push({
        fecha: fecha.toISOString().split('T')[0],
        ventas: Math.floor((baseVentas + Math.random() * 20 - 10) * weekendBoost),
        revenue: parseFloat(((baseVentas * 35 + Math.random() * 500) * weekendBoost).toFixed(2)),
        categoria: cat,
      });
    });
  }
  
  return data;
};

export const generateMockForecastData = (): ForecastData[] => {
  const productos = generateMockInventoryData().slice(0, 10); // Top 10 productos
  const forecast: ForecastData[] = [];
  
  productos.forEach(p => {
    const baseDemand = 10 + Math.random() * 20;
    
    for (let day = 1; day <= 60; day++) { // Predicción a 60 días
      const trend = day * 0.15; // Tendencia creciente más pronunciada
      const seasonality = Math.sin(day / 7 * Math.PI) * 4; // Patrón semanal
      const monthlyPattern = Math.cos(day / 30 * Math.PI) * 2; // Patrón mensual
      const noise = Math.random() * 5 - 2.5;
      
      const predicted = Math.max(0, baseDemand + trend + seasonality + monthlyPattern + noise);
      
      forecast.push({
        sku: p.sku,
        producto: p.nombre,
        prediccionDia: day,
        demandaPredicha: parseFloat(predicted.toFixed(1)),
        confianzaLower: parseFloat((predicted * 0.75).toFixed(1)),
        confianzaUpper: parseFloat((predicted * 1.25).toFixed(1)),
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
    {
      label: "Stock Total",
      value: "4,235 unidades",
      change: "+340 unidades vs. mes anterior",
      changeType: "positive",
      icon: "Package",
    },
    {
      label: "Valor Inventario",
      value: "$187,420",
      change: "+$12,500 vs. mes anterior",
      changeType: "positive",
      icon: "DollarSign",
    },
    {
      label: "Productos Agotados",
      value: "3",
      change: "Stock = 0",
      changeType: "negative",
      icon: "XCircle",
    },
    {
      label: "Tasa Devolución",
      value: "2.8%",
      change: "-0.4% vs. mes anterior",
      changeType: "positive",
      icon: "RotateCcw",
    },
  ];
};