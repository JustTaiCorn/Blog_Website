import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import AnimationWrapper from "@/common/page-animation";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import defaultimage from "../imgs/blog banner.png";
import { Textarea } from "./ui/textarea";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { useUploadBanner, useCreateBlog } from "@/hooks/useBlogMutations";
import { useState, useEffect } from "react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const blogSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  des: z
    .string()
    .max(200, "Description must be less than 200 characters")
    .optional(),
  content: z.any(),
  banner: z.string().nullable().optional(),
  bannerFile: z.instanceof(File).nullable().optional(),
});

type BlogFormValues = z.infer<typeof blogSchema>;

interface BlogEditorNavbarProps {
  title?: string;
  onPublish: () => void;
  onSaveDraft: () => void;
  isSubmitting?: boolean;
}

export const BlogEditorNavbar = ({
  title = "New Blog",
  onPublish,
  onSaveDraft,
  isSubmitting = false,
}: BlogEditorNavbarProps) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white sticky top-0 z-50 py-1 md:py-2 px-2 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full"
              variant="outline"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Button>
            <p className="max-md:hidden text-black line-clamp-1 font-medium">
              {title}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onSaveDraft}
              disabled={isSubmitting}
              className="px-4 py-2"
            >
              Save Draft
            </Button>
            <Button
              onClick={onPublish}
              disabled={isSubmitting}
              className="px-4 py-2"
            >
              {isSubmitting ? "Processing..." : "Publish"}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export const BlogEditorComponent = () => {
  const navigate = useNavigate();
  const uploadBannerMutation = useUploadBanner();
  const createBlogMutation = useCreateBlog();

  const [previewBanner, setPreviewBanner] = useState<string | null>(null);

  const { register, handleSubmit, control, watch, setValue } =
    useForm<BlogFormValues>({
      defaultValues: {
        title: "",
        content: { blocks: [] },
        banner: null,
        bannerFile: null,
        des: "",
      },
    });

  const title = watch("title");

  const onSubmit = async (values: BlogFormValues, isDraft: boolean) => {
    let finalBanner = values.banner;

    try {
      if (values.bannerFile) {
        const uploadRes = await uploadBannerMutation.mutateAsync(
          values.bannerFile,
        );
        finalBanner = uploadRes.url;
      }
      createBlogMutation.mutate(
        {
          title: values.title,
          content: values.content,
          banner: finalBanner,
          des: values.des,
          draft: isDraft,
        },
        {
          onSuccess: (res) => {
            if (!isDraft) {
              navigate(`/blog/${res.blog_id}`);
            }
          },
        },
      );
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewBanner(objectUrl);
      setValue("bannerFile", file);
    }
  };
  return (
    <div className="min-h-screen bg-white">
      <BlogEditorNavbar
        title={title || "New Blog"}
        onPublish={handleSubmit((data) => onSubmit(data, false))}
        onSaveDraft={handleSubmit((data) => onSubmit(data, true))}
        isSubmitting={
          uploadBannerMutation.isPending || createBlogMutation.isPending
        }
      />

      <AnimationWrapper>
        <section className="max-w-[900px] w-full mx-auto px-4 py-8">
          <div className="relative aspect-video bg-white border-4 border-grey hover:opacity-75 cursor-pointer overflow-hidden group rounded-lg">
            <Label
              htmlFor="blogBanner"
              className="cursor-pointer block h-full w-full"
            >
              <Input
                type="file"
                id="blogBanner"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <img
                src={previewBanner || defaultimage}
                alt="Blog Banner"
                className="w-full h-full object-cover"
              />
              {!previewBanner && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <Plus className="w-12 h-12 text-gray-300" />
                    <span className="text-gray-400 font-medium">
                      Add Banner Image
                    </span>
                  </div>
                </div>
              )}
              {uploadBannerMutation.isPending && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </Label>
          </div>

          <Textarea
            placeholder="Blog Title..."
            className="text-4xl font-medium w-full mt-8 h-auto min-h-[60px] outline-none resize-none px-0 border-none focus-visible:ring-0 placeholder:text-gray-300"
            {...register("title")}
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = target.scrollHeight + "px";
            }}
          />

          <Textarea
            placeholder="Write a short description about your blog..."
            className="w-full h-24 resize-none leading-7 mt-4 outline-none border-none focus-visible:ring-0 placeholder:text-gray-300 font-gelasio text-lg"
            {...register("des")}
            maxLength={200}
          />

          <div className="w-full my-6 h-[1px] bg-gray-100" />

          <div className="prose prose-lg max-w-none">
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <SimpleEditor
                  initialContent={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </section>
      </AnimationWrapper>
    </div>
  );
};
