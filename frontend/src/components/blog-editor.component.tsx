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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type BlogTagItem = {
  tag?: { name?: string | null } | null;
  name?: string | null;
};

type BlogCategory = { id: number | string; name: string };

type BlogFormValues = {
  title: string;
  des?: string;
  content: unknown;
  banner?: string | null;
  bannerFile?: File | null;
  category_id?: string;
  tags: string[];
};

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
          blog.tags
            ?.map((t: BlogTagItem) => t.tag?.name || t.name)
            .filter((v): v is string => Boolean(v)) || [],
      });
      if (blog.banner) {
        setPreviewBanner(blog.banner);
      }
    }
  }, [isEditMode, blogData, reset]);

  const title = watch("title");
  const des = watch("des");
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
    <div className="min-h-screen relative bg-gradient-to-b from-grey/20 via-white to-white">
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
        <section className="max-w-[1200px] w-full mx-auto px-4 py-10">
          <div className="mb-8">
            <p className="text-sm text-dark-grey">
              {isEditMode ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              {isEditMode
                ? "Hoàn thiện bài viết của bạn"
                : "Bắt đầu viết điều hay"}
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <Card className="bg-white/80 backdrop-blur-sm border-grey/60 overflow-visible">
                <CardContent className="px-5 md:px-6">
                  <div className="relative aspect-video bg-grey/20 border border-grey/60 hover:border-black/20 hover:bg-grey/10 cursor-pointer overflow-hidden group rounded-xl">
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
                          className="w-full h-full object-cover"
                        />
                      )}
                      {!previewBanner && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-grey/60 flex items-center justify-center group-hover:scale-105 transition-transform">
                              <Plus className="w-7 h-7 text-dark-grey" />
                            </div>
                            <span className="text-dark-grey font-medium">
                              Thêm ảnh bìa
                            </span>
                            <span className="text-xs text-dark-grey/70">
                              Tỉ lệ khuyến nghị 16:9
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

                  <div className="mt-8">
                    <div className="flex items-end justify-between gap-4">
                      <Label className="text-sm text-dark-grey">Tiêu đề</Label>
                      <span className="text-xs text-dark-grey/70">
                        {title?.length ?? 0}/100
                      </span>
                    </div>
                    <Textarea
                      placeholder="Nhập tiêu đề bài viết..."
                      className="text-3xl md:text-4xl font-semibold w-full mt-2 h-auto min-h-[56px] outline-none resize-none px-0 border-none focus-visible:ring-0 placeholder:text-dark-grey/40"
                      {...register("title")}
                      rows={1}
                      onKeyDown={handleKeyDown}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = "auto";
                        target.style.height = target.scrollHeight + "px";
                      }}
                    />
                  </div>

                  <div className="mt-5">
                    <div className="flex items-end justify-between gap-4">
                      <Label className="text-sm text-dark-grey">
                        Mô tả ngắn
                      </Label>
                      <span className="text-xs text-dark-grey/70">
                        {des?.length ?? 0}/200
                      </span>
                    </div>
                    <Textarea
                      placeholder="Viết mô tả ngắn cho bài viết (tối đa 200 ký tự)..."
                      className="w-full h-24 resize-none leading-7 mt-2 outline-none border-none focus-visible:ring-0 placeholder:text-dark-grey/40 font-gelasio text-lg"
                      {...register("des")}
                      maxLength={200}
                      onKeyDown={handleKeyDown}
                    />
                  </div>

                  <div className="w-full my-6 h-[1px] bg-grey/60" />

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
                </CardContent>
              </Card>
            </div>

            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-24 space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm border-grey/60">
                  <CardHeader className="border-b border-grey/40">
                    <CardTitle className="text-sm font-semibold tracking-tight">
                      Thiết lập bài viết
                    </CardTitle>
                    <CardDescription className="text-xs text-dark-grey">
                      Hoàn thiện thông tin để bài viết dễ được tìm thấy.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-5 md:px-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Controller
                          control={control}
                          name="category_id"
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Chọn danh mục..." />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((category: BlogCategory) => (
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
                            placeholder="Thêm tag..."
                            value={tagInput}
                            onChange={(e) => {
                              setTagInput(e.target.value);
                              setShowTagSuggestions(true);
                            }}
                            onKeyDown={handleTagInputKeyDown}
                            onFocus={() => setShowTagSuggestions(true)}
                            onBlur={() =>
                              setTimeout(
                                () => setShowTagSuggestions(false),
                                300,
                              )
                            }
                            disabled={selectedTags.length >= 10}
                          />
                          {showTagSuggestions && tagInput && (
                            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-grey/60 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                              {existingTags
                                .filter(
                                  (tag: string) =>
                                    tag
                                      .toLowerCase()
                                      .includes(tagInput.toLowerCase()) &&
                                    !selectedTags.includes(tag),
                                )
                                .map((tag: string) => (
                                  <button
                                    key={tag}
                                    type="button"
                                    className="w-full text-left px-3 py-2 hover:bg-grey/40 text-sm"
                                    onMouseDown={(e) => {
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
                                <div className="px-3 py-2 text-sm text-dark-grey/70 italic">
                                  Tag mới: "{tagInput}"
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

                        <p className="text-xs text-dark-grey text-right">
                          {selectedTags.length}/10 tags
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-grey/60">
                  <CardHeader className="border-b border-grey/40">
                    <CardTitle className="text-sm font-semibold tracking-tight">
                      Mẹo nhanh
                    </CardTitle>
                    <CardDescription className="text-xs text-dark-grey">
                      Một vài gợi ý để bài viết “ra form” nhanh hơn.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-5 md:px-6">
                    <ul className="space-y-2 text-sm text-dark-grey leading-relaxed">
                      <li>- Ảnh bìa rõ nét giúp bài viết nổi bật hơn.</li>
                      <li>- Tiêu đề ngắn gọn, có từ khóa chính.</li>
                      <li>- Thêm 3–5 tags liên quan để dễ tìm kiếm.</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </aside>
          </div>
        </section>
      </AnimationWrapper>
    </div>
  );
};
