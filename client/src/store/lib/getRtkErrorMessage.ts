import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

export function getRtkErrorMessage(error: unknown): string {
  if (!error) return "Something went wrong. Please try again.";

  const fbqError = error as FetchBaseQueryError;
  if (typeof fbqError === "object" && fbqError !== null && "status" in fbqError) {
    if (fbqError.status === "FETCH_ERROR" || fbqError.status === "TIMEOUT_ERROR") {
      return "We can't reach the server right now. Please check your connection and try again in a moment.";
    }
    const data = fbqError.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    return "Something went wrong. Please try again.";
  }

  const serializedError = error as SerializedError;
  if (serializedError.message) return serializedError.message;

  return "Something went wrong. Please try again.";
}
