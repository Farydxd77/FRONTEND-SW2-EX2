// src/api/aiApi.ts
import axios from 'axios';

const aiApi = axios.create({
    baseURL: import.meta.env.VITE_AI_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 segundos (la IA puede tardar)
});

// Interceptor para request (si necesitas agregar algo antes de enviar)
aiApi.interceptors.request.use(
    (config) => {
        // Aquí puedes agregar headers adicionales si lo necesitas
        // Por ejemplo, un API key del frontend si quieres
        console.log('🤖 Llamando a IA API:', config.url);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para response (manejo de errores)
aiApi.interceptors.response.use(
    (response) => {
        console.log('✅ Respuesta de IA:', response.data);
        return response;
    },
    (error) => {
        // Manejo de errores
        console.error('❌ Error en IA API:', error.response?.data || error.message);
        
        if (error.response) {
            // El servidor respondió con un código de error
            const errorMessage = error.response.data?.error || 'Error en el servidor de IA';
            throw new Error(errorMessage);
        } else if (error.request) {
            // La petición se hizo pero no hubo respuesta
            throw new Error('No se pudo conectar con el servidor de IA');
        } else {
            // Algo pasó al configurar la petición
            throw new Error('Error al configurar la petición');
        }
    }
);

export { aiApi };