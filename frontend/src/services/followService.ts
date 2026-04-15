import api from "@/lib/axios";

export interface ToggleFollowResponse {
  is_following: boolean;
  message: string;
}

export interface FollowStatusResponse {
  is_following: boolean;
}

export interface FollowCountsResponse {
  followers_count: number;
  following_count: number;
}

export const followService = {
  toggleFollow: async (username: string): Promise<ToggleFollowResponse> => {
    const res = await api.post<ToggleFollowResponse>(`/follow/${username}`);
    return res.data;
  },

  getFollowStatus: async (
    username: string,
  ): Promise<FollowStatusResponse> => {
    const res = await api.get<FollowStatusResponse>(
      `/follow/${username}/status`,
    );
    return res.data;
  },

  getFollowCounts: async (
    username: string,
  ): Promise<FollowCountsResponse> => {
    const res = await api.get<FollowCountsResponse>(
      `/follow/${username}/counts`,
    );
    return res.data;
  },
};
