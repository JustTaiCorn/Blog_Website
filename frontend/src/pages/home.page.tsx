import { useState } from "react";
import AnimationWrapper from "@/common/page-animation";
import BlogPostCard from "@/components/blog-post.component";
import Loader from "@/components/loader.component";
import { useFetchBlogs, useBlogCategories } from "@/services/blogService";
import NoDataMessage from "@/components/nodata.component";
import LoadMoreBtn from "@/components/load-more.component";
import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function HomePage() {
  const [sort, setSort] = useState<"desc" | "asc">("desc");

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useFetchBlogs(sort);

  const { data: categories = [] } = useBlogCategories();

  if (isLoading) return <Loader />;

  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center gap-10 px-5 max-w-[1200px] mx-auto">
        {/* Feed Section */}
        <div className="w-full">
          <div className="mb-8 border-b border-grey pb-2 mt-5 flex items-center justify-between">
            <h1 className="font-medium text-xl">Home</h1>
            <Select
              value={sort}
              onValueChange={(v) => setSort(v as "desc" | "asc")}
            >
              <SelectTrigger className="w-[140px] h-8 text-sm border-none shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Mới nhất</SelectItem>
                <SelectItem value="asc">Cũ nhất</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {data?.pages[0].blogs.length ? (
            <>
              {data.pages.map((page: any, i: number) => (
                <Fragment key={i}>
                  {page.blogs.map((blog: any, index: number) => (
                    <AnimationWrapper
                      key={index}
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
            <NoDataMessage message="No blogs published yet" />
          )}
        </div>

        {/* Filters/Trending/Categories */}
        <div className="min-w-[30%] lg:min-w-[350px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
          <div className="flex flex-col gap-10 mt-5">
            <div>
              <h1 className="font-medium text-xl mb-8">
                Stories from all interests
              </h1>
              <div className="flex gap-3 flex-wrap">
                {categories.map((category: any, i: number) => (
                  <Button key={i} className="btn-light py-2 px-4 rounded-full">
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h1 className="font-medium text-xl mb-8">
                Trending <i className="fi fi-rr-arrow-trend-up"></i>
              </h1>
              <NoDataMessage message="No trending blogs yet" />
            </div>
          </div>
        </div>
      </section>
    </AnimationWrapper>
  );
}
