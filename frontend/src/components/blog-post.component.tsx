import { getDay } from "@/common/date";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const BlogPostCard = ({ content, author }: any) => {
  const {
    published_at,
    tags,
    title,
    des,
    banner,
    activity_total_likes,
    blog_id,
  } = content;
  const { fullname, profile_img, username } = author;

  return (
    <Link
      to={`/blog/${blog_id}`}
      className="flex gap-8 items-center border-b border-grey pb-5 mb-4 group"
    >
      <div className="w-full">
        <div className="flex gap-2 items-center mb-4">
          <Avatar className="size-10 border border-grey">
            <AvatarImage src={profile_img} />
            <AvatarFallback>{fullname.charAt(0)}</AvatarFallback>
          </Avatar>
          <p className="line-clamp-1 mb-0 font-bold">
            {fullname} @{username}
          </p>
          <span className="min-w-fit text-dark-grey">
            {getDay(published_at)}
          </span>
        </div>

        <h1 className="blog-title font-bold text-2xl leading-7 line-clamp-2">
          {title}
        </h1>

        <p className="my-3  font-gelasio leading-7 max-sm:hidden md:max-[1100px]:hidden line-clamp-2 text-dark-grey">
          {des}
        </p>

        <div className="flex gap-4 mt-5">
          {tags.length > 0 && (
            <Badge variant="secondary" className="py-1 px-4 rounded-full bg-blue-100 text-blue-700 border-transparent">
              {tags[0].tag.name}
            </Badge>
          )}

          <span className="ml-3 flex items-center gap-2 text-dark-grey">
            <Heart className="w-4 h-4" />
            {activity_total_likes}
          </span>
        </div>
      </div>

      <div className="h-28 aspect-square bg-grey rounded-lg overflow-hidden">
        <img
          src={banner}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-all duration-300"
        />
      </div>
    </Link>
  );
};

export default BlogPostCard;
