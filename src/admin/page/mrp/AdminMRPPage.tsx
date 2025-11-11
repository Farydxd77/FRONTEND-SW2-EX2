// src/admin/pages/mrp/AdminMRPPage.tsx
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
  TrendingUp,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  AlertCircle,
} from 'lucide-react';
import { useSearchParams } from 'react-router';
import {
  useOrdenesCompra,
  useEjecutarMRP,
  useAprobarOrden,
} from '@/hooks/useMRP';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OrdenCompra } from '@/interface/orden-compra.interface';

export const AdminMRPPage = () => {
  const [searchParams] = useSearchParams();
  const queryPage = searchParams.get('page') ?? '1';
  const currentPage = isNaN(+queryPage) ? 1 : +queryPage;

  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState<string>('');
  const [executeDialog, setExecuteDialog] = useState(false);
  const [approveDialog, setApproveDialog] = useState<{
    open: boolean;
    orden: OrdenCompra | null;
  }>({ open: false, orden: null });

  const { data: ordenes, isLoading, error } = useOrdenesCompra(
    estadoFiltro || undefined
  );
  const ejecutarMRPMutation = useEjecutarMRP();
  const aprobarMutation = useAprobarOrden();

  const itemsPerPage = 10;

  // Filtrado
  const filteredOrdenes = ordenes?.filter(
    (orden) =>
      orden.numeroOc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const totalPages = Math.ceil((filteredOrdenes?.length || 0) / itemsPerPage);
  const paginatedOrdenes = filteredOrdenes?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Estadísticas
  const totalOrdenes = ordenes?.length || 0;
  const ordenesPendientes =
    ordenes?.filter((o) => o.estado === 'PENDIENTE').length || 0;
  const ordenesAprobadas =
    ordenes?.filter((o) => o.estado === 'APROBADA').length || 0;
  const cantidadTotal =
    ordenes?.reduce((sum, o) => sum + o.cantidadSugerida, 0) || 0;

  const handleEjecutarMRP = async () => {
    await ejecutarMRPMutation.mutateAsync();
    setExecuteDialog(false);
  };

  const handleAprobarOrden = async () => {
    if (approveDialog.orden) {
      await aprobarMutation.mutateAsync(approveDialog.orden.id);
      setApproveDialog({ open: false, orden: null });
    }
  };

  const getBadgeEstado = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE':
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800"
          >
            ⏳ Pendiente
          </Badge>
        );
      case 'APROBADA':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            ✓ Aprobada
          </Badge>
        );
      case 'RECHAZADA':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            ✗ Rechazada
          </Badge>
        );
      case 'COMPLETADA':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            ✓ Completada
          </Badge>
        );
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="font-semibold text-red-900">
          Error al cargar órdenes de compra
        </p>
        <p className="text-sm text-red-700 mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <AdminTitle
          title="MRP - Órdenes de Compra"
          subtitle="Planificación de requerimientos de materiales"
        />

        <Button
          onClick={() => setExecuteDialog(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          <Play className="mr-2 h-4 w-4" />
          Ejecutar Motor MRP
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 shadow-sm border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Órdenes</p>
              <p className="text-2xl font-bold">{totalOrdenes}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-4 shadow-sm border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">
                {ordenesPendientes}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-4 shadow-sm border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Aprobadas</p>
              <p className="text-2xl font-bold text-green-600">
                {ordenesAprobadas}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-4 shadow-sm border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Cantidad Total</p>
              <p className="text-2xl font-bold">{cantidadTotal}</p>
              <p className="text-xs text-gray-400">unidades</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              ℹ️ ¿Cómo funciona el Motor MRP?
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              El motor MRP analiza automáticamente tu inventario, detecta
              productos con stock bajo (por debajo del punto de reorden) y
              genera órdenes de compra sugeridas. Puedes revisar y aprobar cada
              orden antes de enviarla al proveedor.
            </p>
          </div>
        </div>
      </div>

      {/* Alerta de órdenes pendientes */}
      {ordenesPendientes > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                ⚠️ Órdenes pendientes de aprobación
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Tienes {ordenesPendientes} orden(es) de compra esperando tu
                aprobación. Revisa y aprueba para enviar al proveedor.
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
              placeholder="Buscar por número de OC o SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtro por Estado */}
          <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
            <SelectTrigger>
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los estados</SelectItem>
              <SelectItem value="PENDIENTE">⏳ Pendiente</SelectItem>
              <SelectItem value="APROBADA">✓ Aprobada</SelectItem>
              <SelectItem value="RECHAZADA">✗ Rechazada</SelectItem>
              <SelectItem value="COMPLETADA">✓ Completada</SelectItem>
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
              <TableHead>Número OC</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Creado Por</TableHead>
              <TableHead>Fecha Creación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrdenes && paginatedOrdenes.length > 0 ? (
              paginatedOrdenes.map((orden) => {
                const fechaCreacion = new Date(orden.creadoEn);
                const fechaFormateada = fechaCreacion.toLocaleDateString(
                  'es-ES',
                  {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }
                );

                return (
                  <TableRow key={orden.id}>
                    <TableCell className="font-medium">
                      {orden.numeroOc}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{orden.sku}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-blue-600">
                        {orden.cantidadSugerida}
                      </span>{' '}
                      un.
                    </TableCell>
                    <TableCell>{getBadgeEstado(orden.estado)}</TableCell>
                    <TableCell>
                      <span className="text-gray-600">
                        {orden.creadoPor || 'Sistema MRP'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">
                        {fechaFormateada}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {orden.estado === 'PENDIENTE' && (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setApproveDialog({ open: true, orden })
                            }
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Aprobar
                          </Button>
                        </div>
                      )}
                      {orden.estado === 'APROBADA' && (
                        <span className="text-sm text-green-600 font-medium">
                          ✓ Enviada al proveedor
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <ShoppingCart className="h-12 w-12 mb-2" />
                    <p className="text-sm">
                      {searchTerm || estadoFiltro
                        ? 'No se encontraron órdenes'
                        : 'No hay órdenes de compra'}
                    </p>
                    <p className="text-xs mt-1">
                      Ejecuta el motor MRP para generar órdenes automáticas
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

      {/* Dialog - Ejecutar MRP */}
      <ConfirmDialog
        open={executeDialog}
        onOpenChange={setExecuteDialog}
        title="Ejecutar Motor MRP"
        description="El sistema analizará el inventario actual y generará órdenes de compra para los productos que están por debajo del punto de reorden. ¿Deseas continuar?"
        confirmText="Ejecutar MRP"
        onConfirm={handleEjecutarMRP}
        isLoading={ejecutarMRPMutation.isPending}
      />

      {/* Dialog - Aprobar Orden */}
      {approveDialog.open && approveDialog.orden && (
        <ConfirmDialog
          open={approveDialog.open}
          onOpenChange={(open) =>
            !open && setApproveDialog({ open: false, orden: null })
          }
          title="Aprobar Orden de Compra"
          description={`¿Estás seguro de aprobar la orden ${approveDialog.orden.numeroOc}? Se comprará ${approveDialog.orden.cantidadSugerida} unidades del producto ${approveDialog.orden.sku}.`}
          confirmText="Aprobar Orden"
          onConfirm={handleAprobarOrden}
          isLoading={aprobarMutation.isPending}
        />
      )}
    </>
  );
};