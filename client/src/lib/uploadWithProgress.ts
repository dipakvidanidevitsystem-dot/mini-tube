export interface UploadProgressEvent {
  loaded: number;
  total: number;
  percent: number;
}

export function uploadWithProgress<T>(
  url: string,
  formData: FormData,
  onProgress?: (event: UploadProgressEvent) => void
): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    const token = localStorage.getItem("token");
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable || !onProgress) return;
      onProgress({ loaded: e.loaded, total: e.total, percent: Math.round((e.loaded / e.total) * 100) });
    };

    xhr.onload = () => {
      let body: unknown;
      try {
        body = xhr.responseText ? JSON.parse(xhr.responseText) : undefined;
      } catch {
        body = undefined;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(body as T);
      } else {
        const message =
          body && typeof body === "object" && "message" in body
            ? String((body as { message?: unknown }).message)
            : "Upload failed. Please try again.";
        reject(new Error(message));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed. Please check your connection and try again."));
    xhr.onabort = () => reject(new Error("Upload cancelled."));

    xhr.send(formData);
  });
}
