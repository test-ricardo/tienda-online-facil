import React from "react";
import { useUsersAndRoles } from "./hooks/useUsersAndRoles";
import { UserRoleSelector } from "./UserRoleSelector";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const UsersRolesTab: React.FC = () => {
  const { users, isLoading, addRole, removeRole } = useUsersAndRoles();
  const { user: currentUser, hasRole } = useAuth();

  if (!hasRole("admin")) {
    return (
      <div className="text-red-500 py-8">Solo administradores pueden gestionar usuarios y roles.</div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-8 space-y-6">
      <h1 className="text-2xl font-bold">Gestión de usuarios y roles</h1>
      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin" /> Cargando usuarios...
        </div>
      )}
      <div className="space-y-4">
        {users?.map(u => (
          <Card key={u.id} className="flex items-center gap-4 p-4">
            <Avatar>
              <AvatarImage src={u.avatar_url || undefined} />
              <AvatarFallback>{u.full_name?.slice(0, 2) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-semibold">{u.full_name}</div>
              <div className="text-xs text-muted-foreground">{u.email}</div>
            </div>
            <UserRoleSelector
              roles={u.roles}
              disabled={currentUser?.id === u.id}
              onAdd={(role) => addRole({ userId: u.id, role })}
              onRemove={(role) => removeRole({ userId: u.id, role })}
            />
          </Card>
        ))}
      </div>
    </div>
  );
};
