import toast from "react-hot-toast";
import { getRtkErrorMessage } from "../store/lib/getRtkErrorMessage";

export function notifySuccess(message: string) {
  toast.success(message);
}

export function notifyError(message: string) {
  toast.error(message);
}

export function notifyApiError(err: unknown) {
  toast.error(getRtkErrorMessage(err));
}
