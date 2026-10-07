import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

interface UploadOptions {
  resourceType: "image" | "video";
  folder: string;
}

class CloudinaryService {
  private static configured = false;

  private static ensureConfigured() {
    if (CloudinaryService.configured) return;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    CloudinaryService.configured = true;
  }

  static uploadStream(buffer: Buffer, { resourceType, folder }: UploadOptions) {
    CloudinaryService.ensureConfigured();
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: resourceType, folder },
        (error, result) => {
          if (error) return reject(error);
          resolve(result as UploadApiResponse);
        }
      );
      stream.end(buffer);
    });
  }
}

export { CloudinaryService };
