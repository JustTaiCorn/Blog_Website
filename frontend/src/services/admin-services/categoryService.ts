import api from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export interface Category {
  id: number;
  name: string;
  slug: string;
  details: string | null;
  created_at: string;
  updated_at: string;
  _count?: {
    blogs: number;
  };
}

export const categoryService = {
  getAllCategories: async (): Promise<Category[]> => {
    const res = await api.get<Category[]>("/admin/categories", {
      withCredentials: true,
    });
    return res.data;
  },

  createCategory: async (name: string, details?: string): Promise<Category> => {
    const res = await api.post<Category>(
      "/admin/categories",
      { name, details },
      { withCredentials: true },
    );
    return res.data;
  },

  updateCategory: async (
    id: number,
    name: string,
    details?: string,
  ): Promise<Category> => {
    const res = await api.put<Category>(
      `/admin/categories/${id}`,
      { name, details },
      { withCredentials: true },
    );
    return res.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/admin/categories/${id}`, {
      withCredentials: true,
    });
  },
};

// React Query Hooks
export const useAllCategories = () => {
  return useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => categoryService.getAllCategories(),
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, details }: { name: string; details?: string }) =>
      categoryService.createCategory(name, details),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      toast.success("Tạo danh mục thành công!");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi tạo danh mục";
      toast.error(errorMessage);
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      name,
      details,
    }: {
      id: number;
      name: string;
      details?: string;
    }) => categoryService.updateCategory(id, name, details),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      toast.success("Cập nhật danh mục thành công!");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi cập nhật danh mục";
      toast.error(errorMessage);
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      toast.success("Xóa danh mục thành công!");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi xóa danh mục";
      toast.error(errorMessage);
    },
  });
};

export default categoryService;
