import { useEffect } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import Navbar from "./components/navbar.component";
// import ProtectedRoute from "./components/auth/ProtectedRoute";

// Pages
// import HomePage from "./pages/home.page";
import SignInPage from "./pages/signin.page";
import SignUpPage from "./pages/signup.page";
import VerifyEmailPage from "./pages/verify-email.page";
import HomePage from "@/pages/home.page.tsx";
import BlogPage from "@/pages/blog.page.tsx";
import ProtectedRoute from "@/components/auth/ProtectedRoute.tsx";
import { EditorPages } from "@/pages/editor.pages.tsx";
import ProfilePage from "@/pages/profile.page";
import MyBlogsPage from "@/pages/my-blogs.page";
import SearchPage from "@/pages/search.page";
import CategoryPage from "@/pages/category.page";
import NotificationPage from "@/pages/notification.page";
import AdminRoute from "@/components/auth/AdminRoute.tsx";
import RoleGuard from "@/components/guards/RoleGuard.tsx";
import AdminLayout from "@/components/layouts/AdminLayout.tsx";
import { UserRole } from "@/types/entities";

// Admin Pages
import DashboardOverview from "@/pages/admin/DashboardOverview.tsx";
import UserManagement from "@/pages/admin/UserManagement.tsx";
import CategoryManagement from "@/pages/admin/CategoryManagement.tsx";
import TagManagement from "@/pages/admin/TagManagement.tsx";
import BlogManagement from "@/pages/admin/BlogManagement.tsx";
import CommentManagement from "@/pages/admin/CommentManagement.tsx";
// import ProfilePage from "./pages/profile.page";
// import SearchPage from "./pages/search.page";
// import BlogPage from "./pages/blog.page";
// import EditorPage from "./pages/editor.pages";
// import DashboardPage from "./pages/dashboard.page";
// import EditProfilePage from "./pages/edit-profile.page";
// import ChangePasswordPage from "./pages/change-password.page";
// import ManageBlogsPage from "./pages/manage-blogs.page";
// import NotificationsPage from "./pages/notifications.page";
// import NotFoundPage from "./pages/404.page";
import { useSocketNotification } from "@/hooks/useSocketNotification";

// Layout với Navbar
const MainLayout = () => {
  useSocketNotification();

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

function App() {
  const { refresh } = useAuthStore();

  useEffect(() => {
    refresh();
  }, []);

  return (
    <Routes>
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

      {/* Routes với Navbar */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/blog/:blog_id" element={<BlogPage />} />
        {/*    */}
        <Route element={<ProtectedRoute />}>
          <Route path="/editor" element={<EditorPages />} />
          <Route path="/editor/:blog_id" element={<EditorPages />} />
          <Route path="/my-blogs" element={<MyBlogsPage />} />
          <Route path="/settings/profile" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationPage />} />
        </Route>
        <Route element={<RoleGuard roles={[UserRole.ADMIN, UserRole.OWNER]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<DashboardOverview />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/categories" element={<CategoryManagement />} />
            <Route path="/admin/tags" element={<TagManagement />} />
            <Route path="/admin/blogs" element={<BlogManagement />} />
            <Route path="/admin/comments" element={<CommentManagement />} />
          </Route>
        </Route>
        {/*  <Route path="*" element={<NotFoundPage />} />*/}
      </Route>
    </Routes>
  );
}

export default App;
