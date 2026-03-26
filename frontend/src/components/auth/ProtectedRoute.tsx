import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Loader from "@/components/loader.component.tsx";
import type { Permission } from "@/permissions/permissions";

interface ProtectedRouteProps {
  requiredPermission?: Permission;
  unauthorizedRedirect?: string;
}

const ProtectedRoute = ({
  requiredPermission,
  unauthorizedRedirect = "/",
}: ProtectedRouteProps = {}) => {
  const { accessToken, loading, refresh, fetchMe, hasPermission } =
    useAuthStore();
  const [initializing, setInitializing] = useState(true);

  const init = async () => {
    try {
      if (!accessToken) {
        await refresh();
      }
      const state = useAuthStore.getState();
      if (state.accessToken && !state.user) {
        await fetchMe();
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
    } finally {
      setInitializing(false);
    }
  };

  useEffect(() => {
    init();
  }, []);

  if (initializing || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  const currentToken = useAuthStore.getState().accessToken;
  if (!currentToken) {
    return <Navigate to="/signin" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to={unauthorizedRedirect} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
