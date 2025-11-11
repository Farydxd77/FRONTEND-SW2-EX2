export interface OrdenCompra {
    id: string;
    numeroOc: string;
    sku: string;
    cantidadSugerida: number;
    estado: string;
    creadoPor: string;
    creadoEn: string;
}

export interface ResultadoMRP {
    ordenesGeneradas: number;
    mensaje: string;
    ordenes: OrdenCompra[];
}