import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Users, FileText, CreditCard } from 'lucide-react';
import POSTab from '@/components/sales/POSTab';
import CustomersTab from '@/components/sales/CustomersTab';
import SalesHistoryTab from '@/components/sales/SalesHistoryTab';
import ReportsTab from '@/components/reports/ReportsTab';

const Sales = () => {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState("pos");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Ventas</h1>
          <p className="text-gray-600 mt-2">
            Punto de venta, gestión de clientes e historial de ventas
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pos" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Punto de Venta
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Clientes
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Historial de Ventas
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Reportes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pos">
            <POSTab />
          </TabsContent>

          <TabsContent value="customers">
            <CustomersTab />
          </TabsContent>

          <TabsContent value="history">
            <SalesHistoryTab />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Sales;
