import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/userService";
import { blogService } from "@/services/blogService";
import { useFollowCounts } from "@/hooks/useFollow";
import { useAuthStore } from "@/stores/useAuthStore";
import FollowButton from "@/components/follow-button.component";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { getDay } from "@/common/date";
import {
  Users,
  UserCheck,
  FileText,
  Heart,
  MessageCircle,
  Eye,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Blog } from "@/types/entities";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay, ease: "easeOut" as const },
  }),
};

type TabKey = "posts" | "about";

const UserBioPage = () => {
  const { username: rawParam } = useParams<{ username: string }>();
  const username = rawParam?.replace(/^@/, "") || "";
  const { user: currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabKey>("posts");
  const [postsPage, setPostsPage] = useState(1);

  // Fetch public profile
  const {
    data: profileData,
    isLoading: profileLoading,
    isError: profileError,
  } = useQuery({
    queryKey: ["public-profile", username],
    queryFn: () => userService.getPublicProfile(username),
    enabled: !!username,
  });

  // Fetch follow counts
  const { data: countsData } = useFollowCounts(username);

  // Fetch user's published posts
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ["user-posts", username, postsPage],
    queryFn: () =>
      blogService.getAllBlogs({
        page: postsPage,
        limit: 5,
        sort: "desc",
        author: username,
      }),
    enabled: !!username,
  });

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (profileError || !profileData?.user) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-medium text-muted-foreground">
          Không tìm thấy người dùng
        </h2>
        <Link
          to="/"
          className="mt-4 inline-block font-medium underline underline-offset-4"
        >
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  const profile = profileData.user;
  const followersCount =
    countsData?.followers_count ?? profile.followers_count;
  const followingCount =
    countsData?.following_count ?? profile.following_count;
  const posts = postsData?.blogs ?? [];
  const totalPages = postsData?.totalPages ?? 1;
  const isOwnProfile = currentUser?.username === username;

  return (
    <div className="min-h-screen">
      {/* ── Profile Header ─────────────────────────── */}
      <motion.div
        className="relative overflow-hidden"
        initial="hidden"
        animate="visible"
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-primary/3 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_60%)]" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-8">
          <motion.div
            className="flex flex-col sm:flex-row items-center sm:items-start gap-6"
            variants={fadeUp}
            custom={0}
          >
            {/* Avatar */}
            <Avatar className="size-28 ring-4 ring-background shadow-xl">
              <AvatarImage
                src={profile.profile_img ?? undefined}
                alt={profile.fullname}
              />
              <AvatarFallback className="text-3xl font-bold bg-primary/15 text-primary">
                {profile.fullname?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {profile.fullname}
                </h1>
                {!isOwnProfile && (
                  <FollowButton username={username} size="sm" />
                )}
                {isOwnProfile && (
                  <Link to="/settings/profile">
                    <Button variant="outline" size="sm">
                      Chỉnh sửa hồ sơ
                    </Button>
                  </Link>
                )}
              </div>

              <p className="text-muted-foreground text-sm mb-3">
                @{profile.username}
              </p>

              {profile.bio && (
                <p className="text-foreground/80 text-sm leading-relaxed max-w-lg mb-4">
                  {profile.bio}
                </p>
              )}

              {/* Stats */}
              <motion.div
                className="flex items-center gap-6 justify-center sm:justify-start"
                variants={fadeUp}
                custom={0.15}
              >
                <StatItem
                  icon={Users}
                  label="Followers"
                  value={followersCount}
                />
                <StatItem
                  icon={UserCheck}
                  label="Following"
                  value={followingCount}
                />
                <StatItem
                  icon={FileText}
                  label="Posts"
                  value={profile.total_posts}
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Tabs ────────────────────────────────────── */}
      <div className="border-b border-border sticky top-[64px] z-10 bg-background/95 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1">
            {(["posts", "about"] as TabKey[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "relative px-5 py-3 text-sm font-medium transition-colors cursor-pointer",
                  activeTab === tab
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab === "posts" ? "Bài viết" : "Giới thiệu"}
                {activeTab === tab && (
                  <motion.div
                    layoutId="bio-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Content ─────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === "posts" && (
          <motion.div
            key="posts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {postsLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <FileText className="size-12 mx-auto mb-3 opacity-30" />
                <p>Chưa có bài viết nào</p>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  {posts.map((blog: Blog, index: number) => (
                    <motion.div
                      key={blog.blog_id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <BlogCard blog={blog} />
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={postsPage <= 1}
                      onClick={() => setPostsPage((p) => p - 1)}
                    >
                      Trước
                    </Button>
                    <span className="text-sm text-muted-foreground px-3">
                      {postsPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={postsPage >= totalPages}
                      onClick={() => setPostsPage((p) => p + 1)}
                    >
                      Tiếp
                    </Button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {activeTab === "about" && (
          <motion.div
            key="about"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-lg"
          >
            <h3 className="text-lg font-semibold mb-4">Giới thiệu</h3>
            {profile.bio ? (
              <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {profile.bio}
              </p>
            ) : (
              <p className="text-muted-foreground italic">
                Người dùng chưa viết phần giới thiệu.
              </p>
            )}

            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Tham gia từ{" "}
                <span className="font-medium text-foreground">
                  {getDay(profile.created_at)}
                </span>
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// ─── Sub Components ──────────────────────────────────────────────────

interface StatItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}

const StatItem = ({ icon: Icon, label, value }: StatItemProps) => (
  <div className="flex items-center gap-1.5 text-sm">
    <Icon className="size-4 text-muted-foreground" />
    <span className="font-semibold tabular-nums">{value}</span>
    <span className="text-muted-foreground hidden sm:inline">{label}</span>
  </div>
);

interface BlogCardProps {
  blog: Blog;
}

const BlogCard = ({ blog }: BlogCardProps) => (
  <Link
    to={`/blog/${blog.blog_id}`}
    className="group block rounded-xl p-4 -mx-2 transition-colors hover:bg-accent/50"
  >
    <div className="flex gap-4">
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1.5">
          {blog.title}
        </h3>
        {blog.des && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {blog.des}
          </p>
        )}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{getDay(blog.published_at)}</span>
          <span className="flex items-center gap-1">
            <Heart className="size-3" />
            {blog.activity_total_likes}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="size-3" />
            {blog.activity_total_comments}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="size-3" />
            {blog.activity_total_reads}
          </span>
        </div>
      </div>

      {blog.banner && (
        <div className="shrink-0 w-28 h-20 rounded-lg overflow-hidden">
          <img
            src={blog.banner}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  </Link>
);

export default UserBioPage;
