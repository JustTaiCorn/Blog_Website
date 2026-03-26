import type { ReactNode } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import type { Permission } from "@/permissions/permissions";

interface PermissionGuardProps {
  permission: Permission;
  fallback?: ReactNode;
  children: ReactNode;
}
const PermissionGuard = ({
  permission,
  fallback = null,
  children,
}: PermissionGuardProps) => {
  const { hasPermission } = useAuthStore();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGuard;
