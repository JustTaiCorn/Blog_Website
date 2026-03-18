import api from "@/lib/axios";
import type { User } from "@/types/entities";

export interface AdminUser extends User {
  roles: { role: "ADMIN" | "USER" | "OWNER" }[];
}

export const adminUserService = {
  getAllUsers: async (): Promise<AdminUser[]> => {
    const res = await api.get<AdminUser[]>("/admin/users", {
      withCredentials: true,
    });
    return res.data;
  },

  updateUserRole: async (
    userId: number,
    role: "ADMIN" | "USER" | "OWNER",
    action: "add" | "remove",
  ): Promise<{ message: string }> => {
    const res = await api.put<{ message: string }>(
      "/admin/users/role",
      { userId, role, action },
      { withCredentials: true },
    );
    return res.data;
  },

  deleteUser: async (userId: number): Promise<{ message: string }> => {
    const res = await api.delete<{ message: string }>(`/admin/users/${userId}`, {
      withCredentials: true,
    });
    return res.data;
  },
};

export default adminUserService;
