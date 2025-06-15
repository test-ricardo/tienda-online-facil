
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Plus, Edit, UserCheck, UserX, CreditCard } from 'lucide-react';
import { useCustomersData } from './hooks/useCustomersData';
import CustomerForm from './components/CustomerForm';

const CustomersTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  
  const {
    customers,
    isLoading,
    createCustomer,
    updateCustomer,
    toggleCustomerStatus,
    isCreating,
    isUpdating,
  } = useCustomersData();

  const filteredCustomers = customers?.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.customer_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const handleCreateCustomer = async (data: any) => {
    await createCustomer(data);
    setShowForm(false);
  };

  const handleUpdateCustomer = async (data: any) => {
    if (editingCustomer) {
      await updateCustomer({ ...data, id: editingCustomer.id });
      setEditingCustomer(null);
      setShowForm(false);
    }
  };

  const handleEditCustomer = (customer: any) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleToggleStatus = (customer: any) => {
    toggleCustomerStatus({ id: customer.id, isActive: !customer.is_active });
  };

  return (
    <div className="space-y-6">
      {/* Header con búsqueda y botón nuevo */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Gestión de Clientes</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Administra información de clientes y límites de crédito
              </p>
            </div>
            <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Cliente
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, código o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabla de clientes */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Cargando clientes...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Crédito</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.customer_code}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {customer.email && <div>{customer.email}</div>}
                        {customer.phone && <div className="text-gray-500">{customer.phone}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        ${customer.credit_limit?.toFixed(2) || '0.00'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`font-medium ${
                        customer.current_balance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${customer.current_balance?.toFixed(2) || '0.00'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.is_active ? 'default' : 'secondary'}>
                        {customer.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCustomer(customer)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(customer)}
                          className={customer.is_active ? 'text-red-600' : 'text-green-600'}
                        >
                          {customer.is_active ? (
                            <UserX className="h-3 w-3" />
                          ) : (
                            <UserCheck className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de formulario */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
            </DialogTitle>
          </DialogHeader>
          <CustomerForm
            customer={editingCustomer}
            onSubmit={editingCustomer ? handleUpdateCustomer : handleCreateCustomer}
            onCancel={() => {
              setShowForm(false);
              setEditingCustomer(null);
            }}
            isLoading={isCreating || isUpdating}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomersTab;
