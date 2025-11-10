// src/services/aiservice.ts

import { aiApi } from "@/api/PYaiApi";


export interface ChartData {
  chart_type: 'bar' | 'line' | 'pie' | 'area';
  title: string;
  data: Array<{ label: string; value: number }>;
  insight: string;
}

export interface PredictionResult {
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

export const aiService = {
  /**
   * Genera una gráfica con IA basada en un prompt
   */
  async generateChart(
    prompt: string,
    productos?: any[],
    ordenes?: any[],
    ventas?: any[]
  ): Promise<ChartData> {
    try {
      const { data } = await aiApi.post<ChartData>('/generate-chart', {
        prompt,
        productos,
        ordenes,
        ventas,
      });
      return data;
    } catch (error) {
      console.error('Error generating chart:', error);
      throw error;
    }
  },

  /**
   * Genera un reporte PDF con IA basado en un prompt
   */
  async generateReport(
    prompt: string,
    dataSource: 'productos' | 'ordenes' | 'ventas' | 'all',
    productos?: any[],
    ordenes?: any[],
    ventas?: any[]
  ): Promise<Blob> {
    try {
      const response = await aiApi.post('/generate-report', {
        prompt,
        dataSource,
        productos,
        ordenes,
        ventas,
      }, {
        responseType: 'blob',
      });
      
      return response.data;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  },

  /**
   * Genera predicciones con Machine Learning
   */
  async predict(
    prompt: string,
    predictionType: 'auto' | 'ventas' | 'ordenes' | 'productos',
    ventas?: any[],
    productos?: any[],
    ordenes?: any[]
  ): Promise<PredictionResult> {
    try {
      const { data } = await aiApi.post<PredictionResult>('/predict', {
        prompt,
        predictionType,
        ventas,
        productos,
        ordenes,
      });
      return data;
    } catch (error) {
      console.error('Error generating prediction:', error);
      throw error;
    }
  },

  /**
   * Test de conexión
   */
  async testConnection(): Promise<{ message: string; status: string }> {
    try {
      const { data } = await aiApi.get('/');
      return data;
    } catch (error) {
      console.error('Error testing connection:', error);
      throw error;
    }
  },
};