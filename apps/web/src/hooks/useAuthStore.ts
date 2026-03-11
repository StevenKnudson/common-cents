import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  user: { id: string; email: string; name: string | null } | null;
  orgId: string | null;
  login: (token: string, user: AuthState["user"], orgId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      orgId: null,
      login: (token, user, orgId) => set({ token, user, orgId }),
      logout: () => set({ token: null, user: null, orgId: null }),
    }),
    { name: "cc-auth" }
  )
);
