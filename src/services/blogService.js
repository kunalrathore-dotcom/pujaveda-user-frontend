import { api } from "./api";

export const blogService = {
  async getArticles({ page = 1, limit = 9, search = "", category = "" } = {}) {
    const params = new URLSearchParams();
    if (page) params.append("page", String(page));
    if (limit) params.append("limit", String(limit));
    if (search && search.trim()) params.append("search", search.trim());
    if (category && category.trim()) params.append("category", category.trim());

    const qs = params.toString();
    const data = await api.get(`/blog${qs ? `?${qs}` : ""}`);
    return data;
  },

  async getArticleBySlug(slug) {
    const data = await api.get(`/blog/${encodeURIComponent(slug)}`);
    return data;
  },

  async getCategories() {
    const data = await api.get("/blog/categories");
    return data.categories || [];
  },
};

export default blogService;

