
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const ALL_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'cashier', label: 'Caja' },
  { value: 'inventory', label: 'Inventario' },
];

interface Props {
  roles: string[];
  onAdd: (role: string) => void;
  onRemove: (role: string) => void;
  disabled?: boolean;
}

export const UserRoleSelector: React.FC<Props> = ({ roles, onAdd, onRemove, disabled }) => (
  <div className="flex flex-wrap gap-2">
    {ALL_ROLES.map(r => (
      roles.includes(r.value) ? (
        <Badge key={r.value} variant="default" className="bg-green-500">
          {r.label}
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onRemove(r.value)}
            disabled={disabled || r.value === 'admin'} // Admin solo removible por otro admin
            className="ml-1 text-xs px-1 py-0"
            title="Quitar rol"
          >✕</Button>
        </Badge>
      ) : (
        <Button
          key={r.value}
          variant="outline"
          size="xs"
          onClick={() => onAdd(r.value)}
          disabled={disabled}
          className="text-xs"
          title="Agregar rol"
        >
          + {r.label}
        </Button>
      )
    ))}
  </div>
);
