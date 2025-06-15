
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const ALL_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'cashier', label: 'Caja' },
  { value: 'inventory', label: 'Inventario' },
] as const;

type RoleValue = typeof ALL_ROLES[number]["value"];

interface Props {
  roles: RoleValue[];
  onAdd: (role: RoleValue) => void;
  onRemove: (role: RoleValue) => void;
  disabled?: boolean;
}

export const UserRoleSelector: React.FC<Props> = ({ roles, onAdd, onRemove, disabled }) => (
  <div className="flex flex-wrap gap-2">
    {ALL_ROLES.map(r => (
      roles.includes(r.value) ? (
        <Badge key={r.value} variant="default" className="bg-green-500 flex items-center">
          {r.label}
          <Button
            variant="ghost"
            size="sm"
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
          size="sm"
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
