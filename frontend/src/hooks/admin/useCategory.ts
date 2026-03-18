import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { categoryService } from "@/services/admin-services/categoryService";

export { type Category } from "@/services/admin-services/categoryService";

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
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-blogs-by-category"] });
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
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-blogs-by-category"] });
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
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-blogs-by-category"] });
      toast.success("Xóa danh mục thành công!");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi xóa danh mục";
      toast.error(errorMessage);
    },
  });
};
