import { ArrowLeft, Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import AnimationWrapper from "@/common/page-animation";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import {
  useUploadBanner,
  useCreateBlog,
  useUpdateBlog,
  useFetchBlog,
  useBlogCategories,
  useBlogTags,
} from "@/hooks/useBlog";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

import { z } from "zod";

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
  category_id: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

type BlogFormValues = z.infer<typeof blogSchema>;

interface BlogEditorNavbarProps {
  title?: string;
  onPublish: () => void;
  onSaveDraft: () => void;
  isSubmitting?: boolean;
  isEditMode?: boolean;
}

export const BlogEditorNavbar = ({
  title = "New Blog",
  onPublish,
  onSaveDraft,
  isSubmitting = false,
  isEditMode = false,
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
              {isSubmitting
                ? "Processing..."
                : isEditMode
                  ? "Update"
                  : "Publish"}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

interface BlogEditorComponentProps {
  blogId?: string;
}

export const BlogEditorComponent = ({ blogId }: BlogEditorComponentProps) => {
  const navigate = useNavigate();
  const uploadBannerMutation = useUploadBanner();
  const createBlogMutation = useCreateBlog();
  const updateBlogMutation = useUpdateBlog();
  const isEditMode = !!blogId;

  const { data: blogData, isLoading: isBlogLoading } = useFetchBlog(
    blogId || "",
  );

  const { data: categories = [] } = useBlogCategories();
  const { data: existingTags = [] } = useBlogTags();

  const [previewBanner, setPreviewBanner] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  const { register, handleSubmit, control, watch, setValue, reset } =
    useForm<BlogFormValues>({
      defaultValues: {
        title: "",
        content: { blocks: [] },
        banner: null,
        bannerFile: null,
        des: "",
        category_id: "",
        tags: [],
      },
    });

  // Populate form when editing an existing blog
  useEffect(() => {
    if (isEditMode && blogData?.blog) {
      const blog = blogData.blog;
      reset({
        title: blog.title || "",
        content: blog.content || { blocks: [] },
        banner: blog.banner || null,
        bannerFile: null,
        des: blog.des || "",
        category_id: blog.category_id ? blog.category_id.toString() : "",
        tags:
          blog.tags?.map((t: any) => t.tag?.name || t.name).filter(Boolean) ||
          [],
      });
      if (blog.banner) {
        setPreviewBanner(blog.banner);
      }
    }
  }, [isEditMode, blogData, reset]);

  const title = watch("title");
  const selectedTags = watch("tags");
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = (tagToAdd?: string) => {
    const tag = tagToAdd || tagInput.trim();
    if (!tag) return;

    if (selectedTags.length >= 10) {
      return; // Max 10 tags
    }

    if (!selectedTags.includes(tag)) {
      setValue("tags", [...selectedTags, tag]);
    }
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setValue(
      "tags",
      selectedTags.filter((tag) => tag !== tagToRemove),
    );
  };

  const onSubmit = async (values: BlogFormValues, isDraft: boolean) => {
    let finalBanner = values.banner;

    try {
      if (values.bannerFile) {
        const uploadRes = await uploadBannerMutation.mutateAsync(
          values.bannerFile,
        );
        finalBanner = uploadRes.url;
      }

      const payload = {
        title: values.title,
        content: values.content,
        banner: finalBanner,
        des: values.des,
        category_id: values.category_id ? parseInt(values.category_id) : null,
        tags: values.tags,
        draft: isDraft,
      };

      if (isEditMode && blogId) {
        updateBlogMutation.mutate(
          { blog_id: blogId, data: payload },
          {
            onSuccess: (res) => {
              navigate(`/blog/${res.blog_id}`);
            },
          },
        );
      } else {
        createBlogMutation.mutate(payload, {
          onSuccess: (res) => {
            if (!isDraft) {
              navigate(`/blog/${res.blog_id}`);
            }
          },
        });
      }
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
  const isSubmittingLocal =
    uploadBannerMutation.isPending ||
    createBlogMutation.isPending ||
    updateBlogMutation.isPending;

  if (isEditMode && isBlogLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative">
      {isSubmittingLocal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <Spinner className="w-8 h-8 text-primary" />
            <p className="text-lg font-medium text-gray-700 animate-pulse">
              Processing your request...
            </p>
          </div>
        </div>
      )}

      <BlogEditorNavbar
        title={title || (isEditMode ? "Edit Blog" : "New Blog")}
        onPublish={handleSubmit((data) => onSubmit(data, false))}
        onSaveDraft={handleSubmit((data) => onSubmit(data, true))}
        isSubmitting={isSubmittingLocal}
        isEditMode={isEditMode}
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
              {previewBanner && (
                <img
                  src={previewBanner}
                  alt="Blog Banner"
                  className="w-full h-full object-cover border border-black ring-2 ring-black"
                />
              )}
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
                  <Spinner className="w-8 h-8 text-white" />
                </div>
              )}
            </Label>
          </div>

          <Textarea
            placeholder="Blog Title..."
            className="text-4xl font-medium w-full mt-8 h-auto min-h-[60px] outline-none resize-none px-0 border-none focus-visible:ring-0 placeholder:text-gray-300"
            {...register("title")}
            rows={1}
            onKeyDown={handleKeyDown}
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
            onKeyDown={handleKeyDown}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="space-y-2">
              <Label>Category</Label>
              <Controller
                control={control}
                name="category_id"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category: any) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="relative">
                <Input
                  placeholder="Add tags..."
                  value={tagInput}
                  onChange={(e) => {
                    setTagInput(e.target.value);
                    setShowTagSuggestions(true);
                  }}
                  onKeyDown={handleTagInputKeyDown}
                  onFocus={() => setShowTagSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowTagSuggestions(false), 300)
                  }
                  disabled={selectedTags.length >= 10}
                />
                {showTagSuggestions && tagInput && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                    {existingTags
                      .filter(
                        (tag: string) =>
                          tag.toLowerCase().includes(tagInput.toLowerCase()) &&
                          !selectedTags.includes(tag),
                      )
                      .map((tag: string) => (
                        <button
                          key={tag}
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                          onMouseDown={(e) => {
                            // Prevent input blur before click registers
                            e.preventDefault();
                          }}
                          onClick={() => {
                            addTag(tag);
                            setShowTagSuggestions(false);
                          }}
                        >
                          {tag}
                        </button>
                      ))}
                    {!existingTags.some(
                      (tag: string) =>
                        tag.toLowerCase() === tagInput.toLowerCase(),
                    ) && (
                      <div className="px-3 py-2 text-sm text-gray-500 italic">
                        New tag: "{tagInput}"
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-destructive focus:outline-none"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-gray-500 text-right">
                {selectedTags.length}/10 tags
              </p>
            </div>
          </div>

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
