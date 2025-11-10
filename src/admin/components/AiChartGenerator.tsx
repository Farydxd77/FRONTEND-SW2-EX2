// src/admin/components/AiChartGenerator.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Send, Sparkles } from 'lucide-react';
import { aiService } from '@/services/aiservice';
import type { ChartData } from '@/services/aiservice';
import { 
  generateMockInventoryData, 
  generateMockSalesData 
} from '@/mock/inventory-analytics.mock';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const AiChartGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Ejemplos de prompts para ayudar al usuario
  const examplePrompts = [
    "Muéstrame los productos más vendidos este mes",
    "Gráfica de productos con bajo stock",
    "Top 5 productos por margen de ganancia",
    "Comparativa de ventas por categoría",
    "Productos que necesitan reorden urgente",
  ];

  const handleGenerateChart = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Obtener datos mock para enviar al backend
      const productos = generateMockInventoryData();
      const ventas = generateMockSalesData();

      // Llamar al servicio de IA
      const result = await aiService.generateChart(
        prompt,
        productos,
        undefined, // ordenes (opcional)
        ventas
      );

      setChartData(result);
    } catch (err: any) {
      setError(err.message || 'Error al generar la gráfica');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerateChart();
    }
  };

  const renderChart = () => {
    if (!chartData) return null;

   

    switch (chartData.chart_type) {
      case 'bar':
        return (
         <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
         <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
       <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData.data}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label
              >
                {chartData.data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
         <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return <p>Tipo de gráfica no soportado</p>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            Generador de Gráficas con IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Prompt Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Ej: Muéstrame los productos más vendidos este mes..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="flex-1"
            />
            <Button onClick={handleGenerateChart} disabled={loading || !prompt.trim()}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Generar
                </>
              )}
            </Button>
          </div>

          {/* Example Prompts */}
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Ejemplos de prompts:</p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((example, index) => (
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

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chart Display */}
      {chartData && (
        <Card>
          <CardHeader>
            <CardTitle>{chartData.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Chart */}
            <div className="w-full">{renderChart()}</div>

            {/* Insight */}
            {chartData.insight && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-1">💡 Análisis:</p>
                <p className="text-sm text-blue-800">{chartData.insight}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      {!chartData && !loading && (
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-blue-900">¿Cómo funciona?</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Escribe lo que necesitas visualizar en lenguaje natural</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>La IA analiza tus datos de inventario y ventas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Genera automáticamente la gráfica más apropiada</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Recibe insights y recomendaciones basadas en los datos</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};