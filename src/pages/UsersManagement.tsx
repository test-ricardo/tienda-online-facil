
import React from "react";
import { UsersRolesTab } from "@/components/admin/UsersRolesTab";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const UsersManagement: React.FC = () => (
  <ProtectedRoute requiredRoles={["admin"]}>
    <UsersRolesTab />
  </ProtectedRoute>
);

export default UsersManagement;
