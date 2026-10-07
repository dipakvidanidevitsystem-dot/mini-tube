import { baseApi } from "./baseApi";
import type { Paginated, SortOption, Video, VideoDetail, Visibility } from "../../types";

export interface VideoQueryParams {
  category?: string;
  sort?: SortOption;
  page?: number;
}

export interface SearchVideoParams extends VideoQueryParams {
  q: string;
}

export interface VideoFormData {
  title: string;
  description: string;
  category: string;
  visibility: Visibility;
  video?: File;
  thumbnail?: File;
}

export type UpdateVideoData = Omit<VideoFormData, "video">;

function buildVideoFormData(data: VideoFormData): FormData {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("category", data.category);
  formData.append("visibility", data.visibility);
  if (data.video) formData.append("video", data.video);
  if (data.thumbnail) formData.append("thumbnail", data.thumbnail);
  return formData;
}

function buildUpdateVideoFormData(data: UpdateVideoData): FormData {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("category", data.category);
  formData.append("visibility", data.visibility);
  if (data.thumbnail) formData.append("thumbnail", data.thumbnail);
  return formData;
}

export const videosApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listVideos: builder.query<Paginated<Video>, VideoQueryParams>({
      query: (params) => ({ url: "/videos", params }),
      providesTags: (result) =>
        result
          ? [...result.items.map((v) => ({ type: "Video" as const, id: v.id })), { type: "VideoList" as const, id: "LIST" }]
          : [{ type: "VideoList" as const, id: "LIST" }],
    }),
    searchVideos: builder.query<Paginated<Video>, SearchVideoParams>({
      query: ({ q, ...params }) => ({ url: "/videos/search", params: { q, ...params } }),
      providesTags: (result) =>
        result
          ? [...result.items.map((v) => ({ type: "Video" as const, id: v.id })), { type: "VideoList" as const, id: "LIST" }]
          : [{ type: "VideoList" as const, id: "LIST" }],
    }),
    getVideo: builder.query<VideoDetail, string | number>({
      query: (id) => `/videos/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Video", id }],
    }),
    createVideo: builder.mutation<Video, VideoFormData>({
      query: (data) => ({ url: "/videos", method: "POST", body: buildVideoFormData(data) }),
      invalidatesTags: [{ type: "VideoList", id: "LIST" }],
    }),
    updateVideo: builder.mutation<Video, { id: string | number; data: UpdateVideoData }>({
      query: ({ id, data }) => ({ url: `/videos/${id}`, method: "PUT", body: buildUpdateVideoFormData(data) }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Video", id },
        { type: "VideoList", id: "LIST" },
      ],
    }),
    deleteVideo: builder.mutation<void, string | number>({
      query: (id) => ({ url: `/videos/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Video", id },
        { type: "VideoList", id: "LIST" },
        "Channel",
        "Dashboard",
      ],
    }),
    toggleLike: builder.mutation<{ liked: boolean; likeCount: number }, string | number>({
      query: (id) => ({ url: `/videos/${id}/like`, method: "POST" }),
      invalidatesTags: (_result, _error, id) => [{ type: "Video", id }],
    }),
    reportVideo: builder.mutation<{ message: string }, { id: string | number; reason: string }>({
      query: ({ id, reason }) => ({ url: `/videos/${id}/report`, method: "POST", body: { reason } }),
      invalidatesTags: ["AdminReport"],
    }),
    reportWatchProgress: builder.mutation<void, { id: string | number; videoViewId: number; seconds: number }>({
      query: ({ id, videoViewId, seconds }) => ({
        url: `/videos/${id}/watch-progress`,
        method: "POST",
        body: { videoViewId, seconds },
      }),
    }),
  }),
});

export const {
  useListVideosQuery,
  useSearchVideosQuery,
  useGetVideoQuery,
  useCreateVideoMutation,
  useUpdateVideoMutation,
  useDeleteVideoMutation,
  useToggleLikeMutation,
  useReportVideoMutation,
  useReportWatchProgressMutation,
} = videosApi;
