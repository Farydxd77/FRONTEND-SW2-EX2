// src/admin/pages/lotes/AdminLotesPage.tsx
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
  Calendar,
  AlertTriangle,
  Package,
  PlusIcon,
  Clock,
} from 'lucide-react';
import { useSearchParams } from 'react-router';
import { useLotes, useLotesProximosVencer } from '@/hooks/useLote';
import { ModalRegistrarLote } from './ModalRegistrarLote';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const AdminLotesPage = () => {
  const [searchParams] = useSearchParams();
  const queryPage = searchParams.get('page') ?? '1';
  const currentPage = isNaN(+queryPage) ? 1 : +queryPage;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlmacen, setSelectedAlmacen] = useState<string>('');
  const [diasFiltro, setDiasFiltro] = useState<number>(30);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: lotes, isLoading, error } = useLotes(
    selectedAlmacen || undefined
  );
  const { data: lotesProximosVencer } = useLotesProximosVencer(diasFiltro);

  const itemsPerPage = 10;

  // Filtrado
  const filteredLotes = lotes?.filter(
    (lote) =>
      lote.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lote.numeroLote.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const totalPages = Math.ceil((filteredLotes?.length || 0) / itemsPerPage);
  const paginatedLotes = filteredLotes?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Obtener almacenes únicos
  const almacenes = Array.from(new Set(lotes?.map((l) => l.almacen) || []));

  // Estadísticas
  const totalLotes = lotes?.length || 0;
  const lotesVencidos = lotes?.filter((l) => l.estaVencido).length || 0;
  const cantidadTotal = lotes?.reduce((sum, l) => sum + l.cantidad, 0) || 0;

  const getBadgeVencimiento = (diasParaVencer: number, estaVencido: boolean) => {
    if (estaVencido) {
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          ❌ Vencido
        </Badge>
      );
    }
    if (diasParaVencer <= 7) {
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          ⚠️ {diasParaVencer}d
        </Badge>
      );
    }
    if (diasParaVencer <= 30) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          ⏰ {diasParaVencer}d
        </Badge>
      );
    }
    if (diasParaVencer <= 60) {
      return (
        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
          📅 {diasParaVencer}d
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="bg-green-100 text-green-800">
        ✓ {diasParaVencer}d
      </Badge>
    );
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="font-semibold text-red-900">Error al cargar lotes</p>
        <p className="text-sm text-red-700 mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <AdminTitle
          title="Gestión de Lotes"
          subtitle="Control de lotes y fechas de vencimiento (FEFO)"
        />

        <Button onClick={() => setModalOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Registrar Lote
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 shadow-sm border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Lotes</p>
              <p className="text-2xl font-bold">{totalLotes}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-4 shadow-sm border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Cantidad Total</p>
              <p className="text-2xl font-bold">{cantidadTotal}</p>
              <p className="text-xs text-gray-400">unidades</p>
            </div>
            <Package className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-4 shadow-sm border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Próximos a Vencer</p>
              <p className="text-2xl font-bold text-yellow-600">
                {lotesProximosVencer?.length || 0}
              </p>
              <p className="text-xs text-gray-400">en {diasFiltro} días</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-4 shadow-sm border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Lotes Vencidos</p>
              <p className="text-2xl font-bold text-red-600">{lotesVencidos}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Alerta de lotes próximos a vencer */}
      {lotesProximosVencer && lotesProximosVencer.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                ⚠️ Lotes próximos a vencer
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Hay {lotesProximosVencer.length} lote(s) que vencerán en los
                próximos {diasFiltro} días. Revisa el inventario para priorizar
                su salida (FEFO).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-4 shadow-sm border border-gray-200 rounded-lg mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por SKU o número de lote..."
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

          {/* Filtro de días para vencer */}
          <Select
            value={diasFiltro.toString()}
            onValueChange={(value) => setDiasFiltro(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Días para vencer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Próximos 7 días</SelectItem>
              <SelectItem value="15">Próximos 15 días</SelectItem>
              <SelectItem value="30">Próximos 30 días</SelectItem>
              <SelectItem value="60">Próximos 60 días</SelectItem>
              <SelectItem value="90">Próximos 90 días</SelectItem>
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
              <TableHead>Número de Lote</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Almacén</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Fecha Vencimiento</TableHead>
              <TableHead>Días Restantes</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLotes && paginatedLotes.length > 0 ? (
              paginatedLotes.map((lote) => {
                const fechaVenc = new Date(lote.fechaVencimiento);
                const fechaFormateada = fechaVenc.toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <TableRow
                    key={lote.id}
                    className={lote.estaVencido ? 'bg-red-50' : ''}
                  >
                    <TableCell className="font-medium">
                      {lote.numeroLote}
                    </TableCell>
                    <TableCell>{lote.sku}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{lote.almacen}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">{lote.cantidad}</span> un.
                    </TableCell>
                    <TableCell>{fechaFormateada}</TableCell>
                    <TableCell>
                      {lote.estaVencido ? (
                        <span className="text-red-600 font-semibold">
                          Vencido
                        </span>
                      ) : (
                        <span>{lote.diasParaVencer} días</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getBadgeVencimiento(
                        lote.diasParaVencer,
                        lote.estaVencido
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Calendar className="h-12 w-12 mb-2" />
                    <p className="text-sm">
                      {searchTerm || selectedAlmacen
                        ? 'No se encontraron lotes'
                        : 'No hay lotes registrados'}
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

      {/* Modal */}
      {modalOpen && (
        <ModalRegistrarLote onClose={() => setModalOpen(false)} />
      )}
    </>
  );
};