import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { adminUserService } from "@/services/admin-services/adminUserService";

export { type AdminUser } from "@/services/admin-services/adminUserService";

export const useAllUsers = () => {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => adminUserService.getAllUsers(),
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      role,
      action,
    }: {
      userId: number;
      role: "ADMIN" | "USER" | "OWNER";
      action: "add" | "remove";
    }) => adminUserService.updateUserRole(userId, role, action),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success(data.message || "Cập nhật quyền thành công!");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi cập nhật quyền";
      toast.error(errorMessage);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => adminUserService.deleteUser(userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success(data.message || "Xóa người dùng thành công!");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi xóa người dùng";
      toast.error(errorMessage);
    },
  });
};
