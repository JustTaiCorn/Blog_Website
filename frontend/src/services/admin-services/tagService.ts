import api from "@/lib/axios";

export interface Tag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
  _count?: {
    blogs: number;
  };
}

export const tagService = {
  getAllTags: async (): Promise<Tag[]> => {
    const res = await api.get<Tag[]>("/admin/tags", {
      withCredentials: true,
    });
    return res.data;
  },

  createTag: async (name: string): Promise<Tag> => {
    const res = await api.post<Tag>(
      "/admin/tags",
      { name },
      { withCredentials: true },
    );
    return res.data;
  },

  updateTag: async (id: number, name: string): Promise<Tag> => {
    const res = await api.put<Tag>(
      `/admin/tags/${id}`,
      { name },
      { withCredentials: true },
    );
    return res.data;
  },

  deleteTag: async (id: number): Promise<void> => {
    await api.delete(`/admin/tags/${id}`, {
      withCredentials: true,
    });
  },
};

export default tagService;
