import api from "@/lib/axios";

export interface Category {
  id: number;
  name: string;
  slug: string;
  details: string | null;
  created_at: string;
  updated_at: string;
  _count?: {
    blogs: number;
  };
}

export const categoryService = {
  getAllCategories: async (): Promise<Category[]> => {
    const res = await api.get<Category[]>("/admin/categories", {
      withCredentials: true,
    });
    return res.data;
  },

  createCategory: async (name: string, details?: string): Promise<Category> => {
    const res = await api.post<Category>(
      "/admin/categories",
      { name, details },
      { withCredentials: true },
    );
    return res.data;
  },

  updateCategory: async (
    id: number,
    name: string,
    details?: string,
  ): Promise<Category> => {
    const res = await api.put<Category>(
      `/admin/categories/${id}`,
      { name, details },
      { withCredentials: true },
    );
    return res.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/admin/categories/${id}`, {
      withCredentials: true,
    });
  },
};

export default categoryService;
