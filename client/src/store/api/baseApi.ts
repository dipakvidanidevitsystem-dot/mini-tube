import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { logout } from "../slices/authSlice";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  credentials: "include",
});

// The access-token cookie is short-lived; on a 401 we transparently try
// /auth/refresh once (which reads the httpOnly refresh-token cookie) and
// retry the original request, only logging the user out if that also fails.
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const refreshResult = await rawBaseQuery({ url: "/auth/refresh", method: "POST" }, api, extraOptions);

    if (refreshResult.data) {
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
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
