// src/admin/components/AiReportGenerator.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, FileText, Download, Sparkles } from 'lucide-react';
import { aiService } from '@/services/aiservice';
import { 
  generateMockInventoryData, 
  generateMockSalesData 
} from '@/mock/inventory-analytics.mock';

export const AiReportGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [dataSource, setDataSource] = useState<'productos' | 'ordenes' | 'ventas' | 'all'>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Ejemplos de prompts según la fuente de datos
  const examplePrompts = {
    productos: [
      "Listame productos con stock menor a 10",
      "Productos con margen superior al 50%",
      "Top 5 productos con mejor rotación",
    ],
    ordenes: [
      "Órdenes con monto mayor a $50",
      "Órdenes pendientes de esta semana",
      "Top 10 órdenes más grandes",
    ],
    ventas: [
      "Ventas del último mes por categoría",
      "Productos más vendidos",
      "Análisis de ventas por periodo",
    ],
    all: [
      "Análisis completo de inventario y ventas",
      "Reporte ejecutivo del negocio",
      "Estado general de productos y órdenes",
    ]
  };

  const handleGenerateReport = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Obtener datos mock según la fuente seleccionada
      let productos: any[] = [];
      let ordenes: any[] = [];
      let ventas: any[] = [];

      if (dataSource === 'productos' || dataSource === 'all') {
        productos = generateMockInventoryData();
      }

      if (dataSource === 'ordenes' || dataSource === 'all') {
        // Generar órdenes mock (simplificado)
        ordenes = Array.from({ length: 15 }, (_, i) => ({
          id: `ORD-${1000 + i}`,
          fecha: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          monto: parseFloat((Math.random() * 200 + 20).toFixed(2)),
          estado: Math.random() > 0.5 ? 'Completada' : 'Pendiente',
          items: Math.floor(Math.random() * 5) + 1
        }));
      }

      if (dataSource === 'ventas' || dataSource === 'all') {
        ventas = generateMockSalesData();
      }

      // Llamar al servicio
      const blob = await aiService.generateReport(
        prompt,
        dataSource,
        productos,
        ordenes,
        ventas
      );

      // Descargar el PDF
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al generar el reporte');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerateReport();
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-500" />
            Generador de Reportes PDF con IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Data Source Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Fuente de Datos</Label>
            <RadioGroup value={dataSource} onValueChange={(value: any) => setDataSource(value)}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="productos" id="productos" />
                  <Label htmlFor="productos" className="cursor-pointer flex-1">
                    📦 Productos
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="ordenes" id="ordenes" />
                  <Label htmlFor="ordenes" className="cursor-pointer flex-1">
                    🛒 Órdenes
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="ventas" id="ventas" />
                  <Label htmlFor="ventas" className="cursor-pointer flex-1">
                    💰 Ventas
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="cursor-pointer flex-1">
                    🌐 Todos
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Prompt Input */}
          <div className="space-y-2">
            <Label>¿Qué reporte necesitas?</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Ej: Listame productos con stock menor a 10..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="flex-1"
              />
              <Button 
                onClick={handleGenerateReport} 
                disabled={loading || !prompt.trim()}
                className="min-w-[140px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Generar PDF
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Example Prompts */}
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Ejemplos para {dataSource}:</p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts[dataSource].map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setPrompt(example)}
                  disabled={loading}
                  className="text-xs"
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <Download className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-800 font-medium">
                ¡Reporte generado! El PDF se está descargando...
              </span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      {!loading && !success && (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-purple-900">¿Cómo funciona?</h3>
              </div>
              <ul className="space-y-2 text-sm text-purple-800">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">1.</span>
                  <span>Selecciona la fuente de datos (Productos, Órdenes, Ventas o Todos)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">2.</span>
                  <span>Escribe tu solicitud en lenguaje natural</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">3.</span>
                  <span>La IA filtra, analiza y estructura los datos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">4.</span>
                  <span>Se genera un PDF profesional con tablas, métricas y recomendaciones</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};