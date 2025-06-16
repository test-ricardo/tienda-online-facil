
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PurchaseInvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoice?: any;
}

const PurchaseInvoiceDialog: React.FC<PurchaseInvoiceDialogProps> = ({ 
  isOpen, 
  onClose, 
  invoice 
}) => {
  if (!invoice) return null;

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Pendiente', variant: 'secondary' },
      received: { label: 'Recibida', variant: 'default' },
      cancelled: { label: 'Cancelada', variant: 'destructive' },
    };
    const config = statusMap[status] || statusMap.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Factura {invoice.invoice_number}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Header */}
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>Proveedor:</strong> {invoice.supplier?.name}</p>
                  <p><strong>Contacto:</strong> {invoice.supplier?.contact_person || '-'}</p>
                  <p><strong>Fecha:</strong> {new Date(invoice.invoice_date).toLocaleDateString()}</p>
                  {invoice.due_date && (
                    <p><strong>Vencimiento:</strong> {new Date(invoice.due_date).toLocaleDateString()}</p>
                  )}
                </div>
                <div>
                  <p><strong>Estado:</strong> {getStatusBadge(invoice.status)}</p>
                  <p><strong>Subtotal:</strong> ${invoice.subtotal.toFixed(2)}</p>
                  <p><strong>Impuestos:</strong> ${invoice.tax_amount.toFixed(2)}</p>
                  <p><strong>Total:</strong> ${invoice.total_amount.toFixed(2)}</p>
                </div>
              </div>
              {invoice.notes && (
                <div className="mt-4">
                  <p><strong>Notas:</strong> {invoice.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <CardTitle>Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Costo Unit.</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Lote</TableHead>
                    <TableHead>Vencimiento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.purchase_invoice_items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.product?.name}</TableCell>
                      <TableCell>{item.product?.sku}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>${item.unit_cost.toFixed(2)}</TableCell>
                      <TableCell>${item.total_cost.toFixed(2)}</TableCell>
                      <TableCell>{item.batch_number || '-'}</TableCell>
                      <TableCell>
                        {item.expiration_date 
                          ? new Date(item.expiration_date).toLocaleDateString()
                          : '-'
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseInvoiceDialog;
