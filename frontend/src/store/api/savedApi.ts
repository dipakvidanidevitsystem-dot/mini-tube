import { baseApi } from "./baseApi";
import type { SavedVideo } from "../../types";

export const savedApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listSaved: builder.query<SavedVideo[], void>({
      query: () => "/saved",
      providesTags: (result) =>
        result
          ? [...result.map((v) => ({ type: "Saved" as const, id: v.id })), { type: "Saved" as const, id: "LIST" }]
          : [{ type: "Saved" as const, id: "LIST" }],
    }),
    toggleSaved: builder.mutation<{ saved: boolean }, string | number>({
      query: (videoId) => ({ url: `/saved/${videoId}/toggle`, method: "POST" }),
      invalidatesTags: (_result, _error, videoId) => [
        { type: "Saved", id: videoId },
        { type: "Saved", id: "LIST" },
      ],
    }),
  }),
});

export const { useListSavedQuery, useToggleSavedMutation } = savedApi;
