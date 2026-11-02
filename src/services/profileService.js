import { api } from "./api";

export const profileService = {
  /**
   * Retrieves the authenticated customer's profile, saved addresses, and account stats.
   */
  async getProfile() {
    return await api.get("/user/profile");
  },

  /**
   * Updates personal profile details and saved addresses.
   */
  async updateProfile({ name, phone, addresses }) {
    return await api.put("/user/profile", { name, phone, addresses });
  },

  /**
   * Uploads a customer profile photo via the backend Multer storage system.
   */
  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append("image", file);
    return await api.post("/user/profile/avatar", formData, true);
  },
};
