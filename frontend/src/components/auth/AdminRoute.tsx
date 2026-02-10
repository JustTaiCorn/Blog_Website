import { useAuthStore } from "@/stores/useAuthStore";
import { Navigate, Outlet } from "react-router-dom";
import Loader from "@/components/loader.component.tsx";

const AdminRoute = () => {
  const { user, loading, isAdmin } = useAuthStore();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!user || !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
