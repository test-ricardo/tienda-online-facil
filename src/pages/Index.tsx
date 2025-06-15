
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, DollarSign, Users, BarChart3, Settings } from 'lucide-react';

const Index = () => {
  const { user, userRoles, hasRole } = useAuth();
  const navigate = useNavigate();

  const modules = [
    {
      title: 'Dashboard',
      description: 'Resumen general del sistema y métricas clave',
      icon: BarChart3,
      color: 'bg-blue-500',
      route: '/dashboard',
      visible: hasRole('admin') || hasRole('manager')
    },
    {
      title: 'Punto de Venta',
      description: 'Procesar ventas y transacciones',
      icon: DollarSign,
      color: 'bg-green-500',
      route: '/pos',
      visible: hasRole('admin') || hasRole('manager') || hasRole('cashier')
    },
    {
      title: 'Inventario',
      description: 'Gestionar productos y stock',
      icon: Package,
      color: 'bg-orange-500',
      route: '/inventory',
      visible: hasRole('admin') || hasRole('manager') || hasRole('inventory')
    },
    {
      title: 'Administración',
      description: 'Gestionar usuarios y configuración del sistema',
      icon: Settings,
      color: 'bg-purple-500',
      route: '/admin',
      visible: hasRole('admin')
    }
  ];

  const visibleModules = modules.filter(module => module.visible);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-100 rounded-full">
              <ShoppingCart className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bienvenido al Sistema de Supermercado
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Hola {user.email}
          </p>
          <div className="flex justify-center space-x-2">
            {userRoles.map((role) => (
              <span
                key={role}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  role === 'admin' ? 'bg-red-100 text-red-800' :
                  role === 'manager' ? 'bg-blue-100 text-blue-800' :
                  role === 'cashier' ? 'bg-green-100 text-green-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </span>
            ))}
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleModules.map((module, index) => {
            const Icon = module.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg ${module.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-gray-600">
                    {module.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigate(module.route)}
                    className="w-full"
                  >
                    Acceder
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Info */}
        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Sistema de Gestión Integral</CardTitle>
              <CardDescription>
                Plataforma completa para la administración de supermercados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">4</div>
                  <div className="text-sm text-gray-600">Módulos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">100%</div>
                  <div className="text-sm text-gray-600">Seguro</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">24/7</div>
                  <div className="text-sm text-gray-600">Disponible</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">∞</div>
                  <div className="text-sm text-gray-600">Escalable</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
