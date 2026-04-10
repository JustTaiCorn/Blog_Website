import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  blogService,
  interactionService,
  type CreateBlogRequest,
} from "@/services/blogService";

// ==================== Types ====================

export interface BlogFilterParams {
  sort?: "asc" | "desc";
  sortBy?: "date" | "views" | "likes";
  category?: string;
}
export const useFetchBlogs = (filters: BlogFilterParams = {}) => {
  return useInfiniteQuery({
    queryKey: ["blogs", filters],
    queryFn: ({ pageParam = 1 }) =>
      blogService.getAllBlogs({
        page: pageParam,
        limit: 5,
        sort: filters.sort ?? "desc",
        sortBy: filters.sortBy,
        category: filters.category,
      }),
    getNextPageParam: (lastPage) => {
      return lastPage.page < lastPage.totalPages
        ? lastPage.page + 1
        : undefined;
    },
    initialPageParam: 1,
  });
};

export const useTrendingBlogs = () => {
  return useQuery({
    queryKey: ["trending-blogs"],
    queryFn: () => blogService.getTrendingBlogs(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useFetchBlog = (blog_id: string) => {
  return useQuery({
    queryKey: ["blog", blog_id],
    queryFn: () => blogService.getBlog(blog_id),
    enabled: !!blog_id,
  });
};

export const useBlogCategories = () => {
  return useQuery({
    queryKey: ["blog-categories"],
    queryFn: () => blogService.getCategories(),
  });
};

export const useBlogTags = () => {
  return useQuery({
    queryKey: ["blog-tags"],
    queryFn: () => blogService.getTags(),
  });
};

export const useMyBlogs = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["my-blogs", page, limit],
    queryFn: () => blogService.getMyBlogs(page, limit),
  });
};

export const useSearchBlogs = (
  q: string,
  page: number = 1,
  limit: number = 10,
) => {
  return useQuery({
    queryKey: ["search-blogs", q, page, limit],
    queryFn: () => blogService.search(q, page, limit),
    enabled: q.trim().length >= 2,
    staleTime: 30_000,
  });
};

export const useSearchPreview = (q: string) => {
  return useQuery({
    queryKey: ["search-preview", q],
    queryFn: () => blogService.search(q, 1, 5),
    enabled: q.trim().length >= 2,
    staleTime: 30_000,
  });
};

// ==================== Blog Mutation Hooks ====================

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

export const useDeleteBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (blog_id: string) => blogService.delete(blog_id),
    onSuccess: () => {
      toast.success("Xoá bài viết thành công!");
      queryClient.invalidateQueries({ queryKey: ["my-blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Xoá bài viết thất bại";
      toast.error(errorMessage);
    },
  });
};

// ==================== Interaction Hooks ====================

export const useLikeStatus = (blog_id: string) => {
  return useQuery({
    queryKey: ["like-status", blog_id],
    queryFn: () => interactionService.getLikeStatus(blog_id),
    enabled: !!blog_id,
    staleTime: 0,
  });
};

export const useToggleLike = (blog_id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => interactionService.toggleLike(blog_id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["like-status", blog_id] });
      const prev = queryClient.getQueryData<{
        liked: boolean;
        total_likes: number;
      }>(["like-status", blog_id]);
      if (prev) {
        queryClient.setQueryData(["like-status", blog_id], {
          liked: !prev.liked,
          total_likes: prev.liked ? prev.total_likes - 1 : prev.total_likes + 1,
        });
      }
      return { prev };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.prev) {
        queryClient.setQueryData(["like-status", blog_id], context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["like-status", blog_id] });
      queryClient.invalidateQueries({ queryKey: ["blog", blog_id] });
    },
  });
};
