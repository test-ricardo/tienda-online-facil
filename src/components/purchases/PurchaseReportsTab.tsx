
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePurchaseStats } from './hooks/usePurchaseStats';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PurchaseReportsTab = () => {
  const { stats, isLoading } = usePurchaseStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent>
            <div className="text-center py-8">
              Cargando estadísticas...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statsData = stats?.[0] || {
    total_invoices: 0,
    total_amount: 0,
    pending_invoices: 0,
    pending_amount: 0,
    top_supplier: 'No hay datos',
    avg_invoice_amount: 0
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Facturas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.total_invoices || 0}</div>
            <p className="text-xs text-muted-foreground">Últimos 30 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Monto Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(statsData.total_amount || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Últimos 30 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Facturas Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.pending_invoices || 0}</div>
            <p className="text-xs text-muted-foreground">
              ${(statsData.pending_amount || 0).toFixed(2)} pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Promedio por Factura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(statsData.avg_invoice_amount || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Últimos 30 días</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Supplier */}
      <Card>
        <CardHeader>
          <CardTitle>Proveedor Principal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-semibold">
            {statsData.top_supplier || 'No hay datos'}
          </div>
          <p className="text-sm text-muted-foreground">
            Proveedor con mayor volumen de compras
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseReportsTab;
