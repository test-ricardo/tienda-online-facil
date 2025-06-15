import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Package, FolderOpen, Package2, Clock, BarChart3 } from 'lucide-react';
import StockTab from '@/components/inventory/StockTab';
import ProductsTab from '@/components/inventory/ProductsTab';
import CategoriesTab from '@/components/inventory/CategoriesTab';
import CombosTab from '@/components/inventory/CombosTab';
import ExpirationTab from '@/components/inventory/ExpirationTab';
import ReportsTab from '@/components/reports/ReportsTab';

const Inventory = () => {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState("stock");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Inventario</h1>
          <p className="text-gray-600 mt-2">
            Control de stock, productos, categorías y vencimientos
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="stock" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Stock
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Productos
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Categorías
            </TabsTrigger>
            <TabsTrigger value="combos" className="flex items-center gap-2">
              <Package2 className="h-4 w-4" />
              Combos
            </TabsTrigger>
            <TabsTrigger value="expiration" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Vencimientos
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Reportes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stock">
            <StockTab />
          </TabsContent>

          <TabsContent value="products">
            <ProductsTab />
          </TabsContent>

          <TabsContent value="categories">
            <CategoriesTab />
          </TabsContent>

          <TabsContent value="combos">
            <CombosTab />
          </TabsContent>

          <TabsContent value="expiration">
            <ExpirationTab />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Inventory;
