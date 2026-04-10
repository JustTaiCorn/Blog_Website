import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import AnimationWrapper from "@/common/page-animation";
import BlogPostCard from "@/components/blog-post.component";
import Loader from "@/components/loader.component";
import {
  useFetchBlogs,
  useBlogCategories,
  useTrendingBlogs,
  type BlogFilterParams,
} from "@/hooks/useBlog";
import NoDataMessage from "@/components/nodata.component";
import LoadMoreBtn from "@/components/load-more.component";
import BlogFilterBar from "@/components/blog-filter-bar.component";
import { Button } from "@/components/ui/button";
import { getDay } from "@/common/date";


export default function HomePage() {
  const [filters, setFilters] = useState<BlogFilterParams>({});

  const handleFilterChange = useCallback((newFilters: BlogFilterParams) => {
    setFilters(newFilters);
  }, []);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useFetchBlogs(filters);

  const { data: categories = [] } = useBlogCategories();
  const { data: trendingData } = useTrendingBlogs();
  const trendingBlogs = trendingData?.blogs ?? [];
  const allBlogs = data?.pages?.flatMap((page) => page.blogs ?? []) ?? [];
  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center gap-10 px-5 max-w-[1200px] mx-auto">
        {/* Feed Section */}
        <div className="w-full">
          <div className="mb-6 border-b border-grey pb-4 mt-5">
            <div className="flex items-center justify-between">
              <h1 className="font-medium text-xl">Home</h1>
              <BlogFilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </div>
          </div>
          {isLoading ? (
            <Loader />
          ) : allBlogs.length > 0 ? (
            <>
              {allBlogs.map((blog: any, index: number) => (
                <AnimationWrapper
                  key={blog.blog_id || blog.$id}
                  transition={{ duration: 1, delay: index * 0.1 }}
                >
                  <BlogPostCard content={blog} author={blog.author} />
                </AnimationWrapper>
              ))}

              {hasNextPage && (
                <LoadMoreBtn
                  hasNextPage={hasNextPage}
                  fetchDataFun={fetchNextPage}
                  isFetching={isFetchingNextPage}
                />
              )}
            </>
          ) : (
            <NoDataMessage message="Không tìm thấy bài viết nào" />
          )}
        </div>

        {/* Sidebar — Categories + Trending */}
        <div className="min-w-[30%] lg:min-w-[350px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
          <div className="flex flex-col gap-10 mt-5">
            {/* Categories */}
            <div>
              <h1 className="font-medium text-xl mb-8">Chủ đề nổi bật</h1>
              <div className="flex gap-3 flex-wrap">
                {categories.map((category: any) => (
                  <Link key={category.id} to={`/category/${category.slug}`}>
                    <Button
                      variant="outline"
                      className="py-2 px-4 rounded-full btn-light hover:bg-black hover:text-white transition-all"
                    >
                      {category.name}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>

            {/* Trending */}
            <div>
              <h1 className="font-medium text-xl mb-6">
                Trending <i className="fi fi-rr-arrow-trend-up"></i>
              </h1>
              {trendingBlogs.length > 0 ? (
                <div className="flex flex-col gap-5">
                  {trendingBlogs.map((blog: any, i: number) => (
                    <Link
                      key={blog.blog_id}
                      to={`/blog/${blog.blog_id}`}
                      className="flex gap-4 group"
                    >
                      <span className="text-4xl font-bold text-grey leading-none">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <img
                            src={blog.author?.profile_img}
                            alt=""
                            className="w-5 h-5 rounded-full"
                          />
                          <p className="text-sm text-dark-grey line-clamp-1">
                            {blog.author?.fullname}
                          </p>
                        </div>
                        <h2 className="font-medium leading-snug line-clamp-2 group-hover:text-dark-grey transition-colors">
                          {blog.title}
                        </h2>
                        <p className="text-sm text-dark-grey mt-1">
                          {getDay(blog.published_at)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <NoDataMessage message="Chưa có bài viết trending" />
              )}
            </div>
          </div>
        </div>
      </section>
    </AnimationWrapper>
  );
}
