// src/admin/components/AiPredictionGenerator.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, TrendingUp, Brain, Zap } from 'lucide-react';
import { aiService } from '@/services/aiservice';
import { 
  generateMockInventoryData, 
  generateMockSalesData 
} from '@/mock/inventory-analytics.mock';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface PredictionResult {
  prediction_type: string;
  title: string;
  chart_type: 'bar' | 'line';
  data: Array<{ label: string; value: number; type?: string }>;
  metrics: any;
  insight: string;
  confidence: string;
  model_accuracy?: string;
  top_products?: any[];
  predictions?: any[];
}

export const AiPredictionGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [predictionType, setPredictionType] = useState<'auto' | 'ventas' | 'ordenes' | 'productos'>('auto');
  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const examplePrompts = {
    auto: [
      "¿Qué producto se venderá más el próximo mes?",
      "Predice las ventas de la próxima semana",
      "¿Cuántas órdenes habrá la próxima semana?",
    ],
    ventas: [
      "Predice las ventas del próximo mes",
      "¿Cómo serán las ventas la próxima semana?",
      "Proyección de ventas para los próximos 30 días",
    ],
    ordenes: [
      "¿Cuántas órdenes habrá la próxima semana?",
      "Predice órdenes del próximo mes",
      "Proyección de pedidos semanales",
    ],
    productos: [
      "¿Qué producto se venderá más?",
      "Top productos para el próximo mes",
      "Productos con mayor potencial de venta",
    ]
  };

  const handlePredict = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setPredictionResult(null);

    try {
      // Generar datos mock
      const productos = generateMockInventoryData();
      const ventas = generateMockSalesData();
      
      // Generar órdenes mock
      const ordenes = Array.from({ length: 30 }, (_, i) => ({
        id: `ORD-${1000 + i}`,
        fecha: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        monto: parseFloat((Math.random() * 200 + 20).toFixed(2)),
        estado: Math.random() > 0.3 ? 'Completada' : 'Pendiente',
        items: Math.floor(Math.random() * 5) + 1
      }));

      // Llamar al servicio de predicción
      const result = await aiService.predict(
        prompt,
        predictionType,
        ventas,
        productos,
        ordenes
      );

      setPredictionResult(result);
    } catch (err: any) {
      setError(err.message || 'Error al generar predicción');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handlePredict();
    }
  };

  const renderChart = () => {
    if (!predictionResult) return null;

    const { chart_type, data } = predictionResult;

    if (chart_type === 'line') {
      // Para ventas, separar datos históricos de predichos
      const historicalData = data.filter(d => d.type === 'historical');
      const predictedData = data.filter(d => d.type === 'predicted');
      const allData = [...historicalData, ...predictedData];

      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={allData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Legend />
            <ReferenceLine 
              x={historicalData[historicalData.length - 1]?.label} 
              stroke="#666" 
              strokeDasharray="3 3" 
              label="Hoy"
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Ventas"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8b5cf6" name={predictionResult.prediction_type === 'ordenes' ? 'Órdenes' : 'Score'} />
          </BarChart>
        </ResponsiveContainer>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Predicciones con Machine Learning
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Prediction Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              Tipo de Predicción
            </Label>
            <RadioGroup value={predictionType} onValueChange={(value: any) => setPredictionType(value)}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-purple-50 cursor-pointer">
                  <RadioGroupItem value="auto" id="auto" />
                  <Label htmlFor="auto" className="cursor-pointer flex-1">
                    🤖 Auto
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-purple-50 cursor-pointer">
                  <RadioGroupItem value="ventas" id="ventas" />
                  <Label htmlFor="ventas" className="cursor-pointer flex-1">
                    📈 Ventas
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-purple-50 cursor-pointer">
                  <RadioGroupItem value="ordenes" id="ordenes" />
                  <Label htmlFor="ordenes" className="cursor-pointer flex-1">
                    📦 Órdenes
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-purple-50 cursor-pointer">
                  <RadioGroupItem value="productos" id="productos" />
                  <Label htmlFor="productos" className="cursor-pointer flex-1">
                    🎯 Productos
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Prompt Input */}
          <div className="space-y-2">
            <Label>¿Qué quieres predecir?</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Ej: ¿Qué producto se venderá más el próximo mes?"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="flex-1"
              />
              <Button 
                onClick={handlePredict} 
                disabled={loading || !prompt.trim()}
                className="min-w-[140px] bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Prediciendo...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Predecir
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Example Prompts */}
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Ejemplos de {predictionType}:</p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts[predictionType].map((example, index) => (
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

      {/* Prediction Results */}
      {predictionResult && (
        <Card className="border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center justify-between">
              <span>{predictionResult.title}</span>
              <div className="flex items-center gap-2 text-sm font-normal">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                  Confianza: {predictionResult.confidence}
                </span>
                {predictionResult.model_accuracy && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {predictionResult.model_accuracy}
                  </span>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Chart */}
            <div className="w-full">
              {renderChart()}
            </div>

            {/* Metrics */}
            {predictionResult.metrics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(predictionResult.metrics).map(([key, value]) => (
                  <div key={key} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-600 font-medium mb-1">
                      {key.replace(/_/g, ' ').toUpperCase()}
                    </p>
                    <p className="text-2xl font-bold text-purple-900">{value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Top Products Table */}
            {predictionResult.top_products && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Top Productos Predichos</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-purple-100">
                        <th className="p-3 text-left">Producto</th>
                        <th className="p-3 text-center">Score</th>
                        <th className="p-3 text-center">Rotación</th>
                        <th className="p-3 text-center">Margen</th>
                        <th className="p-3 text-center">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {predictionResult.top_products.map((p, i) => (
                        <tr key={i} className="border-b hover:bg-purple-50">
                          <td className="p-3">{p.producto}</td>
                          <td className="p-3 text-center font-bold text-purple-600">{p.score_venta}</td>
                          <td className="p-3 text-center">{p.rotacion}x</td>
                          <td className="p-3 text-center">{p.margen}</td>
                          <td className="p-3 text-center">{p.stock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Insight */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-purple-900 mb-1">💡 Análisis Predictivo</p>
                  <p className="text-sm text-purple-800">{predictionResult.insight}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      {!predictionResult && !loading && (
        <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-600" />
                <h3 className="font-semibold text-purple-900 text-lg">Machine Learning en Acción</h3>
              </div>
              <ul className="space-y-2 text-sm text-purple-800">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">📊</span>
                  <span><strong>Regresión Lineal:</strong> Analiza tendencias históricas para predecir el futuro</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">🎯</span>
                  <span><strong>Scoring Inteligente:</strong> Evalúa productos basándose en múltiples factores</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">📈</span>
                  <span><strong>Proyecciones Temporales:</strong> Predice ventas y órdenes futuras</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">🔮</span>
                  <span><strong>Basado en Datos Reales:</strong> Usa tus datos históricos para predicciones precisas</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};