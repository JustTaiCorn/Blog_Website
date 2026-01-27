import {useState} from "react";
import {BlogEditorComponent} from "@/components/blog-editor.component.tsx";
import PublishFormComponent from "@/components/publish-form.component.tsx";

export const EditorPages = () => {
    const [editorState, setEditorState] = useState("editing");
  return (
      editorState === "editing" ? <BlogEditorComponent/> : <PublishFormComponent/>
  );
}