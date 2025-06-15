
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Lógica de registro de cancelación
async function logSaleCancellation({ sale, userId, userRole, reason, notes }: {
  sale: any;
  userId: string;
  userRole: string;
  reason?: string;
  notes?: string;
}) {
  await supabase.from('sale_cancellations').insert([{
    sale_id: sale.id,
    cancelled_by: userId,
    cancellation_reason: reason,
    original_total: sale.total_amount,
    user_role: userRole,
    notes,
  }]);
}

export const useCancelSale = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Helper: obtener roles del usuario actual
  const getUserRoles = async () => {
    if (!user) return [];
    const { data: roles } = await supabase.rpc('get_user_roles', { _user_id: user.id });
    return roles ?? [];
  };

  return useMutation({
    mutationFn: async ({
      saleId,
      reason,
      notes,
    }: {
      saleId: string;
      reason?: string;
      notes?: string;
    }) => {
      if (!user) throw new Error('No autenticado');

      // Buscar venta
      const { data: sale, error: fetchError } = await supabase
        .from('sales')
        .select(`*, sale_items(*)`)
        .eq('id', saleId)
        .single();
      if (fetchError || !sale) {
        throw new Error('No se pudo obtener la venta');
      }

      // Obtener roles
      const roles = await getUserRoles();
      const hasPrivileges = roles.includes('admin') || roles.includes('manager');

      // Solo admin/manager puede cancelar ventas de AYER o de caja cerrada
      const saleDate = new Date(sale.created_at);
      const now = new Date();
      const diffMs = now.getTime() - saleDate.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      // Solo admin/manager pueden cancelar ventas de hasta 1 día, sin importar caja
      if (hasPrivileges) {
        if (diffHours > 24) throw new Error('Solo pueden cancelarse ventas de hasta 1 día de antigüedad');
        // OK (no importa si caja cerrada)
      } else {
        // Solo puede cancelar si: es el creador, la caja está abierta y es venta del día
        if (sale.created_by !== user.id) {
          throw new Error('Solo puede cancelar esta venta el administrador o quien la realizó');
        }
        // ¿Caja abierta?
        const { data: session } = await supabase
          .from('cash_register_sessions')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'open')
          .maybeSingle();
        if (!session) {
          throw new Error('Debes tener la caja abierta para cancelar tu propia venta');
        }
        // ¿Es venta del día?
        if (saleDate.toDateString() !== now.toDateString()) {
          throw new Error('Solo se pueden cancelar ventas del día actual');
        }
      }

      // No cancelar si ya está cancelada
      if (sale.sale_status === 'cancelled') throw new Error('Esta venta ya está cancelada');
      // Métodos válidos
      const allowedMethods = ['cash', 'card', 'transfer'];
      if (!allowedMethods.includes(sale.payment_method)) {
        throw new Error('No se pueden cancelar ventas a cuenta o métodos mixtos');
      }

      // Actualizar venta
      const { error: updateError } = await supabase
        .from('sales')
        .update({ sale_status: 'cancelled' })
        .eq('id', saleId);
      if (updateError) throw updateError;

      // Registrar la cancelación
      await logSaleCancellation({
        sale,
        userId: user.id,
        userRole: hasPrivileges ? (roles.includes('admin') ? 'admin' : 'manager') : 'cashier',
        reason,
        notes,
      });

      return { sale_number: sale.sale_number };
    },
    onSuccess: (res) => {
      toast({
        title: 'Venta cancelada',
        description: `La venta ${res.sale_number} fue cancelada correctamente y registrada.`,
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
};

