// src/admin/components/AiConnectionTest.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { aiService } from '@/services/aiservice';

export const AiConnectionTest = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const testConnection = async () => {
    setStatus('loading');
    try {
      const response = await aiService.testConnection();
      setMessage(response.message);
      setStatus('success');
    } catch (error: any) {
      setMessage(error.message);
      setStatus('error');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🤖 Test de Conexión - IA Service</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testConnection} disabled={status === 'loading'}>
          {status === 'loading' ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Probando...
            </>
          ) : (
            'Probar Conexión'
          )}
        </Button>

        {status === 'success' && (
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800">{message}</span>
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{message}</span>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p><strong>Backend URL:</strong> {import.meta.env.VITE_AI_API_URL || 'http://localhost:8000/api'}</p>
          <p className="mt-2 text-xs text-gray-500">
            Asegúrate de que el backend Python esté corriendo en el puerto 8000
          </p>
        </div>
      </CardContent>
    </Card>
  );
};