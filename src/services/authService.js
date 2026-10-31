import { api } from "./api";

const TOKEN_KEY = "sonic_user_token";
const SESSION_KEY = "sonic_user_auth_session";

export const authService = {
  async login({ email, password }) {
    const data = await api.post("/auth/login", { email, password });
    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
    }
    return data.user;
  },

  async register({ name, email, password, phone }) {
    const data = await api.post("/auth/register", { name, email, password, phone });
    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
    }
    return data.user;
  },

  getSession() {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  async getMe() {
    if (!this.getToken()) return null;
    try {
      const data = await api.get("/auth/me");
      if (data.user) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
        return data.user;
      }
    } catch {
      this.logout();
    }
    return null;
  },

  logout() {
    try {
      const session = this.getSession();
      const userId = session?.id || session?._id || session?.userId;
      if (userId) {
        localStorage.removeItem(`sonic_user_cart_${userId}`);
        localStorage.removeItem(`sonic_user_favourites_${userId}`);
      }
      localStorage.removeItem("sonic_user_cart");
      localStorage.removeItem("sonic_user_favourites");
    } catch {
      // ignore
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
  },

  async forgotPassword(email) {
    return await api.post("/auth/forgot-password", { email });
  },

  async verifyResetOtp(email, otp) {
    return await api.post("/auth/verify-reset-otp", { email, otp });
  },

  async resetPassword({ email, resetToken, password, confirmPassword }) {
    return await api.post("/auth/reset-password", {
      email,
      resetToken,
      password,
      confirmPassword,
    });
  },
};
