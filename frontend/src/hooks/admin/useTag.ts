import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { tagService } from "@/services/admin-services/tagService";

export { type Tag } from "@/services/admin-services/tagService";

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
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
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
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
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
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Xóa tag thành công!");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi xóa tag";
      toast.error(errorMessage);
    },
  });
};
