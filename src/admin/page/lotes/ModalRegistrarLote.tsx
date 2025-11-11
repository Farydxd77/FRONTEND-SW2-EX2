import { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRegistrarLote } from '@/hooks/useLote';

interface Props {
  onClose: () => void;
}

export const ModalRegistrarLote = ({ onClose }: Props) => {
  const [formData, setFormData] = useState({
    sku: '',
    numeroLote: '',
    cantidad: 0,
    fechaVencimiento: '',
    almacen: '',
  });

  const registrarMutation = useRegistrarLote();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.sku ||
      !formData.numeroLote ||
      formData.cantidad <= 0 ||
      !formData.fechaVencimiento ||
      !formData.almacen
    ) {
      return;
    }

    try {
      await registrarMutation.mutateAsync({
        sku: formData.sku,
        numeroLote: formData.numeroLote,
        cantidad: formData.cantidad,
        fechaVencimiento: formData.fechaVencimiento,
        almacen: formData.almacen,
      });
      onClose();
    } catch (error) {
      // Error handled by mutation
    }
  };

  // Calcular días hasta vencimiento
  const calcularDiasRestantes = () => {
    if (!formData.fechaVencimiento) return null;
    const hoy = new Date();
    const fechaVenc = new Date(formData.fechaVencimiento);
    const diffTime = fechaVenc.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const diasRestantes = calcularDiasRestantes();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Registrar Nuevo Lote
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* SKU */}
            <div className="space-y-2">
              <Label htmlFor="sku">
                SKU del Producto <span className="text-red-600">*</span>
              </Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sku: e.target.value.toUpperCase(),
                  })
                }
                placeholder="Ej: PROD-001"
                required
              />
            </div>

            {/* Número de Lote */}
            <div className="space-y-2">
              <Label htmlFor="numeroLote">
                Número de Lote <span className="text-red-600">*</span>
              </Label>
              <Input
                id="numeroLote"
                value={formData.numeroLote}
                onChange={(e) =>
                  setFormData({ ...formData, numeroLote: e.target.value })
                }
                placeholder="Ej: LOTE-2024-001"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Cantidad */}
            <div className="space-y-2">
              <Label htmlFor="cantidad">
                Cantidad <span className="text-red-600">*</span>
              </Label>
              <Input
                id="cantidad"
                type="number"
                value={formData.cantidad || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cantidad: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="0"
                min="1"
                required
              />
            </div>

            {/* Almacén */}
            <div className="space-y-2">
              <Label htmlFor="almacen">
                Almacén <span className="text-red-600">*</span>
              </Label>
              <Input
                id="almacen"
                value={formData.almacen}
                onChange={(e) =>
                  setFormData({ ...formData, almacen: e.target.value })
                }
                placeholder="Ej: ALM-PRINCIPAL"
                required
              />
            </div>
          </div>

          {/* Fecha de Vencimiento */}
          <div className="space-y-2">
            <Label htmlFor="fechaVencimiento">
              Fecha de Vencimiento <span className="text-red-600">*</span>
            </Label>
            <Input
              id="fechaVencimiento"
              type="date"
              value={formData.fechaVencimiento}
              onChange={(e) =>
                setFormData({ ...formData, fechaVencimiento: e.target.value })
              }
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {/* Preview de días restantes */}
          {diasRestantes !== null && (
            <div
              className={`p-4 rounded-lg ${
                diasRestantes < 0
                  ? 'bg-red-50 border border-red-200'
                  : diasRestantes <= 30
                  ? 'bg-yellow-50 border border-yellow-200'
                  : 'bg-green-50 border border-green-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {diasRestantes < 0
                    ? '⚠️ Fecha ya vencida'
                    : diasRestantes <= 7
                    ? '⚠️ Vencimiento próximo'
                    : diasRestantes <= 30
                    ? '📅 Vencimiento cercano'
                    : '✓ Vencimiento lejano'}
                </span>
                <span className="font-bold text-lg">
                  {diasRestantes < 0 ? 'Vencido' : `${diasRestantes} días`}
                </span>
              </div>
            </div>
          )}

          {/* Información FEFO */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ Sistema FEFO:</strong> Este lote se priorizará
              automáticamente según su fecha de vencimiento (First Expired,
              First Out).
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={registrarMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={registrarMutation.isPending}
            >
              {registrarMutation.isPending
                ? 'Registrando...'
                : 'Registrar Lote'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};