
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Truck, DollarSign, BarChart3 } from 'lucide-react';
import SuppliersTab from '@/components/purchases/SuppliersTab';
import InvoicesTab from '@/components/purchases/InvoicesTab';
import PaymentsTab from '@/components/purchases/PaymentsTab';
import PurchaseReportsTab from '@/components/purchases/PurchaseReportsTab';

const Purchases = () => {
  const [activeTab, setActiveTab] = useState("invoices");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Compras</h1>
          <p className="text-gray-600 mt-2">
            Control de facturas, proveedores y pagos
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Facturas
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Proveedores
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Pagos
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Reportes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="invoices">
            <InvoicesTab />
          </TabsContent>

          <TabsContent value="suppliers">
            <SuppliersTab />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentsTab />
          </TabsContent>

          <TabsContent value="reports">
            <PurchaseReportsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Purchases;
