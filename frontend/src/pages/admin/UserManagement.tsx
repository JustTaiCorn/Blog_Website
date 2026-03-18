import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SearchIcon, ShieldIcon } from "lucide-react";
import { useAllUsers, type AdminUser } from "@/hooks/admin/useUserManagement";

import DeleteUserDialog from "@/components/admin/users/DeleteUserDialog";
import EditRoleDialog from "@/components/admin/users/EditRoleDialog";

export default function UserManagement() {
  const { data: users = [], isLoading } = useAllUsers();
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const handleDelete = (user: AdminUser) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleEditRole = (user: AdminUser) => {
    setSelectedUser(user);
    setIsEditRoleDialogOpen(true);
  };


  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.username.toLowerCase().includes(lowerQuery) ||
          user.email.toLowerCase().includes(lowerQuery) ||
          user.fullname.toLowerCase().includes(lowerQuery)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const hasRole = (user: AdminUser, roleName: string) => {
    return user.roles?.some((r) => r.role === roleName);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-grey w-4 h-4" />
          <Input
            type="text"
            placeholder="Tìm kiếm theo tên, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-grey/10 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-dark-grey">
            Đang tải danh sách người dùng...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-dark-grey italic">
            Không tìm thấy người dùng nào phù hợp.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người dùng</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Ngày tham gia</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const isOwner = hasRole(user, "OWNER");
                const isAdmin = hasRole(user, "ADMIN");
                const date = new Date(user.created_at).toLocaleDateString("vi-VN");

                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={user.profile_img || "https://img.freepik.com/premium-vector/professional-male-avatar-profile-picture-businessman-icon-vector-illustration_268949-1402.jpg"} // Using a decent default avatar link for fallback
                          alt={user.username}
                          className="w-10 h-10 rounded-full object-cover bg-grey/10 border border-grey/20"
                          onError={(e) => {
                            e.currentTarget.src = "https://img.freepik.com/premium-vector/professional-male-avatar-profile-picture-businessman-icon-vector-illustration_268949-1402.jpg";
                          }}
                        />
                        <div>
                          <p className="font-medium text-black line-clamp-1">{user.fullname}</p>
                          <p className="text-sm text-dark-grey line-clamp-1">@{user.username}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-dark-grey">{user.email}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {isOwner ? (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Owner</span>
                        ) : isAdmin ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Admin</span>
                        ) : (
                          <span className="px-2 py-1 bg-grey/20 text-dark-grey rounded-full text-xs font-bold">User</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-dark-grey text-sm">{date}</TableCell>
                    <TableCell className="text-right">
                      {!isOwner && (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant={isAdmin ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleEditRole(user)}
                          >
                            <ShieldIcon className="w-4 h-4 mr-2" />
                            {isAdmin ? "Sửa Quyền" : "Cấp Quyền"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(user)}
                          >
                            Xóa
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <DeleteUserDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        user={selectedUser}
      />
      
      <EditRoleDialog
        open={isEditRoleDialogOpen}
        onOpenChange={setIsEditRoleDialogOpen}
        user={selectedUser}
      />
    </div>
  );
}

