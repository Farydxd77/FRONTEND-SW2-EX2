import { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAjustarStock } from '@/hooks/useInventory';
import { Inventario } from '@/interface/inventario.interface';

interface Props {
  item: Inventario;
  onClose: () => void;
}

export const ModalAjustarStock = ({ item, onClose }: Props) => {
  const [cantidad, setCantidad] = useState<number>(0);
  const ajustarMutation = useAjustarStock();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cantidad === 0) {
      return;
    }

    try {
      await ajustarMutation.mutateAsync({
        sku: item.sku,
        almacen: item.almacen,
        cantidad,
      });
      onClose();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const nuevoStock = item.cantidadDisponible + cantidad;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Ajustar Stock
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Item Info */}
          <div className="p-4 bg-slate-50 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">SKU:</span>
              <span className="font-semibold">{item.sku}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Almacén:</span>
              <span className="font-semibold">{item.almacen}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Stock Actual:</span>
              <span className="font-semibold text-blue-600">
                {item.cantidadDisponible} unidades
              </span>
            </div>
          </div>

          {/* Cantidad Input */}
          <div className="space-y-2">
            <Label htmlFor="cantidad">
              Cantidad a Ajustar <span className="text-red-600">*</span>
            </Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCantidad((prev) => prev - 10)}
              >
                <Minus className="h-4 w-4" />
                10
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCantidad((prev) => prev - 1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="cantidad"
                type="number"
                value={cantidad}
                onChange={(e) => setCantidad(parseInt(e.target.value) || 0)}
                className="text-center"
                placeholder="0"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCantidad((prev) => prev + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCantidad((prev) => prev + 10)}
              >
                <Plus className="h-4 w-4" />
                10
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              • Usa valores positivos para agregar stock
              <br />• Usa valores negativos para reducir stock
            </p>
          </div>

          {/* Preview */}
          {cantidad !== 0 && (
            <div
              className={`p-4 rounded-lg ${
                cantidad > 0 ? 'bg-green-50' : 'bg-red-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Nuevo Stock:</span>
                <span
                  className={`text-2xl font-bold ${
                    cantidad > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {nuevoStock} unidades
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {cantidad > 0 ? '↑' : '↓'} Cambio: {Math.abs(cantidad)}{' '}
                unidades
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={ajustarMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={ajustarMutation.isPending || cantidad === 0}
            >
              {ajustarMutation.isPending ? 'Procesando...' : 'Confirmar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};