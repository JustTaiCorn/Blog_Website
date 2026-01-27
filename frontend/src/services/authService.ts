import api from "@/lib/axios";
import type { User } from "@/types/entities";

interface SignInResponse {
  message: string;
  accessToken: string;
  user: User;
}

interface RefreshResponse {
  accessToken: string;
}

interface FetchMeResponse {
  user: User;
}

export const authService = {
  signUp: async (
    username: string,
    password: string,
    email: string,
    fullname: string
  ) => {
    const res = await api.post(
      "/auth/signup",
      {
        username,
        password,
        email,
        fullname,
      },
      { withCredentials: true }
    );
    return res.data;
  },

  signIn: async (email: string, password: string): Promise<SignInResponse> => {
    const res = await api.post<SignInResponse>(
      "/auth/signin",
      { email, password },
      { withCredentials: true }
    );
    return res.data;
  },

  googleAuth: async (accessToken: string): Promise<SignInResponse> => {
    const res = await api.post<SignInResponse>(
      "/auth/google",
      { accessToken },
      { withCredentials: true }
    );
    return res.data;
  },

  signOut: async () => {
    return api.post("/auth/signout", {}, { withCredentials: true });
  },

  fetchMe: async (): Promise<User> => {
    const res = await api.get<FetchMeResponse>("/users/me", {
      withCredentials: true,
    });
    return res.data.user;
  },

  refresh: async (): Promise<string> => {
    const res = await api.post<RefreshResponse>(
      "/auth/refresh",
      {},
      { withCredentials: true }
    );
    return res.data.accessToken;
  },
};
