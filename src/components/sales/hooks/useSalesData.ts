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
        // Primero verificar que el cliente tenga crédito habilitado
        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .select('credit_enabled, credit_limit, current_balance, is_active')
          .eq('id', saleData.customer_id)
          .single();

        if (customerError) {
          throw new Error('Error al verificar información del cliente');
        }

        const isActive = (customer as any).is_active ?? false;
        const creditEnabled = (customer as any).credit_enabled ?? false;
        const creditLimit = (customer as any).credit_limit ?? 0;
        const currentBalance = (customer as any).current_balance ?? 0;

        if (!isActive) {
          throw new Error('El cliente no está activo');
        }

        if (!creditEnabled) {
          throw new Error('Las ventas a cuenta están deshabilitadas para este cliente');
        }

        if (creditLimit <= 0) {
          throw new Error('El cliente no tiene límite de crédito configurado');
        }

        // Verificar límite de crédito disponible
        const availableCredit = currentBalance >= 0 
          ? creditLimit + currentBalance 
          : Math.max(0, creditLimit + currentBalance);

        if (total > availableCredit) {
          throw new Error(`El monto excede el crédito disponible. Disponible: $${availableCredit.toFixed(2)}, Requerido: $${total.toFixed(2)}`);
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
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers-management'] });
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

  // Función mejorada para cancelar una venta con validaciones
  const cancelSaleMutation = useMutation({
    mutationFn: async (saleId: string) => {
      // Obtener la venta actual
      const { data: sale, error: fetchError } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items (*)
        `)
        .eq('id', saleId)
        .single();
        
      if (fetchError || !sale) {
        throw new Error('No se pudo obtener la venta');
      }

      // Validar que se puede cancelar
      const saleDate = new Date(sale.created_at);
      const today = new Date();
      const isToday = saleDate.toDateString() === today.toDateString();
      
      if (!isToday) {
        throw new Error('Solo se pueden cancelar ventas del día actual');
      }

      if (sale.sale_status === 'cancelled') {
        throw new Error('Esta venta ya está cancelada');
      }

      const allowedMethods = ['cash', 'card', 'transfer'];
      if (!allowedMethods.includes(sale.payment_method)) {
        throw new Error('No se pueden cancelar ventas a cuenta o métodos mixtos');
      }

      // Actualizar el estado de la venta
      const { error: updateError } = await supabase
        .from('sales')
        .update({ 
          sale_status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', saleId);

      if (updateError) throw updateError;

      return sale;
    },
    onSuccess: (sale) => {
      toast({
        title: 'Venta cancelada',
        description: `La venta ${sale.sale_number} fue cancelada correctamente`,
      });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sales-history'] });
      queryClient.invalidateQueries({ queryKey: ['products-with-stock'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error al cancelar venta',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Nueva función para verificar que la caja esté abierta
  const isCashRegisterOpen = async (): Promise<boolean> => {
    if (!user) return false;
    const { data: session, error } = await supabase
      .from('cash_register_sessions')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'open')
      .maybeSingle();
    return !!session;
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
    cancelSale: cancelSaleMutation.mutateAsync,
    isCancelingSale: cancelSaleMutation.isPending,
    isCashRegisterOpen,
  };
};
