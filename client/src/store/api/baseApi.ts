import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: [
    "Video",
    "VideoList",
    "Comment",
    "History",
    "Saved",
    "Channel",
    "Dashboard",
    "AdminUser",
    "AdminVideo",
    "AdminComment",
    "AdminReport",
  ],
  endpoints: () => ({}),
});
