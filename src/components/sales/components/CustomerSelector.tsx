
import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, UserPlus } from 'lucide-react';

interface CustomerSelectorProps {
  customers: any[];
  selectedCustomer: any;
  onSelectCustomer: (customer: any) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  customers,
  selectedCustomer,
  onSelectCustomer,
  onKeyDown,
}) => {
  return (
    <div>
      <Label className="text-sm font-medium">Cliente (Opcional)</Label>
      <Select 
        value={selectedCustomer?.id || "no-customer"} 
        onValueChange={(value) => {
          if (value === "no-customer") {
            onSelectCustomer(null);
          } else {
            const customer = customers.find(c => c.id === value);
            onSelectCustomer(customer || null);
          }
        }}
      >
        <SelectTrigger className="mt-1" onKeyDown={onKeyDown}>
          <SelectValue placeholder="Seleccionar cliente..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="no-customer">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span>Sin cliente</span>
            </div>
          </SelectItem>
          {customers.map((customer) => (
            <SelectItem key={customer.id} value={customer.id}>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <div className="flex flex-col">
                  <span>{customer.name}</span>
                  <span className="text-xs text-gray-500">
                    {customer.customer_code}
                    {customer.email && ` - ${customer.email}`}
                  </span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedCustomer && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
          <p className="text-blue-800">
            <strong>Cliente:</strong> {selectedCustomer.name}
          </p>
          {selectedCustomer.email && (
            <p className="text-blue-600 text-xs">{selectedCustomer.email}</p>
          )}
          {selectedCustomer.credit_limit > 0 && (
            <p className="text-blue-600 text-xs">
              Límite de crédito: ${selectedCustomer.credit_limit.toFixed(2)} | 
              Balance actual: ${selectedCustomer.current_balance.toFixed(2)}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerSelector;
