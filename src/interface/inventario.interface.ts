export interface Inventario {
    id: string;
    sku: string;
    almacen: string;
    cantidadDisponible: number;
    cantidadReservada: number;
    puntoReorden: number;
    stockSeguridad: number;
    actualizadoEn?: string;
    cantidadTotal: number;
}