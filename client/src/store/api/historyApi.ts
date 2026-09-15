import { baseApi } from "./baseApi";
import type { HistoryVideo } from "../../types";

export const historyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listHistory: builder.query<HistoryVideo[], void>({
      query: () => "/history",
      providesTags: (result) =>
        result
          ? [...result.map((v) => ({ type: "History" as const, id: v.id })), { type: "History" as const, id: "LIST" }]
          : [{ type: "History" as const, id: "LIST" }],
    }),
    recordView: builder.mutation<void, string | number>({
      query: (videoId) => ({ url: `/history/${videoId}`, method: "POST" }),
      invalidatesTags: [{ type: "History", id: "LIST" }],
    }),
    removeHistoryItem: builder.mutation<void, string | number>({
      query: (videoId) => ({ url: `/history/${videoId}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, videoId) => [
        { type: "History", id: videoId },
        { type: "History", id: "LIST" },
      ],
    }),
    clearHistory: builder.mutation<void, void>({
      query: () => ({ url: "/history", method: "DELETE" }),
      invalidatesTags: [{ type: "History", id: "LIST" }],
    }),
  }),
});

export const {
  useListHistoryQuery,
  useRecordViewMutation,
  useRemoveHistoryItemMutation,
  useClearHistoryMutation,
} = historyApi;
