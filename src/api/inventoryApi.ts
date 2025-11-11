import axios from 'axios';

// Cliente GraphQL para el microservicio de Inventory + MRP
const inventoryApi = axios.create({
    baseURL: import.meta.env.VITE_INVENTORY_API_URL || 'http://localhost:8080/graphql',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Interceptor para requests
inventoryApi.interceptors.request.use(
    (config) => {
        console.log('📦 Llamando a Inventory API:', config.data?.query?.substring(0, 100));
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para responses
inventoryApi.interceptors.response.use(
    (response) => {
        // GraphQL siempre retorna 200, pero puede tener errores en response.data.errors
        if (response.data.errors) {
            console.error('❌ GraphQL Errors:', response.data.errors);
            throw new Error(response.data.errors[0]?.message || 'Error en GraphQL');
        }
        console.log('✅ Respuesta de Inventory API');
        return response;
    },
    (error) => {
        console.error('❌ Error en Inventory API:', error.response?.data || error.message);
        
        if (error.response) {
            throw new Error(error.response.data?.message || 'Error en el servidor');
        } else if (error.request) {
            throw new Error('No se pudo conectar con el servidor de inventario');
        } else {
            throw new Error('Error al configurar la petición');
        }
    }
);

// Helper para ejecutar queries GraphQL
export const graphqlRequest = async <T = any>(query: string, variables?: Record<string, any>): Promise<T> => {
    const response = await inventoryApi.post('', { query, variables });
    return response.data.data;
};

export { inventoryApi };