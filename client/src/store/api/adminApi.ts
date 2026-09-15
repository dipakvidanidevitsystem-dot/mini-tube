import { baseApi } from "./baseApi";
import type { AdminComment, AdminReport, AdminUser, AdminVideo } from "../../types";

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    adminListUsers: builder.query<AdminUser[], void>({
      query: () => "/admin/users",
      providesTags: (result) =>
        result
          ? [...result.map((u) => ({ type: "AdminUser" as const, id: u.id })), { type: "AdminUser" as const, id: "LIST" }]
          : [{ type: "AdminUser" as const, id: "LIST" }],
    }),
    setUserDisabled: builder.mutation<void, { id: number; disabled: boolean }>({
      query: ({ id, disabled }) => ({ url: `/admin/users/${id}/disable`, method: "PATCH", body: { disabled } }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "AdminUser", id }],
    }),
    adminListVideos: builder.query<AdminVideo[], void>({
      query: () => "/admin/videos",
      providesTags: (result) =>
        result
          ? [...result.map((v) => ({ type: "AdminVideo" as const, id: v.id })), { type: "AdminVideo" as const, id: "LIST" }]
          : [{ type: "AdminVideo" as const, id: "LIST" }],
    }),
    adminDeleteVideo: builder.mutation<void, number>({
      query: (id) => ({ url: `/admin/videos/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "AdminVideo", id },
        { type: "AdminVideo", id: "LIST" },
      ],
    }),
    adminListComments: builder.query<AdminComment[], void>({
      query: () => "/admin/comments",
      providesTags: (result) =>
        result
          ? [...result.map((c) => ({ type: "AdminComment" as const, id: c.id })), { type: "AdminComment" as const, id: "LIST" }]
          : [{ type: "AdminComment" as const, id: "LIST" }],
    }),
    adminDeleteComment: builder.mutation<void, number>({
      query: (id) => ({ url: `/admin/comments/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "AdminComment", id },
        { type: "AdminComment", id: "LIST" },
      ],
    }),
    listReports: builder.query<AdminReport[], void>({
      query: () => "/admin/reports",
      providesTags: ["AdminReport"],
    }),
    markReportReviewed: builder.mutation<void, number>({
      query: (id) => ({ url: `/admin/reports/${id}`, method: "PATCH" }),
      invalidatesTags: ["AdminReport"],
    }),
  }),
});

export const {
  useAdminListUsersQuery,
  useSetUserDisabledMutation,
  useAdminListVideosQuery,
  useAdminDeleteVideoMutation,
  useAdminListCommentsQuery,
  useAdminDeleteCommentMutation,
  useListReportsQuery,
  useMarkReportReviewedMutation,
} = adminApi;
