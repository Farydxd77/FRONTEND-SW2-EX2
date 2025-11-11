import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlRequest } from '@/api/inventoryApi';
import { Inventario } from '../interface/inventario.interface';
import { toast } from 'sonner';

const INVENTARIO_QUERY = `
query Inventario($almacen: String) {
  inventario(almacen: $almacen) {
    id
    sku
    almacen
    cantidadDisponible
    cantidadReservada
    puntoReorden
    stockSeguridad
    cantidadTotal
  }
}
`;

const INVENTARIO_BAJO_STOCK_QUERY = `
{
  inventarioBajoStock {
    id
    sku
    almacen
    cantidadDisponible
    cantidadReservada
    puntoReorden
    stockSeguridad
  }
}
`;

const AJUSTAR_STOCK_MUTATION = `
mutation AjustarStock($sku: String!, $almacen: String!, $cantidad: Int!) {
  ajustarStock(sku: $sku, almacen: $almacen, cantidad: $cantidad) {
    id
    sku
    almacen
    cantidadDisponible
    cantidadTotal
  }
}
`;

const RESERVAR_STOCK_MUTATION = `
mutation ReservarStock($sku: String!, $almacen: String!, $cantidad: Int!) {
  reservarStock(sku: $sku, almacen: $almacen, cantidad: $cantidad) {
    id
    sku
    almacen
    cantidadDisponible
    cantidadReservada
    cantidadTotal
  }
}
`;

export const useInventario = (almacen?: string) => {
    return useQuery({
        queryKey: ['inventario', almacen],
        queryFn: async () => {
            const data = await graphqlRequest<{ inventario: Inventario[] }>(
                INVENTARIO_QUERY,
                { almacen }
            );
            return data.inventario;
        },
    });
};

export const useInventarioBajoStock = () => {
    return useQuery({
        queryKey: ['inventario-bajo-stock'],
        queryFn: async () => {
            const data = await graphqlRequest<{ inventarioBajoStock: Inventario[] }>(
                INVENTARIO_BAJO_STOCK_QUERY
            );
            return data.inventarioBajoStock;
        },
        refetchInterval: 1000 * 60, // Refrescar cada minuto
    });
};

export const useAjustarStock = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (variables: { sku: string; almacen: string; cantidad: number }) => {
            const data = await graphqlRequest<{ ajustarStock: Inventario }>(
                AJUSTAR_STOCK_MUTATION,
                variables
            );
            return data.ajustarStock;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventario'] });
            toast.success('Stock ajustado correctamente');
        },
        onError: (error: Error) => {
            toast.error(`Error al ajustar stock: ${error.message}`);
        },
    });
};

export const useReservarStock = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (variables: { sku: string; almacen: string; cantidad: number }) => {
            const data = await graphqlRequest<{ reservarStock: Inventario }>(
                RESERVAR_STOCK_MUTATION,
                variables
            );
            return data.reservarStock;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventario'] });
            toast.success('Stock reservado correctamente');
        },
        onError: (error: Error) => {
            toast.error(`Error al reservar stock: ${error.message}`);
        },
    });
};