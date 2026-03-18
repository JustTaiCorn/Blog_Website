import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Heart, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Button } from "@/components/ui/button";
import { useSearchBlogs } from "@/hooks/useBlog";
import { getDay } from "@/common/date.tsx";
import Loader from "@/components/loader.component";

function HighlightText({ text, keyword }: { text: string; keyword: string }) {
  if (!keyword.trim() || !text) return <>{text}</>;
  const regex = new RegExp(
    `(${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi",
  );
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-yellow-200 text-yellow-900 rounded px-0.5"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useSearchBlogs(q, page, 10);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNewSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("q") as HTMLInputElement;
    if (input.value.trim()) {
      setSearchParams({ q: input.value.trim() });
      setPage(1);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Search Input */}
      <form onSubmit={handleNewSearch} className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            name="q"
            defaultValue={q}
            placeholder="Tìm kiếm bài viết..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-gray-800"
          />
        </div>
        <Button type="submit" className="rounded-full px-6">
          Tìm kiếm
        </Button>
      </form>

      {/* Results Header */}
      {q && (
        <p className="text-sm text-gray-500 mb-6">
          {isLoading
            ? "Đang tìm kiếm..."
            : data
              ? `Tìm thấy ${data.total} kết quả cho "${q}"`
              : ""}
        </p>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader />
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="text-center py-12 text-gray-500">
          Đã có lỗi xảy ra. Vui lòng thử lại.
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && data && data.blogs.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">
            Không tìm thấy kết quả
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Thử tìm kiếm với từ khóa khác
          </p>
        </div>
      )}

      {/* Results */}
      {!isLoading && data && data.blogs.length > 0 && (
        <div className="space-y-0">
          {data.blogs.map((blog: any) => {
            const author = blog.author ?? {};
            return (
              <Link
                key={blog.blog_id}
                to={`/blog/${blog.blog_id}`}
                className="flex gap-6 items-center border-b border-gray-100 pb-5 mb-5 group hover:no-underline"
              >
                <div className="flex-1 min-w-0">
                  {/* Author */}
                  <div className="flex gap-2 items-center mb-3">
                    <Avatar>
                      <AvatarImage
                        src={author.profile_img}
                        className="w-8 h-8 rounded-full border border-gray-200"
                      />
                      <AvatarFallback className="w-8 h-8 rounded-full bg-gray-200 text-sm flex items-center justify-center">
                        {author.fullname?.charAt(0) ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600 line-clamp-1">
                      {author.fullname}{" "}
                      <span className="text-gray-400">@{author.username}</span>
                    </span>
                    <span className="text-sm text-gray-400 shrink-0">
                      {getDay(blog.published_at)}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold leading-snug line-clamp-2 text-gray-900 group-hover:text-gray-700 transition-colors">
                    <HighlightText text={blog.title} keyword={q} />
                  </h2>

                  {/* Description */}
                  {blog.des && (
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2 leading-relaxed">
                      <HighlightText text={blog.des} keyword={q} />
                    </p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center gap-3 mt-4">
                    {blog.tags && blog.tags.length > 0 && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                        {blog.tags[0].tag.name}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-sm text-gray-400">
                      <Heart className="w-3.5 h-3.5" />
                      {blog.activity_total_likes}
                    </span>
                  </div>
                </div>

                {/* Banner */}
                {blog.banner && (
                  <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={blog.banner}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="rounded-full"
          >
            Trước
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: data.totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 || p === data.totalPages || Math.abs(p - page) <= 1,
              )
              .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                  acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-gray-400">
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p as number)}
                    className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                      page === p
                        ? "bg-gray-900 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= data.totalPages}
            className="rounded-full"
          >
            Tiếp
          </Button>
        </div>
      )}
    </div>
  );
}
