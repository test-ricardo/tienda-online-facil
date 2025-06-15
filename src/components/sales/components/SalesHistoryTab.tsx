import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSalesData } from '../hooks/useSalesData';
import { Button } from '@/components/ui/button';

const SalesHistoryTab = () => {
  const [sales, setSales] = useState<any[] | null>(null);
  const { user } = useAuth();
  const { cancelSale, isCreatingSale } = useSalesData();

  useEffect(() => {
    const fetchSales = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sales:', error);
      } else {
        setSales(data);
      }
    };

    fetchSales();
  }, [user]);

  return (
    <div>
      {sales?.map((sale) => (
        <div key={sale.id} className="border p-2 mb-2 flex items-center justify-between gap-2">
          {/* ... detalles de la venta ... */}
          <div>
            {sale.sale_status !== "cancelled" && (
              <Button
                variant="destructive"
                size="sm"
                disabled={isCreatingSale}
                onClick={() => {
                  if(confirm('¿Cancelar esta venta?\nEsto revertirá inventario y movimientos asociados.')) {
                    cancelSale(sale.id);
                  }
                }}
              >
                Cancelar venta
              </Button>
            )}
            {sale.sale_status === "cancelled" && (
              <span className="text-sm text-red-500 font-bold ml-2">CANCELADA</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SalesHistoryTab;
