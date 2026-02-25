import { NavLink, Outlet } from "react-router-dom";
import {
  BarChart3,
  Users,
  Tag,
  LayoutGrid,
  FileText,
  ChevronRight,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";

const AdminLayout = () => {
  const sidebarLinks = [
    { name: "Tổng quan", path: "/admin", icon: <BarChart3 size={20} /> },
    { name: "Người dùng", path: "/admin/users", icon: <Users size={20} /> },
    {
      name: "Danh mục",
      path: "/admin/categories",
      icon: <LayoutGrid size={20} />,
    },
    { name: "Tag", path: "/admin/tags", icon: <Tag size={20} /> },
    { name: "Bài viết", path: "/admin/blogs", icon: <FileText size={20} /> },
    {
      name: "Bình luận",
      path: "/admin/comments",
      icon: <MessageSquare size={20} />,
    },
  ];

  return (
    <div className="flex min-h-[calc(100vh-80px)] bg-grey/10">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-white border-r border-grey/20 flex flex-col sticky top-20 h-[calc(100vh-80px)]">
        <div className="p-6 border-b border-grey/10">
          <div className="flex items-center gap-2 text-dark-grey font-bold">
            <ShieldCheck className="text-twitter" />
            <span>Admin Control</span>
          </div>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === "/admin"}
              className={({ isActive }) =>
                `flex items-center justify-between p-3 rounded-md transition-all duration-200 ${
                  isActive
                    ? "bg-grey/20 text-black font-medium"
                    : "text-dark-grey hover:bg-grey/10 hover:text-black"
                }`
              }
            >
              <div className="flex items-center gap-3">
                {link.icon}
                <span>{link.name}</span>
              </div>
              <ChevronRight
                size={16}
                className="opacity-0 group-hover:opacity-100"
              />
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-grey/10 text-center">
          <NavLink to="/" className="text-dark-grey hover:underline text-sm">
            Quay lại Trang chủ
          </NavLink>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
