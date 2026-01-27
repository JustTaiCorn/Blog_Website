import { create } from "zustand";
import type { CreateBlogRequest } from "@/services/blogService";

interface BlogEditorState {
  title: string;
  content: any;
  banner: string | null;
  bannerFile: File | null;
  des: string;
  category_id: number | null;
  tags: string[];
  isDraft: boolean;
  setTitle: (title: string) => void;
  setContent: (content: any) => void;
  setBanner: (url: string | null, file?: File | null) => void;
  setDes: (des: string) => void;
  setCategoryId: (id: number | null) => void;
  setTags: (tags: string[]) => void;
  setIsDraft: (isDraft: boolean) => void;
  reset: () => void;
  getFormData: () => CreateBlogRequest;
}

const initialFormState = {
  title: "",
  content: { blocks: [] },
  banner: null,
  bannerFile: null,
  des: "",
  category_id: null,
  tags: [],
  isDraft: true,
};

export const useBlogEditorStore = create<BlogEditorState>((set, get) => ({
  ...initialFormState,
  setTitle: (title) => set({ title }),
  setContent: (content) => set({ content }),
  setBanner: (url, file = null) => set({ banner: url, bannerFile: file }),
  setDes: (des) => set({ des }),
  setCategoryId: (category_id) => set({ category_id }),
  setTags: (tags) => set({ tags }),
  setIsDraft: (isDraft) => set({ isDraft }),
  reset: () => set(initialFormState),
  getFormData: () => {
    const { title, content, banner, des, category_id, tags, isDraft } = get();
    return {
      title,
      content,
      banner,
      des,
      category_id,
      tags,
      draft: isDraft,
    };
  },
}));
