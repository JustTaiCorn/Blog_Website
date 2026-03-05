import { useParams } from "react-router-dom";
import { BlogEditorComponent } from "@/components/blog-editor.component.tsx";

export const EditorPages = () => {
  const { blog_id } = useParams<{ blog_id?: string }>();
  return <BlogEditorComponent blogId={blog_id} />;
};
