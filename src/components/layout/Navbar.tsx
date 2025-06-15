
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingCart, User, LogOut, Shield, Users, Package, DollarSign } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, signOut, userRoles, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'cashier': return 'bg-green-100 text-green-800';
      case 'inventory': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-3 w-3" />;
      case 'manager': return <Users className="h-3 w-3" />;
      case 'cashier': return <DollarSign className="h-3 w-3" />;
      case 'inventory': return <Package className="h-3 w-3" />;
      default: return <User className="h-3 w-3" />;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">SuperMarket Pro</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* Navigation Links based on roles */}
            <div className="hidden md:flex items-center space-x-4">
              {(hasRole('admin') || hasRole('manager')) && (
                <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </Link>
              )}
              
              {(hasRole('admin') || hasRole('manager') || hasRole('inventory')) && (
                <Link to="/inventory" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Inventario
                </Link>
              )}
              
              {(hasRole('admin') || hasRole('manager') || hasRole('cashier')) && (
                <Link to="/pos" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Punto de Venta
                </Link>
              )}
              
              {hasRole('admin') && (
                <Link to="/admin" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Administración
                </Link>
              )}
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-gray-900">
                  {user.email}
                </div>
                <div className="flex space-x-1 mt-1">
                  {userRoles.map((role) => (
                    <span
                      key={role}
                      className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(role)}`}
                    >
                      {getRoleIcon(role)}
                      <span className="capitalize">{role}</span>
                    </span>
                  ))}
                </div>
              </div>
              
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
