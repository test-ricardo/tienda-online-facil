
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ShoppingCart } from 'lucide-react';
import CustomerSelector from './CustomerSelector';
import PaymentMethodSelector from './PaymentMethodSelector';

interface SaleConfigurationSectionProps {
  customerSelectorRef: React.RefObject<HTMLDivElement>;
  paymentMethodRef: React.RefObject<HTMLDivElement>;
  customers: any[];
  customerSelected: any;
  setCustomerSelected: (customer: any) => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  discount: number;
  setDiscount: (discount: number) => void;
  handleTabNavigation: (e: React.KeyboardEvent, nextRef: React.RefObject<any>) => void;
  handleCompleteSale: () => void;
}

const SaleConfigurationSection: React.FC<SaleConfigurationSectionProps> = ({
  customerSelectorRef,
  paymentMethodRef,
  customers,
  customerSelected,
  setCustomerSelected,
  paymentMethod,
  setPaymentMethod,
  discount,
  setDiscount,
  handleTabNavigation,
  handleCompleteSale,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Configuración de Venta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={customerSelectorRef} tabIndex={-1}>
          <CustomerSelector
            customers={customers}
            selectedCustomer={customerSelected}
            onSelectCustomer={setCustomerSelected}
            onKeyDown={(e) => handleTabNavigation(e, paymentMethodRef)}
          />
        </div>
        
        <div ref={paymentMethodRef} tabIndex={-1}>
          <PaymentMethodSelector
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            customerSelected={customerSelected}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Descuento (%)</label>
          <Input
            type="number"
            min="0"
            max="100"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            placeholder="0"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCompleteSale();
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SaleConfigurationSection;
