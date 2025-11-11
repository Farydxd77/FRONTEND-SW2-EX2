export interface Producto {
    sku: string;
    nombre: string;
    categoria: string | null;
    costoUnitario: number | null;
    precioVenta: number | null;
    diasLeadTime: number;
}