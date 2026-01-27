import { useMutation, useQueryClient } from "@tanstack/react-query";
import { blogService, type CreateBlogRequest } from "@/services/blogService";
import { toast } from "react-toastify";

// Upload banner mutation
export const useUploadBanner = () => {
  return useMutation({
    mutationFn: (file: File) => blogService.uploadBanner(file),
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Upload ảnh thất bại";
      toast.error(errorMessage);
    },
  });
};

// Create/Publish blog mutation
export const useCreateBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBlogRequest) => blogService.create(data),
    onSuccess: (data) => {
      toast.success(data.message || "Đăng bài thành công!");
      queryClient.invalidateQueries({ queryKey: ["my-blogs"] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Đăng bài thất bại";
      toast.error(errorMessage);
    },
  });
};
export const useUpdateBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      blog_id,
      data,
    }: {
      blog_id: string;
      data: CreateBlogRequest;
    }) => blogService.update(blog_id, data),
    onSuccess: (data) => {
      toast.success(data.message || "Cập nhật thành công!");
      queryClient.invalidateQueries({ queryKey: ["my-blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blog"] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Cập nhật thất bại";
      toast.error(errorMessage);
    },
  });
};
