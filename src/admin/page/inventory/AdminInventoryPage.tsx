// src/admin/pages/inventory/AdminInventoryPage.tsx
import { useState } from 'react';
import { AdminTitle } from '@/admin/components/AdminTitle';
import { CustomPagination } from '@/components/custom/CustomPagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Search,
  Warehouse,
  TrendingDown,
  Package,
  AlertTriangle,
  Plus,
  Minus,
} from 'lucide-react';
import { useSearchParams } from 'react-router';
import {
  useInventario,
  useInventarioBajoStock,
} from '@/hooks/useInventory';
import { Inventario } from '@/interface/inventario.interface';
import { ModalAjustarStock } from './components/ModalAjustarStock';
import { ModalReservarStock } from './components/ModalReservarStock';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const AdminInventoryPage = () => {
  const [searchParams] = useSearchParams();
  const queryPage = searchParams.get('page') ?? '1';
  const currentPage = isNaN(+queryPage) ? 1 : +queryPage;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlmacen, setSelectedAlmacen] = useState<string>('');
  const [modalAjustar, setModalAjustar] = useState<{
    open: boolean;
    item: Inventario | null;
  }>({ open: false, item: null });
  const [modalReservar, setModalReservar] = useState<{
    open: boolean;
    item: Inventario | null;
  }>({ open: false, item: null });

  const { data: inventario, isLoading, error } = useInventario(
    selectedAlmacen || undefined
  );
  const { data: bajoStock } = useInventarioBajoStock();

  const itemsPerPage = 10;

  // Filtrado
  const filteredInventario = inventario?.filter((item) =>
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const totalPages = Math.ceil(
    (filteredInventario?.length || 0) / itemsPerPage
  );
  const paginatedInventario = filteredInventario?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Obtener almacenes únicos
  const almacenes = Array.from(
    new Set(inventario?.map((i) => i.almacen) || [])
  );

  // Estadísticas
  const stockTotal =
    inventario?.reduce((sum, i) => sum + i.cantidadTotal, 0) || 0;
  const stockDisponible =
    inventario?.reduce((sum, i) => sum + i.cantidadDisponible, 0) || 0;
  const stockReservado =
    inventario?.reduce((sum, i) => sum + i.cantidadReservada, 0) || 0;

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="font-semibold text-red-900">Error al cargar inventario</p>
        <p className="text-sm text-red-700 mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <AdminTitle
          title="Inventario"
          subtitle="Control y gestión de stock en almacenes"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 shadow-sm border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Items</p>
              <p className="text-2xl font-bold">{inventario?.length || 0}</p>
            </div>
            <Warehouse className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-4 shadow-sm border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Stock Total</p>
              <p className="text-2xl font-bold">{stockTotal}</p>
              <p className="text-xs text-gray-400">
                Disp: {stockDisponible} | Res: {stockReservado}
              </p>
            </div>
            <Package className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-4 shadow-sm border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Bajo Stock</p>
              <p className="text-2xl font-bold text-yellow-600">
                {bajoStock?.length || 0}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-4 shadow-sm border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Almacenes</p>
              <p className="text-2xl font-bold">{almacenes.length}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-purple-600 text-xl">🏢</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerta de bajo stock */}
      {bajoStock && bajoStock.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                ⚠️ Productos con stock bajo
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                {bajoStock.length} productos están por debajo del punto de
                reorden y requieren atención.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-4 shadow-sm border border-gray-200 rounded-lg mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtro por Almacén */}
          <Select value={selectedAlmacen} onValueChange={setSelectedAlmacen}>
            <SelectTrigger>
              <SelectValue placeholder="Todos los almacenes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los almacenes</SelectItem>
              {almacenes.map((almacen) => (
                <SelectItem key={almacen} value={almacen}>
                  {almacen}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabla */}
      {isLoading ? (
        <div className="bg-white p-20 shadow-sm border border-gray-200 rounded-lg flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Table className="bg-white p-10 shadow-sm border border-gray-200 mb-10 rounded-lg">
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Almacén</TableHead>
              <TableHead>Disponible</TableHead>
              <TableHead>Reservado</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Punto Reorden</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedInventario && paginatedInventario.length > 0 ? (
              paginatedInventario.map((item) => {
                const esBajoStock =
                  item.cantidadDisponible <= item.puntoReorden;
                const porcentajeDisponible =
                  (item.cantidadDisponible / item.cantidadTotal) * 100;

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.sku}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.almacen}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">
                        {item.cantidadDisponible}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-600">
                        {item.cantidadReservada}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold">{item.cantidadTotal}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-500">
                        {item.puntoReorden}
                      </span>
                    </TableCell>
                    <TableCell>
                      {esBajoStock ? (
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-800"
                        >
                          ⚠️ Bajo Stock
                        </Badge>
                      ) : porcentajeDisponible < 50 ? (
                        <Badge
                          variant="secondary"
                          className="bg-orange-100 text-orange-800"
                        >
                          Medio
                        </Badge>
                      ) : (
                        <Badge
                          variant="default"
                          className="bg-green-100 text-green-800"
                        >
                          ✓ OK
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setModalAjustar({ open: true, item })
                          }
                          title="Ajustar Stock"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setModalReservar({ open: true, item })
                          }
                          title="Reservar Stock"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Package className="h-12 w-12 mb-2" />
                    <p className="text-sm">
                      {searchTerm || selectedAlmacen
                        ? 'No se encontraron resultados'
                        : 'No hay inventario registrado'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      {/* Paginación */}
      {totalPages > 1 && <CustomPagination totalPages={totalPages} />}

      {/* Modales */}
      {modalAjustar.open && modalAjustar.item && (
        <ModalAjustarStock
          item={modalAjustar.item}
          onClose={() => setModalAjustar({ open: false, item: null })}
        />
      )}

      {modalReservar.open && modalReservar.item && (
        <ModalReservarStock
          item={modalReservar.item}
          onClose={() => setModalReservar({ open: false, item: null })}
        />
      )}
    </>
  );
};