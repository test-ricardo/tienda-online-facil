
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook para listar usuarios y roles, y mutar roles.
 */
export const useUsersAndRoles = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Listar todos los usuarios con sus perfiles y roles
  const { data: users, isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      // Buscar perfiles (id, email, nombre, avatar)
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url')
        .order('full_name');

      if (profileError) throw profileError;

      // Traer los roles de cada usuario
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Construir resultado combinando
      return profiles.map(profile => ({
        ...profile,
        roles: roles
          .filter(r => r.user_id === profile.id)
          .map(r => r.role),
      }));
    },
  });

  // Mutación para agregar rol
  const addRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      toast({ title: 'Rol asignado', description: 'Se asignó el rol correctamente.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Mutación para quitar rol
  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      toast({ title: 'Rol removido', description: 'Se removió el rol.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return {
    users,
    isLoading,
    addRole: addRoleMutation.mutateAsync,
    removeRole: removeRoleMutation.mutateAsync,
  };
};
