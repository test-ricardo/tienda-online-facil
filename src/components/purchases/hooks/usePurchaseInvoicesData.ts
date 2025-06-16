
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePurchaseInvoicesData = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: invoices,
    isLoading,
    error
  } = useQuery({
    queryKey: ['purchase-invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_invoices')
        .select(`
          *,
          supplier:suppliers(name, contact_person),
          purchase_invoice_items(
            id,
            product_id,
            quantity,
            unit_cost,
            total_cost,
            expiration_date,
            batch_number,
            product:products(name, sku)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const createInvoice = useMutation({
    mutationFn: async (invoiceData) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Generar número de factura
      const { data: invoiceNumber } = await supabase.rpc('generate_purchase_invoice_number');
      
      const { data, error } = await supabase
        .from('purchase_invoices')
        .insert([{
          ...invoiceData,
          invoice_number: invoiceNumber,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-invoices'] });
      toast({
        title: "Factura creada",
        description: "La factura de compra ha sido creada exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear la factura.",
        variant: "destructive",
      });
    },
  });

  const updateInvoiceStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      const { data, error } = await supabase
        .from('purchase_invoices')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      toast({
        title: "Estado actualizado",
        description: "El estado de la factura ha sido actualizado.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la factura.",
        variant: "destructive",
      });
    },
  });

  return {
    invoices,
    isLoading,
    error,
    createInvoice: createInvoice.mutate,
    updateInvoiceStatus: (id, status) => updateInvoiceStatus.mutate({ id, status }),
  };
};
