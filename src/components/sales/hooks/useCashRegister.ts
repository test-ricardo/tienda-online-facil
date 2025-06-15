
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CashRegisterState {
  isOpen: boolean;
  currentAmount: number;
  startTime: Date | null;
  endTime: Date | null;
  sessionId: string | null;
}

export const useCashRegister = () => {
  const { user } = useAuth();
  const [registerState, setRegisterState] = useState<CashRegisterState>({
    isOpen: false,
    currentAmount: 0,
    startTime: null,
    endTime: null,
    sessionId: null,
  });

  const [cashCount, setCashCount] = useState<{[key: number]: number}>({
    20000: 0,
    10000: 0,
    1000: 0,
    500: 0,
    200: 0,
    100: 0,
    50: 0,
    20: 0,
    10: 0,
    5: 0,
    1: 0,
  });

  const { toast } = useToast();

  // Load active session on mount
  useEffect(() => {
    loadActiveSession();
  }, []);

  const loadActiveSession = async () => {
    if (!user) return;

    try {
      const { data: session } = await supabase
        .from('cash_register_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'open')
        .order('start_time', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (session) {
        setRegisterState({
          isOpen: true,
          currentAmount: session.opening_amount,
          startTime: new Date(session.start_time),
          endTime: session.end_time ? new Date(session.end_time) : null,
          sessionId: session.id,
        });

        // Load cash counts for this session
        const { data: counts } = await supabase
          .from('cash_counts')
          .select('*')
          .eq('session_id', session.id);

        if (counts) {
          const newCashCount = { ...cashCount };
          counts.forEach(count => {
            newCashCount[count.denomination] = count.count;
          });
          setCashCount(newCashCount);
        }
      }
    } catch (error) {
      console.error('Error loading active session:', error);
    }
  };

  const calculateTotal = () => {
    return Object.entries(cashCount).reduce((total, [value, count]) => {
      return total + (parseInt(value) * count);
    }, 0);
  };

  const handleCountChange = async (value: number, newCount: number) => {
    if (!registerState.sessionId) return;

    const countValue = Math.max(0, newCount);
    
    setCashCount(prev => ({
      ...prev,
      [value]: countValue
    }));

    try {
      // Upsert cash count in database
      await supabase
        .from('cash_counts')
        .upsert({
          session_id: registerState.sessionId,
          denomination: value,
          count: countValue,
        }, {
          onConflict: 'session_id,denomination'
        });
    } catch (error) {
      console.error('Error updating cash count:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el conteo de efectivo',
        variant: 'destructive',
      });
    }
  };

  const handleOpenRegister = async (amount: number) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Usuario no autenticado',
        variant: 'destructive',
      });
      return false;
    }

    if (amount > 0) {
      try {
        const { data: session, error } = await supabase
          .from('cash_register_sessions')
          .insert({
            user_id: user.id,
            opening_amount: amount,
            status: 'open',
          })
          .select()
          .single();

        if (error) throw error;

        const now = new Date();
        setRegisterState({
          isOpen: true,
          currentAmount: amount,
          startTime: now,
          endTime: null,
          sessionId: session.id,
        });

        // Reset cash count
        setCashCount({
          20000: 0,
          10000: 0,
          1000: 0,
          500: 0,
          200: 0,
          100: 0,
          50: 0,
          20: 0,
          10: 0,
          5: 0,
          1: 0,
        });

        toast({
          title: 'Caja abierta',
          description: `Caja iniciada con $${amount.toFixed(2)} a las ${now.toLocaleTimeString()}`,
        });
        return true;
      } catch (error) {
        console.error('Error opening register:', error);
        toast({
          title: 'Error',
          description: 'No se pudo abrir la caja',
          variant: 'destructive',
        });
        return false;
      }
    } else {
      toast({
        title: 'Monto inválido',
        description: 'Ingresa un monto inicial válido',
        variant: 'destructive',
      });
      return false;
    }
  };

  const handleCloseRegister = async () => {
    if (!registerState.sessionId) return;

    const total = calculateTotal();
    const now = new Date();
    const difference = total - registerState.currentAmount;

    try {
      await supabase
        .from('cash_register_sessions')
        .update({
          status: 'closed',
          end_time: now.toISOString(),
          closing_amount: total,
          expected_amount: registerState.currentAmount,
          difference_amount: difference,
        })
        .eq('id', registerState.sessionId);

      setRegisterState(prev => ({
        ...prev,
        isOpen: false,
        endTime: now,
      }));
      
      toast({
        title: 'Caja cerrada',
        description: `Arqueo completado. Total contado: $${total.toFixed(2)}. Diferencia: $${difference.toFixed(2)}`,
      });
    } catch (error) {
      console.error('Error closing register:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cerrar la caja',
        variant: 'destructive',
      });
    }
  };

  return {
    registerState,
    cashCount,
    calculateTotal,
    handleCountChange,
    handleOpenRegister,
    handleCloseRegister,
  };
};
