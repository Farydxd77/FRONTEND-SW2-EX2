import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlRequest } from '@/api/inventoryApi';
import { OrdenCompra, ResultadoMRP } from '../interface/orden-compra.interface';
import { toast } from 'sonner';

// Query para obtener órdenes de compra
const ORDENES_COMPRA_QUERY = `
query OrdenesCompra($estado: String) {
  ordenesCompra(estado: $estado) {
    id
    numeroOc
    sku
    cantidadSugerida
    estado
    creadoPor
    creadoEn
  }
}
`;

// Query para ejecutar MRP
const EJECUTAR_MRP_QUERY = `
{
  ejecutarMRP {
    ordenesGeneradas
    mensaje
    ordenes {
      id
      numeroOc
      sku
      cantidadSugerida
      estado
      creadoPor
      creadoEn
    }
  }
}
`;

// Mutation para aprobar una orden
const APROBAR_ORDEN_MUTATION = `
mutation AprobarOrden($id: ID!) {
  aprobarOrden(id: $id) {
    id
    numeroOc
    sku
    cantidadSugerida
    estado
    creadoPor
    creadoEn
  }
}
`;

// Hook para obtener órdenes de compra
export const useOrdenesCompra = (estado?: string) => {
    return useQuery({
        queryKey: ['ordenes-compra', estado],
        queryFn: async () => {
            const data = await graphqlRequest<{ ordenesCompra: OrdenCompra[] }>(
                ORDENES_COMPRA_QUERY,
                { estado }
            );
            return data.ordenesCompra;
        },
    });
};

// Hook para ejecutar el motor MRP
export const useEjecutarMRP = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const data = await graphqlRequest<{ ejecutarMRP: ResultadoMRP }>(
                EJECUTAR_MRP_QUERY
            );
            return data.ejecutarMRP;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['ordenes-compra'] });
            queryClient.invalidateQueries({ queryKey: ['inventario-bajo-stock'] });
            
            if (data.ordenesGeneradas > 0) {
                toast.success(`MRP ejecutado: ${data.ordenesGeneradas} órdenes generadas`);
            } else {
                toast.info('MRP ejecutado: No se generaron órdenes de compra');
            }
        },
        onError: (error: Error) => {
            toast.error(`Error al ejecutar MRP: ${error.message}`);
        },
    });
};

// Hook para aprobar una orden de compra
export const useAprobarOrden = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const data = await graphqlRequest<{ aprobarOrden: OrdenCompra }>(
                APROBAR_ORDEN_MUTATION,
                { id }
            );
            return data.aprobarOrden;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ordenes-compra'] });
            toast.success('Orden de compra aprobada');
        },
        onError: (error: Error) => {
            toast.error(`Error al aprobar orden: ${error.message}`);
        },
    });
};