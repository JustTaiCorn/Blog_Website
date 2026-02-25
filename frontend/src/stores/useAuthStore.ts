import { create } from "zustand";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { authWithGoogle } from "@/common/firebase";
import { toast } from "react-toastify";
import type { User } from "@/types/entities";

interface AuthState {
  accessToken: string | null;
  user: User | null;
  loading: boolean;
  setAccessToken: (accessToken: string) => void;
  clearState: () => void;
  signUp: (
    username: string,
    password: string,
    email: string,
    fullname: string,
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  googleSignIn: () => Promise<void>;
  signOut: () => Promise<void>;
  fetchMe: () => Promise<void>;
  refresh: () => Promise<void>;
  isAdmin: () => boolean;
  updateProfile: (data: FormData) => Promise<boolean>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  loading: false,

  setAccessToken: (accessToken) => {
    set({ accessToken });
  },
  clearState: () => {
    set({ accessToken: null, user: null, loading: false });
  },

  setUser: (user) => {
    set({ user });
  },

  signUp: async (username, password, email, fullname) => {
    try {
      set({ loading: true });
      const res = await authService.signUp(username, password, email, fullname);
      toast.success(res.data?.message || res.message);
    } catch (error: any) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || "Đăng ký không thành công!";
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (email, password) => {
    try {
      set({ loading: true });

      const response = await authService.signIn(email, password);
      get().setAccessToken(response.accessToken);

      await get().fetchMe();

      toast.success("Đăng nhập thành công!");
    } catch (error: any) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || "Đăng nhập không thành công!";
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  googleSignIn: async () => {
    try {
      set({ loading: true });
      const idToken = await authWithGoogle();
      const response = await authService.googleAuth(idToken);
      get().setAccessToken(response.accessToken);

      await get().fetchMe();

      toast.success(response.message);
    } catch (error: any) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || "Đăng nhập Google không thành công!";
      toast.error(errorMessage);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    try {
      get().clearState();
      await authService.signOut();
      toast.success("Đăng xuất thành công!");
    } catch (error: any) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || "Lỗi khi đăng xuất!";
      toast.error(errorMessage);
    }
  },

  fetchMe: async () => {
    try {
      set({ loading: true });
      const user = await authService.fetchMe();
      set({ user });
    } catch (error: any) {
      console.error(error);
      set({ user: null, accessToken: null });
    } finally {
      set({ loading: false });
    }
  },

  refresh: async () => {
    try {
      set({ loading: true });
      const { user, fetchMe, setAccessToken } = get();
      const accessToken = await authService.refresh();

      setAccessToken(accessToken);

      if (!user) {
        await fetchMe();
      }
    } catch (error: any) {
      get().clearState();
    } finally {
      set({ loading: false });
    }
  },
  isAdmin: () => {
    const { user } = get();
    if (!user || !user.roles) return false;
    return user.roles.some((r) => r.role === "ADMIN");
  },

  updateProfile: async (data: FormData) => {
    try {
      const response = await userService.updateProfile(data);
      toast.success(response.message);
      return true;
    } catch (error: any) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || "Cập nhật hồ sơ thất bại!";
      toast.error(errorMessage);
      return false;
    }
  },
}));
