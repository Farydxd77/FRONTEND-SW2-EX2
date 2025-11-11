import { AdminTitle } from "@/admin/components/AdminTitle";
import { useNavigate, useParams } from "react-router";

import { useEffect, useState } from "react";
import {
  Loader2,
  X,
  SaveAll,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

import { useActualizarProducto, useCrearProducto, useProductoBySku, type ProductoInput } from "@/hooks/useProducts";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export const AdminProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const isNew = id === 'new';
  const productTitle = isNew ? 'Nuevo producto' : 'Editar producto';
  const productSubtitle = isNew
    ? 'Aquí puedes crear un nuevo producto.'
    : 'Aquí puedes editar el producto.';

  // Hooks
  const { data: producto, isLoading } = useProductoBySku(
    isNew ? '' : (id as string)
  );
  const crearMutation = useCrearProducto();
  const actualizarMutation = useActualizarProducto();

  // Estado del formulario
  const [formData, setFormData] = useState<ProductoInput & { sku: string }>({
    sku: '',
    nombre: '',
    categoria: '',
    costoUnitario: 0,
    precioVenta: 0,
    diasLeadTime: 0,
  });

  // Cargar datos del producto si es edición
  useEffect(() => {
    if (producto && !isNew) {
      setFormData({
        sku: producto.sku,
        nombre: producto.nombre,
        categoria: producto.categoria || '',
        costoUnitario: producto.costoUnitario || 0,
        precioVenta: producto.precioVenta || 0,
        diasLeadTime: producto.diasLeadTime,
      });
    }
  }, [producto, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación básica
    if (!formData.sku || !formData.nombre) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    const input: ProductoInput = {
      nombre: formData.nombre,
      categoria: formData.categoria || null,
      costoUnitario: formData.costoUnitario || null,
      precioVenta: formData.precioVenta || null,
      diasLeadTime: formData.diasLeadTime,
    };

    try {
      if (isNew) {
        await crearMutation.mutateAsync({
          sku: formData.sku,
          input,
        });
        toast.success('Producto creado exitosamente');
      } else {
        await actualizarMutation.mutateAsync({
          sku: formData.sku,
          input,
        });
        toast.success('Producto actualizado exitosamente');
      }
      navigate('/admin/products');
    } catch (error) {
      // El error ya se maneja en el hook
    }
  };

  const margen =
    formData.precioVenta && formData.costoUnitario
      ? (
          ((formData.precioVenta - formData.costoUnitario) /
            formData.precioVenta) *
          100
        ).toFixed(1)
      : '0';

  const ganancia =
    formData.precioVenta && formData.costoUnitario
      ? (formData.precioVenta - formData.costoUnitario).toFixed(2)
      : '0.00';

  const isSaving = crearMutation.isPending || actualizarMutation.isPending;

  if (isLoading && !isNew) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="flex justify-between items-center mb-6">
          <AdminTitle title={productTitle} subtitle={productSubtitle} />
          <div className="flex gap-4">
            <Button type="button" variant="outline" asChild>
              <Link to="/admin/products" className="flex items-center gap-2">
                <X className="w-4 h-4" />
                Cancelar
              </Link>
            </Button>

            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <SaveAll className="w-4 h-4 mr-2" />
                  Guardar cambios
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información Básica */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Producto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* SKU */}
                <div className="space-y-2">
                  <Label htmlFor="sku">
                    SKU <span className="text-destructive">*</span>
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
                    disabled={!isNew}
                  />
                  {!isNew && (
                    <p className="text-xs text-muted-foreground">
                      El SKU no puede ser modificado
                    </p>
                  )}
                </div>

                {/* Nombre */}
                <div className="space-y-2">
                  <Label htmlFor="nombre">
                    Nombre del Producto <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    placeholder="Ej: Laptop HP Pavilion"
                    required
                  />
                </div>

                {/* Categoría */}
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría</Label>
                  <Input
                    id="categoria"
                    value={formData.categoria || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, categoria: e.target.value })
                    }
                    placeholder="Ej: Electrónica"
                  />
                </div>

                {/* Costo y Precio */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="costo">Costo Unitario</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="costo"
                        type="number"
                        step="0.01"
                        value={formData.costoUnitario || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            costoUnitario: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="pl-7"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="precio">Precio de Venta</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="precio"
                        type="number"
                        step="0.01"
                        value={formData.precioVenta || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            precioVenta: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="pl-7"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Lead Time */}
                <div className="space-y-2">
                  <Label htmlFor="leadtime">
                    Días de Lead Time <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="leadtime"
                    type="number"
                    value={formData.diasLeadTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        diasLeadTime: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                    required
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    Tiempo estimado desde la orden hasta la recepción
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna Lateral */}
          <div className="space-y-6">
            {/* Análisis de Rentabilidad */}
            {formData.costoUnitario > 0 && formData.precioVenta > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Rentabilidad</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Margen</span>
                    <span
                      className={`text-lg font-bold ${
                        parseFloat(margen) > 30
                          ? 'text-green-600'
                          : 'text-orange-600'
                      }`}
                    >
                      {margen}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">
                      Ganancia por Unidad
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      ${ganancia}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    <p>• Margen &gt; 30% = Excelente</p>
                    <p>• Margen 20-30% = Bueno</p>
                    <p>• Margen &lt; 20% = Revisar</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Resumen */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen del Producto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm text-muted-foreground">SKU</span>
                  <span className="text-sm font-medium">
                    {formData.sku || '-'}
                  </span>
                </div>

                <div className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm text-muted-foreground">
                    Categoría
                  </span>
                  <span className="text-sm font-medium">
                    {formData.categoria || '-'}
                  </span>
                </div>

                <div className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm text-muted-foreground">
                    Lead Time
                  </span>
                  <span className="text-sm font-medium">
                    {formData.diasLeadTime} días
                  </span>
                </div>

                <div className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm text-muted-foreground">Estado</span>
                  <span className="text-sm font-medium text-green-600">
                    {isNew ? 'Nuevo' : 'Editando'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </>
  );
};
