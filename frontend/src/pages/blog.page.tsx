import { useRef, useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useFetchBlog } from "@/hooks/useBlog";
import BlogContent from "@/components/blog-content.component";
import BlogBreadcrumb from "@/components/blog-breadcrumb.component";
import BlogInteraction from "@/components/blog-interaction.component";
import CommentsSection from "@/components/comments.component";
import { getDay } from "@/common/date";
import { MessageCircle, Share2, Bookmark, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { motion } from "framer-motion";
import Loader from "@/components/loader.component";
import { cn } from "@/lib/utils";
import FollowButton from "@/components/follow-button.component";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: "easeInOut" as const },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (delay: number) => ({
    opacity: 1,
    transition: { duration: 0.5, delay },
  }),
};

const BlogPage = () => {
  const { blog_id } = useParams<{ blog_id: string }>();
  const { data, isLoading, isError } = useFetchBlog(blog_id || "");

  const barRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "0px 0px -80px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [data]);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader />
      </div>
    );
  }

  if (isError || !data?.blog) {
    return (
      <div className="max-w-[720px] mx-auto py-20 text-center">
        <h2 className="text-2xl font-medium text-[var(--tt-gray-light-600)]">
          Không tìm thấy bài viết
        </h2>
        <Link
          to="/"
          className="mt-4 inline-block font-medium underline underline-offset-4 text-[var(--tt-gray-light-800)]"
        >
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
    <article>
      {/* ===== HERO ===== */}
      {banner ? (
        <motion.div
          className="relative w-full min-h-[340px] max-h-[400px] overflow-hidden rounded-b-3xl md:rounded-b-[24px]"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          custom={0}
        >
          <img
            src={banner}
            alt={title}
            className="w-full h-full min-h-[340px] max-h-[400px] object-cover block"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/75 via-black/35 to-black/[0.08]" />
          {/* Content on top */}
          <div className="absolute bottom-0 left-0 right-0 z-[2] px-6 pb-10 pt-12 max-w-[720px] mx-auto">
            {/* <motion.div
              variants={fadeUp}
              custom={0.1}
              initial="hidden"
              animate="visible"
            >
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
            </motion.div> */}
            <motion.h1
              className="text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold leading-[1.15] text-white tracking-tight drop-shadow-[0_2px_16px_rgba(0,0,0,0.2)]"
              variants={fadeUp}
              custom={0.2}
              initial="hidden"
              animate="visible"
            >
              {title}
            </motion.h1>
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="rounded-b-3xl bg-gradient-to-br from-[#f8f7f4] to-[#f0eee9] px-6 pt-16 pb-12"
          initial="hidden"
          animate="visible"
        >
          <div className="max-w-[720px] mx-auto">
            <motion.div
              variants={fadeUp}
              custom={0.1}
              initial="hidden"
              animate="visible"
            >
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
            </motion.div>
            <motion.h1
              className="text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold leading-[1.15] text-[var(--tt-gray-light-900)] tracking-tight"
              variants={fadeUp}
              custom={0.2}
              initial="hidden"
              animate="visible"
            >
              {title}
            </motion.h1>
          </div>
        </motion.div>
      )}
      <motion.div
        className="flex items-center gap-3.5 max-w-[720px] mx-auto -mt-6 relative z-[3] py-4 px-5 bg-[var(--tt-card-bg-color)] border border-[var(--tt-border-color-tint)] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.04)]"
        variants={fadeUp}
        custom={0.35}
        initial="hidden"
        animate="visible"
      >
        <Avatar>
          <Link to={`/@${author?.username}`}>
            {author?.profile_img ? (
              <AvatarImage
                src={author.profile_img}
                className="w-11 h-11 rounded-full object-cover border-2 border-[var(--tt-border-color-tint)] shrink-0"
              />
            ) : (
              <AvatarFallback className="w-11 h-11 rounded-full flex items-center justify-center font-semibold text-base text-[var(--tt-gray-light-600)] bg-[var(--tt-gray-light-100)] border-2 border-[var(--tt-border-color-tint)] shrink-0">
                {author?.fullname?.charAt(0)}
              </AvatarFallback>
            )}
          </Link>
        </Avatar>

        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="font-semibold text-[15px] text-[var(--tt-gray-light-800)] leading-tight truncate">
            <Link to={`/@${author?.username}`} className="hover:underline">
              {author?.fullname}
            </Link>
            <span className="font-normal text-[var(--tt-gray-light-500)] ml-1">
              @{author?.username}
            </span>
          </p>
          <p className="text-[13px] text-[var(--tt-gray-light-500)] leading-tight">
            {getDay(published_at)}
            {category && (
              <>
                <span className="inline-block w-[3px] h-[3px] rounded-full bg-[var(--tt-gray-light-400)] mx-1.5 align-middle" />
                <Link
                  to={`/?category=${category.slug}`}
                  className="font-medium text-[var(--tt-brand-color-500)] no-underline hover:underline"
                >
                  {category.name}
                </Link>
              </>
            )}
          </p>
        </div>

        <div className="ml-auto shrink-0">
          <FollowButton username={author?.username || ""} size="sm" />
        </div>
      </motion.div>

      {/* ===== ARTICLE BODY ===== */}
      <motion.div
        className="max-w-[720px] mx-auto px-6 pt-12"
        variants={fadeUp}
        custom={0.5}
        initial="hidden"
        animate="visible"
      >
        <div className="mb-12 blog-page-content font-gelasio text-xl leading-10">
          <BlogContent content={content} />
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10 pb-10 border-b border-[var(--tt-border-color)]">
            {tags.map((t: any) => (
              <Link
                key={t.tag.id}
                to={`/search?tag=${t.tag.slug}`}
                className="inline-flex items-center py-1.5 px-3.5 rounded-full text-[13px] font-medium text-[var(--tt-gray-light-600)] bg-[var(--tt-gray-light-50)] border border-[var(--tt-border-color)] no-underline transition-all duration-200 hover:text-[var(--tt-brand-color-600)] hover:bg-[var(--tt-brand-color-50)] hover:border-[var(--tt-brand-color-200)] hover:-translate-y-px"
              >
                {t.tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Sentinel for sticky detection */}
        <div ref={sentinelRef} />

        {/* ===== INTERACTION BAR ===== */}
        <div
          ref={barRef}
          className={cn(
            "flex items-center gap-2 max-w-[720px] mx-auto mb-12 py-3 px-5 rounded-2xl",
            "bg-white/80 backdrop-blur-[16px] border border-[var(--tt-border-color-tint)]",
            "shadow-[0_4px_24px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.03)]",
            "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
            isSticky &&
              "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[420px] w-[calc(100%-48px)] mx-0 shadow-[0_8px_40px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)]",
          )}
        >
          <div className="flex items-center gap-4">
            <BlogInteraction blog_id={blog_id!} />
            <div className="w-px h-6 bg-[var(--tt-border-color)]" />
            <span className="inline-flex items-center gap-1.5 text-[var(--tt-gray-light-500)] text-sm font-medium">
              <MessageCircle className="w-5 h-5" />
              {activity_total_comments}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <button
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-[var(--tt-gray-light-500)] cursor-pointer transition-all duration-200 hover:bg-[var(--tt-gray-light-50)] hover:text-[var(--tt-gray-light-800)] active:scale-[0.92] border-none outline-none bg-transparent"
              onClick={handleShare}
              title={copied ? "Đã sao chép!" : "Sao chép liên kết"}
            >
              {copied ? (
                <Check className="w-5 h-5 text-[var(--tt-color-green-base)]" />
              ) : (
                <Share2 className="w-5 h-5" />
              )}
            </button>
            <button
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-[var(--tt-gray-light-500)] cursor-pointer transition-all duration-200 hover:bg-[var(--tt-gray-light-50)] hover:text-[var(--tt-gray-light-800)] active:scale-[0.92] border-none outline-none bg-transparent"
              title="Lưu bài viết"
            >
              <Bookmark className="w-5 h-5" />
            </button>
          </div>
        </div>

        <CommentsSection
          blog_id={blog_id!}
          totalComments={activity_total_comments}
        />
      </motion.div>
    </article>
  );
};

export default BlogPage;
