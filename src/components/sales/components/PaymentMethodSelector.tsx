
import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreditCard, DollarSign, Smartphone, UserCheck } from 'lucide-react';

interface PaymentMethodSelectorProps {
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  customerSelected: any;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  paymentMethod,
  onPaymentMethodChange,
  customerSelected,
}) => {
  const paymentMethods = [
    { value: 'cash', label: 'Efectivo', icon: DollarSign },
    { value: 'card', label: 'Tarjeta', icon: CreditCard },
    { value: 'transfer', label: 'Transferencia', icon: Smartphone },
    { value: 'account', label: 'A Cuenta', icon: UserCheck, requiresCustomer: true },
  ];

  return (
    <div>
      <Label className="text-sm font-medium">Método de Pago</Label>
      <Select value={paymentMethod} onValueChange={onPaymentMethodChange}>
        <SelectTrigger className="mt-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isDisabled = method.requiresCustomer && !customerSelected;
            
            return (
              <SelectItem 
                key={method.value} 
                value={method.value}
                disabled={isDisabled}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{method.label}</span>
                  {isDisabled && (
                    <span className="text-xs text-gray-500">(Requiere cliente)</span>
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      
      {paymentMethod === 'account' && customerSelected && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
          <p className="text-yellow-800">
            <strong>Crédito disponible:</strong> $
            {(customerSelected.credit_limit + Math.max(0, customerSelected.current_balance)).toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
