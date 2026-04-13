import { useAuthStore } from "@/stores/useAuthStore";
import { Navigate, Outlet } from "react-router-dom";
import Loader from "@/components/loader.component";
import type { UserRole } from "@/types/entities";

interface RoleGuardProps {
  /** Danh sách roles được phép truy cập route này */
  roles: UserRole[];
  /** Redirect khi không đủ role (mặc định "/") */
  redirectTo?: string;
}

/**
 * Guard route theo role.
 * Dùng thay thế AdminRoute trong App.tsx khi cần kiểm soát truy cập
 * dựa theo role cụ thể (ADMIN, OWNER, ...).
 *
 * @example
 * <Route element={<RoleGuard roles={["ADMIN", "OWNER"]} />}>
 *   <Route path="/admin" element={<AdminPage />} />
 * </Route>
 */
const RoleGuard = ({ roles, redirectTo = "/" }: RoleGuardProps) => {
  const { user, loading, hasRole } = useAuthStore();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  const isAllowed = roles.some((role) => hasRole(role));
  if (!isAllowed) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default RoleGuard;
