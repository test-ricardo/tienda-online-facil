
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useSuppliersData } from './hooks/useSuppliersData';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import QuickSupplierDialog from './QuickSupplierDialog';
import QuickProductDialog from './QuickProductDialog';

interface QuickInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface InvoiceItem {
  product_id: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
}

const QuickInvoiceDialog: React.FC<QuickInvoiceDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [supplierId, setSupplierId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState<Date>(new Date());
  const [items, setItems] = useState<InvoiceItem[]>([{ product_id: '', quantity: 1, unit_cost: 0, total_cost: 0 }]);
  const [loading, setLoading] = useState(false);
  const [showSupplierDialog, setShowSupplierDialog] = useState(false);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const { toast } = useToast();
  const { suppliers } = useSuppliersData();
  const queryClient = useQueryClient();

  const { data: products } = useQuery({
    queryKey: ['products-for-invoice'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, cost')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const handleAddItem = () => {
    setItems([...items, { product_id: '', quantity: 1, unit_cost: 0, total_cost: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unit_cost') {
      newItems[index].total_cost = newItems[index].quantity * newItems[index].unit_cost;
    }
    
    if (field === 'product_id' && products) {
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index].unit_cost = Number(product.cost);
        newItems[index].total_cost = newItems[index].quantity * Number(product.cost);
      }
    }
    
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.total_cost || 0), 0);
  };

  const handleSupplierSuccess = (newSupplier: any) => {
    queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    setSupplierId(newSupplier.id);
  };

  const handleProductSuccess = (newProduct: any) => {
    queryClient.invalidateQueries({ queryKey: ['products-for-invoice'] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || items.length === 0) return;

    const validItems = items.filter(item => item.product_id && item.quantity > 0 && item.unit_cost > 0);
    if (validItems.length === 0) {
      toast({
        title: 'Error',
        description: 'Debe agregar al menos un producto válido.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: invoiceNumber } = await supabase.rpc('generate_purchase_invoice_number');
      
      const totalAmount = calculateTotal();

      const { data: invoice, error: invoiceError } = await supabase
        .from('purchase_invoices')
        .insert([{
          invoice_number: invoiceNumber,
          supplier_id: supplierId,
          invoice_date: format(invoiceDate, 'yyyy-MM-dd'),
          subtotal: totalAmount,
          total_amount: totalAmount,
          created_by: user?.id,
          status: 'received'
        }])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      const invoiceItems = validItems.map(item => ({
        invoice_id: invoice.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_cost: item.unit_cost,
        total_cost: item.total_cost,
      }));

      const { error: itemsError } = await supabase
        .from('purchase_invoice_items')
        .insert(invoiceItems);

      if (itemsError) throw itemsError;

      toast({
        title: 'Factura creada',
        description: 'La factura se ha creado y el stock se ha actualizado automáticamente.',
      });

      onSuccess();
      onOpenChange(false);
      
      setSupplierId('');
      setInvoiceDate(new Date());
      setItems([{ product_id: '', quantity: 1, unit_cost: 0, total_cost: 0 }]);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Factura Rápida de Compra</DialogTitle>
            <DialogDescription>
              Crear una factura de compra y actualizar stock automáticamente
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Proveedor *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSupplierDialog(true)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Select value={supplierId} onValueChange={setSupplierId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers?.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Fecha de Factura *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !invoiceDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {invoiceDate ? format(invoiceDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={invoiceDate}
                        onSelect={(date) => date && setInvoiceDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-lg font-semibold">Productos</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowProductDialog(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Producto
                    </Button>
                    <Button type="button" onClick={handleAddItem} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Producto
                    </Button>
                  </div>
                </div>

                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-6 gap-2 items-end border p-4 rounded">
                    <div className="col-span-2 space-y-2">
                      <Label>Producto</Label>
                      <Select 
                        value={item.product_id} 
                        onValueChange={(value) => handleItemChange(index, 'product_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar producto" />
                        </SelectTrigger>
                        <SelectContent>
                          {products?.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} ({product.sku})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Cantidad</Label>
                      <Input
                        type="number"
                        step="0.001"
                        min="0"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Costo Unitario</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unit_cost}
                        onChange={(e) => handleItemChange(index, 'unit_cost', Number(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Total</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.total_cost.toFixed(2)}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>&nbsp;</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="text-right">
                  <div className="text-lg font-semibold">
                    Total: ${calculateTotal().toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || !supplierId}>
                {loading ? 'Creando...' : 'Crear Factura'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <QuickSupplierDialog
        open={showSupplierDialog}
        onOpenChange={setShowSupplierDialog}
        onSuccess={handleSupplierSuccess}
      />

      <QuickProductDialog
        open={showProductDialog}
        onOpenChange={setShowProductDialog}
        onSuccess={handleProductSuccess}
      />
    </>
  );
};

export default QuickInvoiceDialog;
