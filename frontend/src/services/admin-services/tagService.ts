import api from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export interface Tag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
  _count?: {
    blogs: number;
  };
}
export const tagService = {
  getAllTags: async (): Promise<Tag[]> => {
    const res = await api.get<Tag[]>("/admin/tags", {
      withCredentials: true,
    });
    return res.data;
  },

  createTag: async (name: string): Promise<Tag> => {
    const res = await api.post<Tag>(
      "/admin/tags",
      { name },
      { withCredentials: true },
    );
    return res.data;
  },

  updateTag: async (id: number, name: string): Promise<Tag> => {
    const res = await api.put<Tag>(
      `/admin/tags/${id}`,
      { name },
      { withCredentials: true },
    );
    return res.data;
  },

  deleteTag: async (id: number): Promise<void> => {
    await api.delete(`/admin/tags/${id}`, {
      withCredentials: true,
    });
  },
};

// React Query Hooks
export const useAllTags = () => {
  return useQuery({
    queryKey: ["admin", "tags"],
    queryFn: () => tagService.getAllTags(),
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => tagService.createTag(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tags"] });
      toast.success("Tạo tag thành công!");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi tạo tag";
      toast.error(errorMessage);
    },
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      tagService.updateTag(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tags"] });
      toast.success("Cập nhật tag thành công!");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi cập nhật tag";
      toast.error(errorMessage);
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => tagService.deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tags"] });
      toast.success("Xóa tag thành công!");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi xóa tag";
      toast.error(errorMessage);
    },
  });
};

export default tagService;
