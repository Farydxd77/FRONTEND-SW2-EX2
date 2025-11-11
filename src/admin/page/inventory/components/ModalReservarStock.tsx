// src/admin/pages/inventory/components/ModalReservarStock.tsx
import { useState } from 'react';
import { X, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useReservarStock } from '@/hooks/useInventory';
import { Inventario } from '@/interface/inventario.interface';

interface Props {
  item: Inventario;
  onClose: () => void;
}

export const ModalReservarStock = ({ item, onClose }: Props) => {
  const [cantidad, setCantidad] = useState<number>(0);
  const reservarMutation = useReservarStock();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cantidad <= 0 || cantidad > item.cantidadDisponible) {
      return;
    }

    try {
      await reservarMutation.mutateAsync({
        sku: item.sku,
        almacen: item.almacen,
        cantidad,
      });
      onClose();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const nuevoDisponible = item.cantidadDisponible - cantidad;
  const nuevoReservado = item.cantidadReservada + cantidad;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Lock className="h-5 w-5 text-orange-500" />
            Reservar Stock
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
              <span className="text-sm text-gray-500">Disponible:</span>
              <span className="font-semibold text-green-600">
                {item.cantidadDisponible} unidades
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Ya Reservado:</span>
              <span className="font-semibold text-orange-600">
                {item.cantidadReservada} unidades
              </span>
            </div>
          </div>

          {/* Cantidad Input */}
          <div className="space-y-2">
            <Label htmlFor="cantidad">
              Cantidad a Reservar <span className="text-red-600">*</span>
            </Label>
            <Input
              id="cantidad"
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(parseInt(e.target.value) || 0)}
              placeholder="0"
              min="1"
              max={item.cantidadDisponible}
              required
            />
            <p className="text-xs text-gray-500">
              Máximo disponible para reservar: {item.cantidadDisponible}{' '}
              unidades
            </p>
          </div>

          {/* Preview */}
          {cantidad > 0 && cantidad <= item.cantidadDisponible && (
            <div className="p-4 bg-orange-50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Nuevo Disponible:</span>
                <span className="font-bold text-green-600">
                  {nuevoDisponible}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Nuevo Reservado:</span>
                <span className="font-bold text-orange-600">
                  {nuevoReservado}
                </span>
              </div>
            </div>
          )}

          {cantidad > item.cantidadDisponible && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">
                ⚠️ No hay suficiente stock disponible
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
              disabled={reservarMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-orange-600 hover:bg-orange-700"
              disabled={
                reservarMutation.isPending ||
                cantidad <= 0 ||
                cantidad > item.cantidadDisponible
              }
            >
              {reservarMutation.isPending ? 'Reservando...' : 'Reservar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};