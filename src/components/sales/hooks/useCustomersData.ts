
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateCustomerData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  document_type?: string;
  document_number?: string;
  credit_limit: number;
  notes?: string;
}

export const useCustomersData = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers-management'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: CreateCustomerData) => {
      const { data: customerCode } = await supabase.rpc('generate_customer_code');
      
      const { data, error } = await supabase
        .from('customers')
        .insert([{
          ...customerData,
          customer_code: customerCode,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Cliente creado',
        description: 'El cliente ha sido creado exitosamente',
      });
      queryClient.invalidateQueries({ queryKey: ['customers-management'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error al crear cliente',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, ...customerData }: CreateCustomerData & { id: string }) => {
      const { data, error } = await supabase
        .from('customers')
        .update(customerData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Cliente actualizado',
        description: 'Los datos del cliente han sido actualizados',
      });
      queryClient.invalidateQueries({ queryKey: ['customers-management'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error al actualizar cliente',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const toggleCustomerStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data, error } = await supabase
        .from('customers')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: data.is_active ? 'Cliente activado' : 'Cliente desactivado',
        description: `El cliente ha sido ${data.is_active ? 'activado' : 'desactivado'} exitosamente`,
      });
      queryClient.invalidateQueries({ queryKey: ['customers-management'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error al cambiar estado',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    customers,
    isLoading,
    createCustomer: createCustomerMutation.mutate,
    updateCustomer: updateCustomerMutation.mutate,
    toggleCustomerStatus: toggleCustomerStatusMutation.mutate,
    isCreating: createCustomerMutation.isPending,
    isUpdating: updateCustomerMutation.isPending,
  };
};
