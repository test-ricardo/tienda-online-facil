
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CreateSaleData {
  customer_id?: string;
  customer_name?: string;
  customer_email?: string;
  payment_method: string;
  discount_amount: number;
  items: Array<{
    product_id?: string;
    combo_id?: string;
    item_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  payments?: Array<{
    payment_method: string;
    amount: number;
    reference?: string;
    notes?: string;
  }>;
}

export const useSalesData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products } = useQuery({
    queryKey: ['pos-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (name),
          subcategories (name)
        `)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: combos } = useQuery({
    queryKey: ['pos-combos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_combos')
        .select(`
          *,
          combo_items (
            quantity,
            products (name, stock_unit)
          )
        `)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const createSaleMutation = useMutation({
    mutationFn: async (saleData: CreateSaleData) => {
      const { data: saleNumber } = await supabase.rpc('generate_sale_number');
      
      const subtotal = saleData.items.reduce((sum, item) => sum + item.total_price, 0);
      const total = subtotal - saleData.discount_amount;
      
      // Verificar si el cliente puede comprar a cuenta
      if (saleData.customer_id && saleData.payment_method === 'account') {
        const { data: canBuy } = await supabase.rpc('can_customer_buy_on_account', {
          customer_id: saleData.customer_id,
          sale_amount: total
        });
        
        if (!canBuy) {
          throw new Error('El cliente no tiene crédito suficiente para esta compra');
        }
      }

      // Crear la venta
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert([{
          sale_number: saleNumber,
          customer_id: saleData.customer_id,
          customer_name: saleData.customer_name,
          customer_email: saleData.customer_email,
          subtotal: subtotal,
          discount_amount: saleData.discount_amount,
          total_amount: total,
          payment_method: saleData.payment_method,
          payment_status: saleData.payment_method === 'account' ? 'pending' : 'paid',
          paid_amount: saleData.payment_method === 'account' ? 0 : total,
          pending_amount: saleData.payment_method === 'account' ? total : 0,
          created_by: user!.id,
        }])
        .select()
        .single();

      if (saleError) throw saleError;

      // Crear los items de venta
      const saleItems = saleData.items.map(item => ({
        sale_id: sale.id,
        product_id: item.product_id,
        combo_id: item.combo_id,
        item_name: item.item_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      // Si hay múltiples métodos de pago, crear los registros de pago
      if (saleData.payments && saleData.payments.length > 0) {
        const payments = saleData.payments.map(payment => ({
          sale_id: sale.id,
          payment_method: payment.payment_method,
          amount: payment.amount,
          reference: payment.reference,
          notes: payment.notes,
        }));

        const { error: paymentsError } = await supabase
          .from('sale_payments')
          .insert(payments);

        if (paymentsError) throw paymentsError;
      }

      return sale;
    },
    onSuccess: (sale) => {
      toast({
        title: 'Venta completada',
        description: `Venta ${sale.sale_number} registrada correctamente`,
      });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products-with-stock'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error al procesar venta',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const getProductStock = async (productId: string) => {
    const { data } = await supabase.rpc('get_product_stock', { product_id: productId });
    return data || 0;
  };

  const checkComboStock = async (comboId: string) => {
    const { data } = await supabase.rpc('combo_has_stock', { combo_id: comboId });
    return data || false;
  };

  const getComboMaxQuantity = async (comboId: string) => {
    // Obtener los items del combo
    const { data: comboItems, error } = await supabase
      .from('combo_items')
      .select('product_id, quantity')
      .eq('combo_id', comboId);

    if (error || !comboItems) {
      console.error('Error obteniendo items del combo:', error);
      return 0;
    }

    let maxCombos = Infinity;

    // Para cada producto en el combo, calcular cuántos combos se pueden formar
    for (const item of comboItems) {
      const availableStock = await getProductStock(item.product_id);
      const combosFromThisProduct = Math.floor(availableStock / item.quantity);
      maxCombos = Math.min(maxCombos, combosFromThisProduct);
    }

    return maxCombos === Infinity ? 0 : maxCombos;
  };

  return {
    products,
    combos,
    customers,
    createSale: createSaleMutation.mutate,
    isCreatingSale: createSaleMutation.isPending,
    getProductStock,
    checkComboStock,
    getComboMaxQuantity,
  };
};
