import api from "@/lib/axios";
import type { User, UserSocialLinks } from "@/types/entities";

interface UpdateProfileResponse {
  message: string;
  user: User;
}

interface GetSocialLinksResponse {
  social_links: Omit<UserSocialLinks, "user_id" | "updated_at">;
}

interface UpdateSocialLinksResponse {
  message: string;
  social_links: Omit<UserSocialLinks, "user_id" | "updated_at">;
}

export type SocialLinksPayload = {
  youtube?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  github?: string;
  website?: string;
};

export const userService = {
  updateProfile: async (data: FormData): Promise<UpdateProfileResponse> => {
    const res = await api.patch<UpdateProfileResponse>("/users/profile", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  getSocialLinks: async (): Promise<GetSocialLinksResponse> => {
    const res = await api.get<GetSocialLinksResponse>("/users/social-links");
    return res.data;
  },

  updateSocialLinks: async (
    links: SocialLinksPayload,
  ): Promise<UpdateSocialLinksResponse> => {
    const res = await api.put<UpdateSocialLinksResponse>(
      "/users/social-links",
      links,
    );
    return res.data;
  },
};
