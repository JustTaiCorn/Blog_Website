import { Routes, Route, Outlet } from "react-router-dom";
import Navbar from "./components/navbar.component";
// import ProtectedRoute from "./components/auth/ProtectedRoute";

// Pages
// import HomePage from "./pages/home.page";
import SignInPage from "./pages/signin.page";
import SignUpPage from "./pages/signup.page";
import VerifyEmailPage from "./pages/verify-email.page";
import HomePage from "@/pages/home.page.tsx";
import ProtectedRoute from "@/components/auth/ProtectedRoute.tsx";
import {EditorPages} from "@/pages/editor.pages.tsx";
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

// Layout với Navbar
const MainLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

      {/* Routes với Navbar */}
      <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
        {/*  <Route path="/search/:query" element={<SearchPage />} />*/}
        {/*  <Route path="/user/:id" element={<ProfilePage />} />*/}
        {/*  <Route path="/blog/:blog_id" element={<BlogPage />} />*/}
        {/*    */}
          <Route element={<ProtectedRoute />}>
            <Route path="/editor" element={<EditorPages />} />
        {/*    <Route path="/editor/:blog_id" element={<EditorPage />} />*/}
        {/*    <Route path="/dashboard" element={<DashboardPage />} />*/}
        {/*    <Route path="/settings/edit-profile" element={<EditProfilePage />} />*/}
        {/*    <Route*/}
        {/*      path="/settings/change-password"*/}
        {/*      element={<ChangePasswordPage />}*/}
        {/*    />*/}
        {/*    <Route path="/dashboard/blogs" element={<ManageBlogsPage />} />*/}
        {/*    <Route*/}
        {/*      path="/dashboard/notifications"*/}
        {/*      element={<NotificationsPage />}*/}
        {/*    />*/}
          </Route>
        {/*  <Route path="*" element={<NotFoundPage />} />*/}
      </Route>
    </Routes>
  );
}

export default App;
