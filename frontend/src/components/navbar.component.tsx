import { useState } from "react";
import {
  Search,
  Bell,
  PenSquare,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  FileText,
} from "lucide-react";
import logo from "@/imgs/logo.png";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "@/components/Search-bar.component.tsx";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";
import PermissionGuard from "@/components/guards/PermissionGuard";
import { Permission } from "@/permissions/permissions";

const Navbar = () => {
  const [searchBoxVisible, setSearchBoxVisible] = useState(false);
  const navigate = useNavigate();

  const { user, signOut } = useAuthStore();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="bg-white sticky top-0 z-50 py-1 md:py-2 px-2 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side: Logo + Search */}
          <div className="flex items-center gap-4">
            <Link
              to="/"
              replace={false}
              className="text-2xl font-bold flex-shrink-0"
            >
              <img src={logo} alt="logo" className="w-10 h-10 object-cover" />
            </Link>
            {/* Desktop Search */}
            <SearchBar className="hidden md:block" />
          </div>

          {/* Right side: Write, Notification, User */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Button */}
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setSearchBoxVisible(!searchBoxVisible)}
            >
              <Search className="w-5 h-5 text-gray-600" />
            </button>

            {/* Write Button - Desktop */}
            <Button
              onClick={() => navigate("/editor")}
              variant="default"
              className="hidden md:flex items-center gap-2 rounded-full"
            >
              <PenSquare className="w-4 h-4" />
              Write
            </Button>

            {/* Notification Button */}
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            {user ? (
              <>
                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 hover:bg-gray-100 rounded-full transition-colors focus:outline-none">
                      <Avatar className="w-8 h-8 cursor-pointer">
                        <AvatarImage
                          src={user?.profile_img || undefined}
                          alt={user?.username}
                        />
                        <AvatarFallback className="text-sm font-medium bg-gray-200">
                          {user?.username?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/editor" className="flex items-center gap-2">
                        <PenSquare className="w-4 h-4" />
                        Write
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/my-blogs" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        My Blogs
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link
                        to={`/settings/profile`}
                        className="flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <PermissionGuard permission={Permission.ADMIN_DASHBOARD}>
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link to="/admin" className="flex items-center gap-2">
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </PermissionGuard>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/settings" className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col w-full">
                        <div className="flex items-center gap-2 font-medium">
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link
                to="/signin"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <User className="w-5 h-5 text-gray-600" />
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        {searchBoxVisible && (
          <div className="md:hidden py-4 border-t bg-gray-50">
            <SearchBar
              isMobile={true}
              onClose={() => setSearchBoxVisible(false)}
            />
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
