
import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreditCard, DollarSign, Smartphone, UserCheck, AlertTriangle } from 'lucide-react';

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

  const getAvailableCredit = (customer: any) => {
    const creditEnabled = (customer as any)?.credit_enabled ?? false;
    if (!creditEnabled) return 0;
    if (customer.current_balance >= 0) {
      return customer.credit_limit + customer.current_balance;
    }
    return Math.max(0, customer.credit_limit + customer.current_balance);
  };

  const canUseCredit = () => {
    const creditEnabled = (customerSelected as any)?.credit_enabled ?? false;
    return customerSelected && 
           customerSelected.is_active && 
           creditEnabled && 
           customerSelected.credit_limit > 0;
  };

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
            const isDisabled = method.requiresCustomer && (!customerSelected || !canUseCredit());
            
            return (
              <SelectItem 
                key={method.value} 
                value={method.value}
                disabled={isDisabled}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{method.label}</span>
                  {method.requiresCustomer && !customerSelected && (
                    <span className="text-xs text-gray-500">(Requiere cliente)</span>
                  )}
                  {method.requiresCustomer && customerSelected && !canUseCredit() && (
                    <span className="text-xs text-red-500">(Crédito no disponible)</span>
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      
      {paymentMethod === 'account' && customerSelected && (
        <div className="mt-2 space-y-2">
          {canUseCredit() ? (
            <div className="p-2 bg-green-50 border border-green-200 rounded text-sm">
              <p className="text-green-800 font-medium">
                Crédito disponible: ${getAvailableCredit(customerSelected).toFixed(2)}
              </p>
              <p className="text-green-600 text-xs">
                Límite: ${customerSelected.credit_limit.toFixed(2)} | 
                Balance actual: ${customerSelected.current_balance.toFixed(2)}
              </p>
            </div>
          ) : (
            <div className="p-2 bg-red-50 border border-red-200 rounded text-sm">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Ventas a cuenta no disponibles</span>
              </div>
              <div className="text-red-600 text-xs mt-1">
                {!(customerSelected as any)?.credit_enabled && "• Crédito deshabilitado para este cliente"}
                {(customerSelected as any)?.credit_enabled && customerSelected.credit_limit <= 0 && "• Sin límite de crédito configurado"}
                {!customerSelected.is_active && "• Cliente inactivo"}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
