import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, Eye, FileText, CreditCard, Calendar, DollarSign, X } from 'lucide-react';
import { useSalesHistoryData } from './hooks/useSalesHistoryData';
import { useSalesData } from './hooks/useSalesData';

const SalesHistoryTab = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [saleToCancel, setSaleToCancel] = useState<any>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  const { sales, salesSummary, isLoading, filters, setFilters, refetchSales } = useSalesHistoryData();
  const { cancelSale } = useSalesData();

  const handleViewDetails = (sale: any) => {
    setSelectedSale(sale);
    setShowDetails(true);
  };

  const handleCancelSale = (sale: any) => {
    setSaleToCancel(sale);
    setShowCancelDialog(true);
  };

  const confirmCancelSale = async () => {
    if (saleToCancel) {
      try {
        await cancelSale(saleToCancel.id);
        setShowCancelDialog(false);
        setSaleToCancel(null);
        refetchSales();
      } catch (error) {
        console.error('Error al cancelar venta:', error);
      }
    }
  };

  const canCancelSale = (sale: any) => {
    // Solo permitir cancelar ventas de efectivo, tarjeta o transferencia
    const allowedMethods = ['cash', 'card', 'transfer'];
    if (!allowedMethods.includes(sale.payment_method)) return false;
    
    // Solo permitir cancelar ventas del día actual
    const saleDate = new Date(sale.created_at);
    const today = new Date();
    const isToday = saleDate.toDateString() === today.toDateString();
    
    // Solo permitir cancelar si no está ya cancelada
    const isNotCancelled = sale.sale_status !== 'cancelled';
    
    return isToday && isNotCancelled;
  };

  const getPaymentMethodBadge = (method: string) => {
    const variants: any = {
      cash: 'default',
      card: 'secondary',
      transfer: 'outline',
      account: 'destructive',
      mixed: 'default',
    };
    
    const labels: any = {
      cash: 'Efectivo',
      card: 'Tarjeta',
      transfer: 'Transferencia',
      account: 'A Cuenta',
      mixed: 'Mixto',
    };

    return (
      <Badge variant={variants[method] || 'default'}>
        {labels[method] || method}
      </Badge>
    );
  };

  const getSaleStatusBadge = (sale: any) => {
    if (sale.sale_status === 'cancelled') {
      return <Badge variant="destructive">Cancelada</Badge>;
    }
    return (
      <Badge variant={sale.payment_status === 'paid' ? 'default' : 'destructive'}>
        {sale.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Resumen de ventas */}
      {salesSummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="bg-blue-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Ventas</p>
                <p className="text-2xl font-bold">${salesSummary.totalSales.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="bg-green-100 p-3 rounded-full">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Número de Ventas</p>
                <p className="text-2xl font-bold">{salesSummary.salesCount}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="bg-purple-100 p-3 rounded-full">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Venta Promedio</p>
                <p className="text-2xl font-bold">${salesSummary.averageSale.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium">Fecha Desde</label>
              <Input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Fecha Hasta</label>
              <Input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Cliente</label>
              <Input
                placeholder="Nombre del cliente"
                value={filters.customerName || ''}
                onChange={(e) => setFilters({ ...filters, customerName: e.target.value })}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Número de Venta</label>
              <Input
                placeholder="VT-20241215-0001"
                value={filters.saleNumber || ''}
                onChange={(e) => setFilters({ ...filters, saleNumber: e.target.value })}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Método de Pago</label>
              <Select
                value={filters.paymentMethod || 'all'}
                onValueChange={(value) => setFilters({ ...filters, paymentMethod: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="card">Tarjeta</SelectItem>
                  <SelectItem value="transfer">Transferencia</SelectItem>
                  <SelectItem value="account">A Cuenta</SelectItem>
                  <SelectItem value="mixed">Mixto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de ventas */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Cargando historial...</div>
          ) : !sales || sales.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No se encontraron ventas
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Venta</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Método de Pago</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      <div className="font-medium">{sale.sale_number}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        {sale.customer_name || 'Cliente General'}
                        {sale.customers && (
                          <div className="text-sm text-gray-500">
                            {sale.customers.customer_code}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(sale.created_at).toLocaleDateString('es-ES')}
                        <div className="text-gray-500">
                          {new Date(sale.created_at).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">${sale.total_amount.toFixed(2)}</div>
                      {sale.discount_amount > 0 && (
                        <div className="text-sm text-gray-500">
                          Desc: ${sale.discount_amount.toFixed(2)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {getPaymentMethodBadge(sale.payment_method)}
                    </TableCell>
                    <TableCell>
                      {getSaleStatusBadge(sale)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(sale)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        {canCancelSale(sale) && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelSale(sale)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalles de venta */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle de Venta</DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Número:</strong> {selectedSale.sale_number}
                </div>
                <div>
                  <strong>Fecha:</strong> {new Date(selectedSale.created_at).toLocaleDateString('es-ES')}
                </div>
                <div>
                  <strong>Cliente:</strong> {selectedSale.customer_name || 'Cliente General'}
                </div>
                <div>
                  <strong>Método de Pago:</strong> {selectedSale.payment_method}
                </div>
                {selectedSale.sale_status === 'cancelled' && (
                  <div className="col-span-2">
                    <strong className="text-red-600">Estado:</strong> 
                    <span className="text-red-600 font-medium ml-2">VENTA CANCELADA</span>
                  </div>
                )}
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Productos:</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Precio Unit.</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSale.sale_items?.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.item_name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${item.unit_price.toFixed(2)}</TableCell>
                        <TableCell>${item.total_price.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${selectedSale.subtotal.toFixed(2)}</span>
                </div>
                {selectedSale.discount_amount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Descuento:</span>
                    <span>-${selectedSale.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>${selectedSale.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación de cancelación */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar Venta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción cancelará la venta {saleToCancel?.sale_number} por un total de ${saleToCancel?.total_amount.toFixed(2)}.
              <br /><br />
              <strong>Esta acción:</strong>
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>Marcará la venta como cancelada</li>
                <li>Restaurará el inventario de los productos vendidos</li>
                <li>No se puede deshacer</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, mantener venta</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancelSale} className="bg-red-600 hover:bg-red-700">
              Sí, cancelar venta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SalesHistoryTab;
