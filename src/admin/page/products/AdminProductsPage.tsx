import { AdminTitle } from "@/admin/components/AdminTitle"
import { CustomPagination } from "@/components/custom/CustomPagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { useEliminarProducto, useProductos } from "@/hooks/useProducts"
import { Edit, Package, PlusIcon, Search, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router"


export const AdminProductsPage = () => {
  const { data: productos, isLoading, error } = useProductos();
  const eliminarMutation = useEliminarProducto();

  const [searchParams] = useSearchParams();
  const queryPage = searchParams.get("page") ?? "1";
  const currentPage = isNaN(+queryPage) ? 1 : +queryPage;

  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    sku: string | null;
    nombre: string | null;
  }>({ open: false, sku: null, nombre: null });

  const itemsPerPage = 10;

  // Filtrado
  const filteredProductos = productos?.filter(
    (p) =>
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const totalPages = Math.ceil((filteredProductos?.length || 0) / itemsPerPage);
  const paginatedProductos = filteredProductos?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async () => {
    if (deleteDialog.sku) {
      await eliminarMutation.mutateAsync(deleteDialog.sku);
      setDeleteDialog({ open: false, sku: null, nombre: null });
    }
  };

  // Reset a página 1 cuando se busca
  useEffect(() => {
    if (searchTerm && currentPage > 1) {
      window.history.replaceState({}, "", "?page=1");
    }
  }, [searchTerm]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="font-semibold text-red-900">Error al cargar productos</p>
        <p className="text-sm text-red-700 mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <AdminTitle
          title="Productos"
          subtitle="Aquí puedes ver y administrar tus productos"
        />

        <Link to="/admin/products/new">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Button>
        </Link>
      </div>

      {/* Buscador */}
      <div className="bg-white p-4 shadow-sm border border-gray-200 rounded-lg mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar por SKU, nombre o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 shadow-sm border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Productos</p>
              <p className="text-2xl font-bold">{productos?.length || 0}</p>
            </div>
            <Package className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-4 shadow-sm border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Valor Total</p>
              <p className="text-2xl font-bold">
                $
                {productos
                  ?.reduce((sum, p) => sum + (p.costoUnitario || 0), 0)
                  .toFixed(2) || "0.00"}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 text-xl font-bold">$</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 shadow-sm border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Categorías</p>
              <p className="text-2xl font-bold">
                {new Set(productos?.map((p) => p.categoria).filter(Boolean))
                  .size || 0}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-purple-600 text-xl">🏷️</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 shadow-sm border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Lead Time Promedio</p>
              <p className="text-2xl font-bold">
                {productos?.length
                  ? (
                      productos.reduce((sum, p) => sum + p.diasLeadTime, 0) /
                      productos.length
                    ).toFixed(0)
                  : 0}{" "}
                días
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-orange-600 text-xl">⏱️</span>
            </div>
          </div>
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
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Costo</TableHead>
              <TableHead>Precio Venta</TableHead>
              <TableHead>Lead Time</TableHead>
              <TableHead>Margen</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProductos && paginatedProductos.length > 0 ? (
              paginatedProductos.map((producto) => {
                const margen =
                  producto.precioVenta && producto.costoUnitario
                    ? (
                        ((producto.precioVenta - producto.costoUnitario) /
                          producto.precioVenta) *
                        100
                      ).toFixed(1)
                    : null;

                return (
                  <TableRow key={producto.sku}>
                    <TableCell className="font-medium">
                      {producto.sku}
                    </TableCell>
                    <TableCell>{producto.nombre}</TableCell>
                    <TableCell>
                      {producto.categoria ? (
                        <Badge variant="outline">{producto.categoria}</Badge>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {producto.costoUnitario
                        ? `$${producto.costoUnitario.toFixed(2)}`
                        : "-"}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {producto.precioVenta
                        ? `$${producto.precioVenta.toFixed(2)}`
                        : "-"}
                    </TableCell>
                    <TableCell>{producto.diasLeadTime} días</TableCell>
                    <TableCell>
                      {margen ? (
                        <Badge
                          variant={
                            parseFloat(margen) > 30 ? "default" : "secondary"
                          }
                        >
                          {margen}%
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/admin/products/${producto.sku}`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setDeleteDialog({
                              open: true,
                              sku: producto.sku,
                              nombre: producto.nombre,
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
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
                      {searchTerm
                        ? "No se encontraron productos"
                        : "No hay productos registrados"}
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

      {/* Dialog de Confirmación */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          !open && setDeleteDialog({ open: false, sku: null, nombre: null })
        }
        title="¿Estás seguro?"
        description={`Esta acción eliminará permanentemente el producto "${deleteDialog.nombre}" (${deleteDialog.sku}). Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        onConfirm={handleDelete}
        isLoading={eliminarMutation.isPending}
      />
    </>
  );
}
