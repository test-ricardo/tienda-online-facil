
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCustomersData } from '../hooks/useCustomersData';

interface QuickCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerCreated: (customer: any) => void;
}

const QuickCustomerDialog: React.FC<QuickCustomerDialogProps> = ({
  open,
  onOpenChange,
  onCustomerCreated,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const { createCustomer, isCreating } = useCustomersData();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    createCustomer({
      name: name.trim(),
      phone: phone.trim() || undefined,
      credit_limit: 0,
      credit_enabled: false,
    });

    // Reset form
    setName('');
    setPhone('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Cliente Rápido</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="quick-name">Nombre *</Label>
            <Input
              id="quick-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del cliente"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="quick-phone">Teléfono</Label>
            <Input
              id="quick-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Teléfono (opcional)"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating || !name.trim()}>
              {isCreating ? 'Creando...' : 'Crear Cliente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuickCustomerDialog;
