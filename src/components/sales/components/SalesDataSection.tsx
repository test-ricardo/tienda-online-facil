
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, Calculator } from 'lucide-react';

const SalesDataSection: React.FC = () => {
  // Simular datos de ventas (en una implementación real vendrían de la base de datos)
  const salesData = {
    todaySales: 2450.75,
    totalTransactions: 45,
    cashSales: 1890.50,
    cardSales: 560.25,
    averageTicket: 54.46,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">
            Ventas del Día
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-2xl font-bold">${salesData.todaySales.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">
            Transacciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-blue-600" />
            <span className="text-2xl font-bold">{salesData.totalTransactions}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">
            Ticket Promedio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <span className="text-2xl font-bold">${salesData.averageTicket.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">
            Ventas por Método de Pago
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Efectivo
            </span>
            <span className="font-bold">${salesData.cashSales.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-blue-600" />
              Tarjetas
            </span>
            <span className="font-bold">${salesData.cardSales.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesDataSection;
