
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, Plus, Search } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  customer_code: string;
  current_balance: number;
  credit_limit: number;
}

interface CustomerSelectorProps {
  customers: Customer[];
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer | null) => void;
}

const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  customers,
  selectedCustomer,
  onSelectCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.customer_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectCustomer = (customer: Customer) => {
    onSelectCustomer(customer);
    setShowDialog(false);
    setSearchTerm('');
  };

  return (
    <div>
      <Label className="text-sm font-medium">Cliente (Opcional)</Label>
      <div className="flex gap-2 mt-1">
        <div className="flex-1">
          {selectedCustomer ? (
            <div className="p-2 bg-blue-50 rounded border">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm">{selectedCustomer.name}</p>
                  <p className="text-xs text-gray-600">{selectedCustomer.customer_code}</p>
                  {selectedCustomer.current_balance !== 0 && (
                    <p className={`text-xs ${selectedCustomer.current_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      Balance: ${selectedCustomer.current_balance.toFixed(2)}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onSelectCustomer(null)}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowDialog(true)}
              className="w-full justify-start"
            >
              <User className="h-4 w-4 mr-2" />
              Seleccionar Cliente
            </Button>
          )}
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Seleccionar Cliente</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => handleSelectCustomer(customer)}
                  className="p-3 border rounded cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-gray-600">{customer.customer_code}</p>
                      {customer.email && (
                        <p className="text-xs text-gray-500">{customer.email}</p>
                      )}
                    </div>
                    <div className="text-right">
                      {customer.current_balance !== 0 && (
                        <p className={`text-sm ${customer.current_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${customer.current_balance.toFixed(2)}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Límite: ${customer.credit_limit.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredCustomers.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  No se encontraron clientes
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerSelector;
