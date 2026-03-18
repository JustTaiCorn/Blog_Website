import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  useFetchBlogs,
  useBlogCategories,
  type BlogFilterParams,
} from "@/hooks/useBlog";
import AnimationWrapper from "@/common/page-animation";
import BlogPostCard from "@/components/blog-post.component";
import BlogFilterBar from "@/components/blog-filter-bar.component";
import Loader from "@/components/loader.component";
import NoDataMessage from "@/components/nodata.component";
import LoadMoreBtn from "@/components/load-more.component";
import { Fragment } from "react";
import { ChevronLeft } from "lucide-react";

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [filters, setFilters] = useState<BlogFilterParams>({});

  const { data: categories = [] } = useBlogCategories();
  const categoryName =
    categories.find((c: any) => c.slug === slug)?.name ?? slug;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useFetchBlogs({ ...filters, category: slug });

  if (isLoading) return <Loader />;

  return (
    <AnimationWrapper>
      <section className="max-w-[900px] mx-auto px-5 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link
            to="/"
            className="flex items-center gap-1 text-sm text-dark-grey hover:text-black transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Trang chủ
          </Link>
          <span className="text-dark-grey">/</span>
          <span className="text-sm font-medium">{categoryName}</span>
        </div>

        {/* Header */}
        <h1 className="text-3xl font-bold mb-2">{categoryName}</h1>
        <p className="text-dark-grey mb-6">
          Tất cả bài viết trong danh mục{" "}
          <span className="font-medium text-black">{categoryName}</span>
          {data && (
            <span className="ml-1">({data.pages[0]?.total ?? 0} bài viết)</span>
          )}
        </p>

        {/* Filter Bar (no category since we're already in one) */}
        <div className="border-b border-grey pb-4 mb-6">
          <BlogFilterBar filters={filters} onFilterChange={setFilters} />
        </div>

        {/* Blog List */}
        {data?.pages[0].blogs.length ? (
          <>
            {data.pages.map((page: any, i: number) => (
              <Fragment key={i}>
                {page.blogs.map((blog: any, index: number) => (
                  <AnimationWrapper
                    key={blog.blog_id}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  >
                    <BlogPostCard content={blog} author={blog.author} />
                  </AnimationWrapper>
                ))}
              </Fragment>
            ))}

            <LoadMoreBtn
              hasNextPage={hasNextPage}
              fetchDataFun={fetchNextPage}
              isFetching={isFetchingNextPage}
            />
          </>
        ) : (
          <NoDataMessage message="Không có bài viết nào trong danh mục này" />
        )}
      </section>
    </AnimationWrapper>
  );
}
