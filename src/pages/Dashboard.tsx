
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Package, DollarSign, Users, TrendingUp, AlertCircle, FileText, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QuickInvoiceDialog from '@/components/purchases/QuickInvoiceDialog';

const Dashboard = () => {
  const { user, userRoles, hasRole } = useAuth();
  const navigate = useNavigate();
  const [showQuickInvoice, setShowQuickInvoice] = useState(false);

  const stats = [
    {
      title: 'Ventas Hoy',
      value: '$12,450',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+12.5%',
      visible: hasRole('admin') || hasRole('manager') || hasRole('cashier')
    },
    {
      title: 'Productos en Stock',
      value: '1,234',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '-2.1%',
      visible: hasRole('admin') || hasRole('manager') || hasRole('inventory')
    },
    {
      title: 'Clientes Activos',
      value: '89',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+5.7%',
      visible: hasRole('admin') || hasRole('manager')
    },
    {
      title: 'Productos Críticos',
      value: '12',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      change: '+3',
      visible: hasRole('admin') || hasRole('manager') || hasRole('inventory')
    },
  ];

  const visibleStats = stats.filter(stat => stat.visible);

  const handleQuickInvoiceSuccess = () => {
    // Podríamos refrescar estadísticas aquí si fuera necesario
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Bienvenido, {user?.email} | Roles: {userRoles.map(role => role.charAt(0).toUpperCase() + role.slice(1)).join(', ')}
          </p>
        </div>

        {/* Quick Actions Bar */}
        {(hasRole('admin') || hasRole('manager') || hasRole('inventory')) && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Acciones Rápidas
                </CardTitle>
                <CardDescription>
                  Accesos directos a las funciones más utilizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button 
                    onClick={() => setShowQuickInvoice(true)}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Cargar Factura de Compra
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/inventory')}
                    className="flex items-center gap-2"
                  >
                    <Package className="h-4 w-4" />
                    Gestionar Inventario
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/purchases')}
                    className="flex items-center gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Ver Compras
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {visibleStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'} mt-1`}>
                        {stat.change} vs mes anterior
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          {(hasRole('admin') || hasRole('manager')) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Actividad Reciente
                </CardTitle>
                <CardDescription>
                  Últimas transacciones del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">Venta #1234</p>
                      <p className="text-sm text-gray-600">Hace 2 minutos</p>
                    </div>
                    <span className="text-green-600 font-medium">+$45.50</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">Entrada de Inventario</p>
                      <p className="text-sm text-gray-600">Hace 1 hora</p>
                    </div>
                    <span className="text-blue-600 font-medium">+50 unidades</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Venta #1233</p>
                      <p className="text-sm text-gray-600">Hace 2 horas</p>
                    </div>
                    <span className="text-green-600 font-medium">+$127.80</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Navegación Rápida
              </CardTitle>
              <CardDescription>
                Accede rápidamente a las secciones principales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(hasRole('admin') || hasRole('manager') || hasRole('cashier')) && (
                  <button 
                    onClick={() => navigate('/sales')}
                    className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <div className="font-medium text-green-800">Punto de Venta</div>
                    <div className="text-sm text-green-600">Procesar transacciones</div>
                  </button>
                )}
                
                {(hasRole('admin') || hasRole('manager') || hasRole('inventory')) && (
                  <button 
                    onClick={() => navigate('/inventory')}
                    className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <div className="font-medium text-blue-800">Inventario</div>
                    <div className="text-sm text-blue-600">Gestionar productos y stock</div>
                  </button>
                )}

                {(hasRole('admin') || hasRole('manager') || hasRole('inventory')) && (
                  <button 
                    onClick={() => navigate('/purchases')}
                    className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                  >
                    <div className="font-medium text-purple-800">Compras</div>
                    <div className="text-sm text-purple-600">Gestionar proveedores y facturas</div>
                  </button>
                )}
                
                {hasRole('admin') && (
                  <button 
                    onClick={() => navigate('/admin')}
                    className="w-full text-left p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <div className="font-medium text-red-800">Administración</div>
                    <div className="text-sm text-red-600">Gestionar usuarios y permisos</div>
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <QuickInvoiceDialog
          open={showQuickInvoice}
          onOpenChange={setShowQuickInvoice}
          onSuccess={handleQuickInvoiceSuccess}
        />
      </div>
    </div>
  );
};

export default Dashboard;
