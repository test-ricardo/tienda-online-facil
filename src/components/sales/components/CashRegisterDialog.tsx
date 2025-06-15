
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown, Calculator, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CashRegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CashRegisterDialog: React.FC<CashRegisterDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [initialAmount, setInitialAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState(1500); // Ejemplo
  const [denomination, setDenomination] = useState('');
  const [quantity, setQuantity] = useState('');
  const { toast } = useToast();

  const denominations = [
    { value: 1000, label: '$1000', color: 'bg-purple-100 text-purple-800' },
    { value: 500, label: '$500', color: 'bg-blue-100 text-blue-800' },
    { value: 200, label: '$200', color: 'bg-green-100 text-green-800' },
    { value: 100, label: '$100', color: 'bg-yellow-100 text-yellow-800' },
    { value: 50, label: '$50', color: 'bg-orange-100 text-orange-800' },
    { value: 20, label: '$20', color: 'bg-red-100 text-red-800' },
    { value: 10, label: '$10', color: 'bg-gray-100 text-gray-800' },
    { value: 5, label: '$5', color: 'bg-indigo-100 text-indigo-800' },
    { value: 1, label: '$1', color: 'bg-pink-100 text-pink-800' },
  ];

  const [cashCount, setCashCount] = useState<{[key: number]: number}>({
    1000: 2,
    500: 3,
    200: 5,
    100: 10,
    50: 8,
    20: 15,
    10: 20,
    5: 10,
    1: 25,
  });

  const calculateTotal = () => {
    return Object.entries(cashCount).reduce((total, [value, count]) => {
      return total + (parseInt(value) * count);
    }, 0);
  };

  const handleCountChange = (value: number, newCount: number) => {
    setCashCount(prev => ({
      ...prev,
      [value]: Math.max(0, newCount)
    }));
  };

  const handleOpenRegister = () => {
    const amount = parseFloat(initialAmount);
    if (amount > 0) {
      setCurrentAmount(amount);
      toast({
        title: 'Caja abierta',
        description: `Caja iniciada con $${amount.toFixed(2)}`,
      });
    }
  };

  const handleCloseRegister = () => {
    const total = calculateTotal();
    toast({
      title: 'Arqueo de caja',
      description: `Total contado: $${total.toFixed(2)}`,
    });
  };

  const salesData = {
    todaySales: 2450.75,
    totalTransactions: 45,
    cashSales: 1890.50,
    cardSales: 560.25,
    averageTicket: 54.46,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Gestión de Caja
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="register" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="register">Caja</TabsTrigger>
            <TabsTrigger value="count">Arqueo</TabsTrigger>
            <TabsTrigger value="sales">Ventas del Día</TabsTrigger>
          </TabsList>

          <TabsContent value="register" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estado de Caja</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      ${currentAmount.toFixed(2)}
                    </div>
                    <p className="text-gray-600">Efectivo en caja</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Badge variant="outline" className="w-full justify-center py-2">
                      <Clock className="h-4 w-4 mr-2" />
                      Turno iniciado: 08:00 AM
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Operaciones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="initial-amount">Monto inicial</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="initial-amount"
                        type="number"
                        step="0.01"
                        value={initialAmount}
                        onChange={(e) => setInitialAmount(e.target.value)}
                        placeholder="0.00"
                      />
                      <Button onClick={handleOpenRegister}>
                        Abrir Caja
                      </Button>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    onClick={handleCloseRegister}
                    className="w-full"
                  >
                    Cerrar Caja
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="count" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Arqueo de Caja</CardTitle>
                <p className="text-sm text-gray-600">
                  Cuenta el efectivo disponible en la caja
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {denominations.map((denom) => (
                    <div key={denom.value} className="space-y-2">
                      <Badge className={denom.color} variant="secondary">
                        {denom.label}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCountChange(denom.value, cashCount[denom.value] - 1)}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          min="0"
                          value={cashCount[denom.value] || 0}
                          onChange={(e) => handleCountChange(denom.value, parseInt(e.target.value) || 0)}
                          className="w-16 text-center"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCountChange(denom.value, cashCount[denom.value] + 1)}
                        >
                          +
                        </Button>
                      </div>
                      <p className="text-xs text-gray-600 text-center">
                        ${(denom.value * (cashCount[denom.value] || 0)).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Total Contado:</span>
                    <span className="text-green-600">${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
                    <span>Diferencia:</span>
                    <span className={calculateTotal() >= currentAmount ? 'text-green-600' : 'text-red-600'}>
                      ${(calculateTotal() - currentAmount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Ventas del Día
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-2xl font-bold">${salesData.todaySales.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Transacciones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-blue-600" />
                    <span className="text-2xl font-bold">{salesData.totalTransactions}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Ticket Promedio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                    <span className="text-2xl font-bold">${salesData.averageTicket.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Ventas por Método de Pago
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      Efectivo
                    </span>
                    <span className="font-bold">${salesData.cashSales.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-blue-600" />
                      Tarjetas
                    </span>
                    <span className="font-bold">${salesData.cardSales.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CashRegisterDialog;
