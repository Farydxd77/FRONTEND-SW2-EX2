export interface Lote {
    id: string;
    sku: string;
    numeroLote: string;
    cantidad: number;
    fechaVencimiento: string;
    almacen: string;
    diasParaVencer: number;
    estaVencido: boolean;
}