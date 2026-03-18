import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMyBlogs, useDeleteBlog } from "@/hooks/useBlog";
import type { Blog } from "@/types/entities";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import AnimationWrapper from "@/common/page-animation";

const MyBlogsPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useMyBlogs(page, limit);
  const deleteBlogMutation = useDeleteBlog();

  const blogs = data?.blogs || [];
  const totalPages = data?.totalPages || 1;

  const handleDelete = (blog_id: string) => {
    deleteBlogMutation.mutate(blog_id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    );
  }

  return (
    <AnimationWrapper>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Bài viết của tôi
            </h1>
            <p className="text-gray-500 mt-1">
              Quản lý và chỉnh sửa bài viết của bạn
            </p>
          </div>
          <Button onClick={() => navigate("/editor")} className="rounded-full">
            + Viết bài mới
          </Button>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">Bạn chưa có bài viết nào.</p>
            <Button
              onClick={() => navigate("/editor")}
              className="mt-4"
              variant="outline"
            >
              Tạo bài viết đầu tiên
            </Button>
          </div>
        ) : (
          <>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-[60px] text-center">STT</TableHead>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead className="w-[120px] text-center">
                      Ảnh minh hoạ
                    </TableHead>
                    <TableHead className="w-[120px] text-center">
                      Trạng thái
                    </TableHead>
                    <TableHead className="w-[140px] text-center">
                      Thao tác
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blogs.map((blog: Blog, index: number) => {
                    const isPublished = blog.published && !blog.draft;
                    const stt = (page - 1) * limit + index + 1;

                    return (
                      <TableRow key={blog.blog_id}>
                        <TableCell className="text-center font-medium text-gray-500">
                          {stt}
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-gray-900 line-clamp-1">
                            {blog.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(blog.created_at).toLocaleDateString(
                              "vi-VN",
                            )}
                          </p>
                        </TableCell>
                        <TableCell className="text-center">
                          {blog.banner ? (
                            <img
                              src={blog.banner}
                              alt={blog.title}
                              className="w-20 h-12 object-cover rounded mx-auto"
                            />
                          ) : (
                            <span className="text-xs text-gray-300">
                              Không có
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {isPublished ? (
                            <Badge
                              variant="default"
                              className="bg-green-100 text-green-700 hover:bg-green-100"
                            >
                              Published
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Draft</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-3"
                              disabled={isPublished}
                              onClick={() =>
                                navigate(`/editor/${blog.blog_id}`)
                              }
                              title={
                                isPublished
                                  ? "Bài đã publish không thể chỉnh sửa"
                                  : "Chỉnh sửa"
                              }
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-3 text-red-500 hover:text-red-700 hover:border-red-300"
                                  title="Xoá bài viết"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Xác nhận xoá bài viết
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Bạn có chắc chắn muốn xoá bài viết "
                                    {blog.title}"? Hành động này không thể hoàn
                                    tác.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Huỷ</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(blog.blog_id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Xoá
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Trước
                </Button>
                <span className="text-sm text-gray-600">
                  Trang {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Tiếp
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AnimationWrapper>
  );
};

export default MyBlogsPage;
