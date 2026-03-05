import { useParams } from "react-router-dom";
import { useFetchBlog } from "@/services/blogService";
import BlogContent from "@/components/blog-content.component";
import BlogBreadcrumb from "@/components/blog-breadcrumb.component";
import BlogInteraction from "@/components/blog-interaction.component";
import CommentsSection from "@/components/comments.component";
import { getDay } from "@/common/date";
import { MessageCircle, Share2, Bookmark } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Link } from "react-router-dom";
import AnimationWrapper from "@/common/page-animation";
import Loader from "@/components/loader.component";

const BlogPage = () => {
  const { blog_id } = useParams<{ blog_id: string }>();
  const { data, isLoading, isError } = useFetchBlog(blog_id || "");

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader />
      </div>
    );
  }

  if (isError || !data?.blog) {
    return (
      <div className="max-w-[800px] mx-auto py-10 text-center">
        <h2 className="text-2xl font-medium text-dark-grey">
          Không tìm thấy bài viết
        </h2>
        <Link to="/" className="text-black underline mt-4 inline-block">
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  const { blog } = data;
  const {
    title,
    banner,
    content,
    author,
    tags,
    published_at,
    category,
    activity_total_comments,
  } = blog;

  return (
    <AnimationWrapper>
      <div className="flex justify-center gap-8 p-10 max-lg:flex-col max-lg:px-[5vw]">
        {/* Blog content */}
        <div className="max-w-[800px] flex-1">
          {/* Breadcrumb */}
          <BlogBreadcrumb
            items={[
              ...(category
                ? [
                    {
                      label: category.name,
                      href: `/?category=${category.slug}`,
                    },
                  ]
                : []),
              { label: title },
            ]}
          />
          {/* Title */}
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            {title}
          </h1>
          {/* Author Info */}
          <div className="flex items-center gap-3 my-8">
            <Avatar className="w-10 h-10">
              <AvatarImage
                src={author?.profile_img || ""}
                className="rounded-full object-cover"
              />
              <AvatarFallback className="w-10 h-10 rounded-full bg-grey flex items-center justify-center text-sm font-medium">
                {author?.fullname?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col">
              <p className="text-base font-medium capitalize mb-0">
                {author?.fullname}
                <span className="text-dark-grey font-normal ml-1">
                  @{author?.username}
                </span>
              </p>
              <p className="text-sm text-dark-grey mb-0">
                {getDay(published_at)}
              </p>
            </div>
          </div>

          {banner && (
            <div className="my-8 rounded-lg overflow-hidden">
              <img
                src={banner || ""}
                alt={title}
                className="w-full aspect-video object-cover"
              />
            </div>
          )}

          <div className="my-12 blog-page-content font-gelasio text-xl leading-10">
            <BlogContent content={content} />
          </div>

          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 my-8">
              {tags.map((t: any) => (
                <Link
                  key={t.tag.id}
                  to={`/search?tag=${t.tag.slug}`}
                  className="py-2 px-4 rounded-xl text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                >
                  {t.tag.name}
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center gap-6 py-4 px-4 border border-grey shadow-sm my-8 rounded-xl">
            <div className="flex items-center gap-6">
              <BlogInteraction blog_id={blog_id!} />

              <div className="flex items-center gap-2 text-dark-grey">
                <MessageCircle className="w-6 h-6" />
                <span className="text-xl">{activity_total_comments}</span>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-4">
              <button
                className="text-dark-grey hover:text-black transition-colors"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                }}
                title="Sao chép liên kết"
              >
                <Share2 className="w-6 h-6" />
              </button>
              <button className="text-dark-grey hover:text-black transition-colors">
                <Bookmark className="w-6 h-6" />
              </button>
            </div>
          </div>

          <CommentsSection
            blog_id={blog_id!}
            totalComments={activity_total_comments}
          />
        </div>

        <aside className="w-[300px] max-lg:w-full"></aside>
      </div>
    </AnimationWrapper>
  );
};

export default BlogPage;
