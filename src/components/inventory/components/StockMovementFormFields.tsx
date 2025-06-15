
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StockMovementFormFieldsProps {
  formData: {
    movement_type: string;
    quantity: string;
    expiration_date: string;
    batch_number: string;
    supplier: string;
    notes: string;
  };
  setFormData: (data: any) => void;
}

const StockMovementFormFields: React.FC<StockMovementFormFieldsProps> = ({
  formData,
  setFormData,
}) => {
  const movementTypes = [
    { value: 'entry', label: 'Entrada' },
    { value: 'exit', label: 'Salida' },
    { value: 'adjustment', label: 'Ajuste' },
    { value: 'waste', label: 'Merma' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="movement_type">Tipo de Movimiento *</Label>
          <Select 
            value={formData.movement_type} 
            onValueChange={(value) => setFormData({ ...formData, movement_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {movementTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantity">
            {formData.movement_type === 'adjustment' ? 'Stock Final Deseado *' : 'Cantidad *'}
          </Label>
          <Input
            id="quantity"
            type="number"
            step="0.001"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            required
            placeholder={formData.movement_type === 'adjustment' ? 'Ej: 10.5' : ''}
          />
        </div>
      </div>

      {(formData.movement_type === 'entry' || formData.movement_type === 'adjustment') && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiration_date">Fecha de Vencimiento</Label>
              <Input
                id="expiration_date"
                type="date"
                value={formData.expiration_date}
                onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch_number">Número de Lote</Label>
              <Input
                id="batch_number"
                value={formData.batch_number}
                onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="supplier">Proveedor</Label>
            <Input
              id="supplier"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
            />
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder={
            formData.movement_type === 'adjustment' 
              ? 'Motivo del ajuste...'
              : 'Observaciones adicionales...'
          }
        />
      </div>
    </div>
  );
};

export default StockMovementFormFields;
