import { baseApi } from "./baseApi";
import type { Comment } from "../../types";

export const commentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listComments: builder.query<Comment[], string | number>({
      query: (videoId) => `/videos/${videoId}/comments`,
      providesTags: (result, _error, videoId) =>
        result
          ? [
              ...result.map((c) => ({ type: "Comment" as const, id: c.id })),
              { type: "Comment" as const, id: `LIST-${videoId}` },
            ]
          : [{ type: "Comment" as const, id: `LIST-${videoId}` }],
    }),
    addComment: builder.mutation<Comment, { videoId: string | number; comment: string; parentId?: number }>({
      query: ({ videoId, comment, parentId }) => ({
        url: `/videos/${videoId}/comments`,
        method: "POST",
        body: { comment, parentId },
      }),
      invalidatesTags: (_result, _error, { videoId }) => [{ type: "Comment", id: `LIST-${videoId}` }],
    }),
    deleteComment: builder.mutation<void, { id: string | number; videoId: string | number }>({
      query: ({ id }) => ({ url: `/comments/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, { videoId }) => [{ type: "Comment", id: `LIST-${videoId}` }],
    }),
    toggleCommentLike: builder.mutation<{ liked: boolean; likeCount: number }, string | number>({
      query: (id) => ({ url: `/comments/${id}/like`, method: "POST" }),
      invalidatesTags: (_result, _error, id) => [{ type: "Comment", id }],
    }),
  }),
});

export const {
  useListCommentsQuery,
  useAddCommentMutation,
  useDeleteCommentMutation,
  useToggleCommentLikeMutation,
} = commentsApi;
