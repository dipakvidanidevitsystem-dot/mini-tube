import { baseApi } from "./baseApi";
import { setUser } from "../slices/authSlice";
import type {
  ActivityItem,
  AudienceActivity,
  ChannelProfile,
  ChartPeriod,
  DashboardHighlights,
  DashboardStats,
  NotificationPreferences,
  TablePeriod,
  TopVideo,
  User,
  ViewsSeries,
} from "../../types";

export interface UpdateProfileData {
  name?: string;
  profileImage?: File;
}

function buildUpdateProfileFormData(data: UpdateProfileData): FormData {
  const formData = new FormData();
  if (data.name) formData.append("name", data.name);
  if (data.profileImage) formData.append("profileImage", data.profileImage);
  return formData;
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChannel: builder.query<ChannelProfile, string | number>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Channel", id }],
    }),
    updatePreferences: builder.mutation<User, NotificationPreferences>({
      query: (prefs) => ({ url: "/users/preferences", method: "PATCH", body: prefs }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        const { data } = await queryFulfilled;
        dispatch(setUser(data));
      },
    }),
    toggleSubscribe: builder.mutation<{ subscribed: boolean; subscriberCount: number }, string | number>({
      query: (id) => ({ url: `/users/${id}/subscribe`, method: "POST" }),
      invalidatesTags: (_result, _error, id) => [{ type: "Channel", id }],
    }),
    updateProfile: builder.mutation<User, UpdateProfileData>({
      query: (data) => ({ url: "/users/me", method: "PATCH", body: buildUpdateProfileFormData(data) }),
      invalidatesTags: (result) => (result ? [{ type: "Channel", id: result.id }] : []),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        const { data } = await queryFulfilled;
        dispatch(setUser(data));
      },
    }),
    changePassword: builder.mutation<{ message: string }, { currentPassword: string; newPassword: string }>({
      query: (body) => ({ url: "/users/me/password", method: "PATCH", body }),
    }),
    getDashboard: builder.query<DashboardStats, void>({
      query: () => "/users/me/dashboard",
      providesTags: ["Dashboard"],
    }),
    getDashboardHighlights: builder.query<DashboardHighlights, ChartPeriod>({
      query: (period) => ({ url: "/users/me/dashboard/highlights", params: { period } }),
      providesTags: ["Dashboard"],
    }),
    getViewsSeries: builder.query<ViewsSeries, ChartPeriod>({
      query: (period) => ({ url: "/users/me/dashboard/views-series", params: { period } }),
      providesTags: ["Dashboard"],
    }),
    getTopVideos: builder.query<TopVideo[], TablePeriod>({
      query: (period) => ({ url: "/users/me/dashboard/top-videos", params: { period } }),
      providesTags: ["Dashboard"],
    }),
    getRecentActivity: builder.query<ActivityItem[], void>({
      query: () => "/users/me/dashboard/activity",
      providesTags: ["Dashboard"],
    }),
    getAudienceActivity: builder.query<AudienceActivity, void>({
      query: () => "/users/me/dashboard/audience",
      providesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useGetChannelQuery,
  useUpdatePreferencesMutation,
  useToggleSubscribeMutation,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetDashboardQuery,
  useGetDashboardHighlightsQuery,
  useGetViewsSeriesQuery,
  useGetTopVideosQuery,
  useGetRecentActivityQuery,
  useGetAudienceActivityQuery,
} = usersApi;
