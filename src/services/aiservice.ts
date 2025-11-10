// src/services/ai.service.ts

import { aiApi } from "@/api/PYaiApi";


export interface ChartData {
  chart_type: 'bar' | 'line' | 'pie' | 'area';
  title: string;
  data: Array<{ label: string; value: number }>;
  insight: string;
}

export interface ProductAnalysis {
  productos_criticos: string[];
  productos_top: string[];
  recomendaciones: string[];
  resumen: string;
}

export interface PurchaseOrderRecommendation {
  cantidad_sugerida: number;
  justificacion: string;
  costo_total: number;
  fecha_entrega: string;
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
   * Analiza productos y genera recomendaciones
   */
  async analyzeProducts(productos: any[]): Promise<ProductAnalysis> {
    try {
      const { data } = await aiApi.post<ProductAnalysis>('/analyze-products', {
        productos,
      });
      return data;
    } catch (error) {
      console.error('Error analyzing products:', error);
      throw error;
    }
  },

  /**
   * Genera recomendación de orden de compra
   */
  async generatePurchaseOrder(
    producto: any,
    stock_actual: number = 0,
    demanda_promedio: number = 5
  ): Promise<PurchaseOrderRecommendation> {
    try {
      const { data } = await aiApi.post<PurchaseOrderRecommendation>('/generate-po', {
        producto,
        stock_actual,
        demanda_promedio,
      });
      return data;
    } catch (error) {
      console.error('Error generating purchase order:', error);
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