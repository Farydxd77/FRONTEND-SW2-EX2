import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlRequest } from '@/api/inventoryApi';
import { Lote } from '../interface/lote.interface';
import { toast } from 'sonner';

// Query para obtener todos los lotes
const LOTES_QUERY = `
query Lotes($almacen: String) {
  lotes(almacen: $almacen) {
    id
    sku
    numeroLote
    cantidad
    fechaVencimiento
    almacen
    diasParaVencer
    estaVencido
  }
}
`;

// Query para lotes próximos a vencer
const LOTES_PROXIMOS_VENCER_QUERY = `
query LotesProximosVencer($dias: Int!) {
  lotesProximosVencer(dias: $dias) {
    id
    sku
    numeroLote
    cantidad
    fechaVencimiento
    almacen
    diasParaVencer
    estaVencido
  }
}
`;

// Mutation para registrar un nuevo lote
const REGISTRAR_LOTE_MUTATION = `
mutation RegistrarLote($input: LoteInput!) {
  registrarLote(input: $input) {
    id
    sku
    numeroLote
    cantidad
    fechaVencimiento
    almacen
    diasParaVencer
    estaVencido
  }
}
`;

// Hook para obtener todos los lotes
export const useLotes = (almacen?: string) => {
    return useQuery({
        queryKey: ['lotes', almacen],
        queryFn: async () => {
            const data = await graphqlRequest<{ lotes: Lote[] }>(
                LOTES_QUERY,
                { almacen }
            );
            return data.lotes;
        },
    });
};

// Hook para obtener lotes próximos a vencer
export const useLotesProximosVencer = (dias: number = 30) => {
    return useQuery({
        queryKey: ['lotes-proximos-vencer', dias],
        queryFn: async () => {
            const data = await graphqlRequest<{ lotesProximosVencer: Lote[] }>(
                LOTES_PROXIMOS_VENCER_QUERY,
                { dias }
            );
            return data.lotesProximosVencer;
        },
        refetchInterval: 1000 * 60 * 5, // Refrescar cada 5 minutos
    });
};

// Hook para registrar un nuevo lote
export const useRegistrarLote = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: {
            sku: string;
            numeroLote: string;
            cantidad: number;
            fechaVencimiento: string;
            almacen: string;
        }) => {
            const data = await graphqlRequest<{ registrarLote: Lote }>(
                REGISTRAR_LOTE_MUTATION,
                { input }
            );
            return data.registrarLote;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lotes'] });
            queryClient.invalidateQueries({ queryKey: ['lotes-proximos-vencer'] });
            toast.success('Lote registrado correctamente');
        },
        onError: (error: Error) => {
            toast.error(`Error al registrar lote: ${error.message}`);
        },
    });
};