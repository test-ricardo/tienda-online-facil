
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package, ShoppingCart, Users, TrendingUp, FileText, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductDialog from '@/components/inventory/ProductDialog';
import QuickInvoiceDialog from '@/components/purchases/QuickInvoiceDialog';
import SupplierDialog from '@/components/purchases/SupplierDialog';

const Dashboard = () => {
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showSupplierDialog, setShowSupplierDialog] = useState(false);

  const quickActions = [
    {
      title: 'Nuevo Producto',
      description: 'Agregar producto al inventario',
      icon: Package,
      action: () => setShowProductDialog(true),
      color: 'bg-blue-500'
    },
    {
      title: 'Factura de Compra',
      description: 'Registrar compra rápida',
      icon: FileText,
      action: () => setShowInvoiceDialog(true),
      color: 'bg-green-500'
    },
    {
      title: 'Nuevo Proveedor',
      description: 'Agregar proveedor',
      icon: Truck,
      action: () => setShowSupplierDialog(true),
      color: 'bg-purple-500'
    }
  ];

  const navigationCards = [
    {
      title: 'Inventario',
      description: 'Gestión de productos y stock',
      icon: Package,
      href: '/inventory',
      color: 'text-blue-600'
    },
    {
      title: 'Ventas',
      description: 'Punto de venta y clientes',
      icon: ShoppingCart,
      href: '/sales',
      color: 'text-green-600'
    },
    {
      title: 'Compras',
      description: 'Proveedores y facturas',
      icon: Truck,
      href: '/purchases',
      color: 'text-purple-600'
    },
    {
      title: 'Usuarios',
      description: 'Gestión de usuarios',
      icon: Users,
      href: '/users',
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Gestiona tu negocio desde aquí
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className={`${action.color} p-3 rounded-lg`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{action.title}</h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                      <Button onClick={action.action} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Módulos del Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {navigationCards.map((card, index) => {
              const IconComponent = card.icon;
              return (
                <Link key={index} to={card.href}>
                  <Card className="h-full hover:shadow-lg transition-all hover:scale-105">
                    <CardHeader className="text-center pb-4">
                      <div className="mx-auto mb-4">
                        <IconComponent className={`h-12 w-12 ${card.color}`} />
                      </div>
                      <CardTitle className="text-lg">{card.title}</CardTitle>
                      <CardDescription>{card.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                Productos en inventario
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventas del Día</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                Total vendido hoy
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Proveedores Activos</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                Proveedores registrados
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Crecimiento</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                Respecto al mes anterior
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Dialogs */}
        <ProductDialog
          open={showProductDialog}
          onOpenChange={setShowProductDialog}
          onSuccess={() => {
            setShowProductDialog(false);
          }}
        />

        <QuickInvoiceDialog
          open={showInvoiceDialog}
          onOpenChange={setShowInvoiceDialog}
          onSuccess={() => {
            setShowInvoiceDialog(false);
          }}
        />

        <SupplierDialog
          isOpen={showSupplierDialog}
          onClose={() => setShowSupplierDialog(false)}
        />
      </div>
    </div>
  );
};

export default Dashboard;
