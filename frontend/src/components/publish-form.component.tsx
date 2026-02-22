import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useBlogEditorStore } from "@/stores/useBlogEditorStore";
import { useCreateBlog } from "@/services/blogService";
import AnimationWrapper from "@/common/page-animation";
import { X } from "lucide-react";
import { toast } from "react-toastify";

const PublishFormComponent = () => {
  const { title, banner, des, setDes, tags, setTags, getFormData, reset } =
    useBlogEditorStore();

  const createBlogMutation = useCreateBlog();
  const navigate = useNavigate();

  const handleClose = () => {
    // This would normally switch state back to editing
    // Since this is a simple implementation, let's just assume parent controls this
    // But for now, we'll just handle publishing here
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = e.currentTarget.value.trim();
      if (tag && !tags.includes(tag) && tags.length < 10) {
        setTags([...tags, tag]);
        e.currentTarget.value = "";
      } else if (tags.length >= 10) {
        toast.error("Tối đa 10 thẻ");
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handlePublish = () => {
    const data = getFormData();
    createBlogMutation.mutate(
      { ...data, draft: false },
      {
        onSuccess: (res) => {
          reset();
          navigate(`/blog/${res.blog_id}`);
        },
      },
    );
  };

  return (
    <AnimationWrapper>
      <section className="relative min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-8">
        <div className="max-w-[550px] center">
          <p className="text-dark-grey mb-1">Preview</p>
          <div className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4">
            <img
              src={banner || ""}
              className="w-full h-full object-cover"
              alt="Banner Preview"
            />
          </div>
          <h1 className="text-4xl font-medium mt-2 leading-tight line-clamp-2">
            {title}
          </h1>
          <p className="font-gelasio line-clamp-2 text-xl leading-7 mt-4">
            {des}
          </p>
        </div>

        <div className="border-grey lg:border-l lg:pl-8">
          <p className="text-dark-grey mb-2 mt-9">Blog Title</p>
          <Input type="text" value={title} readOnly className="bg-grey" />

          <p className="text-dark-grey mb-2 mt-9">Short Description</p>
          <Textarea
            maxLength={200}
            defaultValue={des}
            className="h-40 resize-none leading-7"
            onChange={(e) => setDes(e.target.value)}
          />
          <p className="mt-1 text-dark-grey text-sm text-right">
            {200 - des.length} characters left
          </p>

          <p className="text-dark-grey mb-2 mt-9">
            Topics - ( Helps in searching and ranking your blog post )
          </p>
          <div className="relative input-box pl-2 py-2 pb-4 bg-grey rounded-md">
            <Input
              type="text"
              placeholder="Topic"
              className="sticky top-0 left-0 bg-white mb-3 focus:bg-white border-none"
              onKeyDown={handleTagKeyDown}
            />
            {tags.map((tag, i) => (
              <div
                key={i}
                className="inline-block bg-white p-2 px-5 rounded-full mr-3 mt-3 "
              >
                <p className="inline-block">{tag}</p>
                <button
                  className="rounded-full ml-3"
                  onClick={() => removeTag(tag)}
                >
                  <X className="w-3 h-3 inline-block" />
                </button>
              </div>
            ))}
          </div>
          <p className="mt-1 mb-4 text-dark-grey text-sm text-right">
            {10 - tags.length} Tags left
          </p>

          <Button
            className="px-8"
            onClick={handlePublish}
            disabled={createBlogMutation.isPending}
          >
            {createBlogMutation.isPending ? "Publishing..." : "Publish Now"}
          </Button>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default PublishFormComponent;
