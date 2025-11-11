import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlRequest } from '@/api/inventoryApi';
import { Producto } from '../interface/producto.interface';
import { toast } from 'sonner';

// Queries
const PRODUCTOS_QUERY = `
{
  productos {
    sku
    nombre
    categoria
    costoUnitario
    precioVenta
    diasLeadTime
  }
}
`;

const PRODUCTO_BY_SKU_QUERY = `
query ProductoBySku($sku: String!) {
  productoPorSku(sku: $sku) {
    sku
    nombre
    categoria
    costoUnitario
    precioVenta
    diasLeadTime
  }
}
`;

// Mutations
const CREAR_PRODUCTO_MUTATION = `
mutation CrearProducto($sku: String!, $input: ProductoInput!) {
  crearProducto(sku: $sku, input: $input) {
    sku
    nombre
    categoria
    costoUnitario
    precioVenta
    diasLeadTime
  }
}
`;

const ACTUALIZAR_PRODUCTO_MUTATION = `
mutation ActualizarProducto($sku: String!, $input: ProductoInput!) {
  actualizarProducto(sku: $sku, input: $input) {
    sku
    nombre
    categoria
    costoUnitario
    precioVenta
    diasLeadTime
  }
}
`;

const ELIMINAR_PRODUCTO_MUTATION = `
mutation EliminarProducto($sku: String!) {
  eliminarProducto(sku: $sku)
}
`;

// Interfaces
export interface ProductoInput {
    nombre: string;
    categoria?: string | null;
    costoUnitario?: number | null;
    precioVenta?: number | null;
    diasLeadTime: number;
}

// Hooks
export const useProductos = () => {
    return useQuery({
        queryKey: ['productos'],
        queryFn: async () => {
            const data = await graphqlRequest<{ productos: Producto[] }>(PRODUCTOS_QUERY);
            return data.productos;
        },
        staleTime: 1000 * 60 * 5, // 5 minutos
    });
};

export const useProductoBySku = (sku: string) => {
    return useQuery({
        queryKey: ['producto', sku],
        queryFn: async () => {
            const data = await graphqlRequest<{ productoPorSku: Producto }>(
                PRODUCTO_BY_SKU_QUERY,
                { sku }
            );
            return data.productoPorSku;
        },
        enabled: !!sku,
    });
};

export const useCrearProducto = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ sku, input }: { sku: string; input: ProductoInput }) => {
            const data = await graphqlRequest<{ crearProducto: Producto }>(
                CREAR_PRODUCTO_MUTATION,
                { sku, input }
            );
            return data.crearProducto;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productos'] });
            toast.success('Producto creado exitosamente');
        },
        onError: (error: Error) => {
            toast.error(`Error al crear producto: ${error.message}`);
        },
    });
};

export const useActualizarProducto = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ sku, input }: { sku: string; input: ProductoInput }) => {
            const data = await graphqlRequest<{ actualizarProducto: Producto }>(
                ACTUALIZAR_PRODUCTO_MUTATION,
                { sku, input }
            );
            return data.actualizarProducto;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['productos'] });
            queryClient.invalidateQueries({ queryKey: ['producto', variables.sku] });
            toast.success('Producto actualizado exitosamente');
        },
        onError: (error: Error) => {
            toast.error(`Error al actualizar producto: ${error.message}`);
        },
    });
};

export const useEliminarProducto = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (sku: string) => {
            const data = await graphqlRequest<{ eliminarProducto: boolean }>(
                ELIMINAR_PRODUCTO_MUTATION,
                { sku }
            );
            return data.eliminarProducto;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productos'] });
            toast.success('Producto eliminado exitosamente');
        },
        onError: (error: Error) => {
            toast.error(`Error al eliminar producto: ${error.message}`);
        },
    });
};