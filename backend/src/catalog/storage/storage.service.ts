export interface UploadableFile {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}

/**
 * Abstraction over "put a file somewhere and get a URL back". IMORA_TZ §11
 * leaves MinIO vs Cloudflare R2 as an open question, and Docker isn't
 * available in this environment to test a real S3 client against MinIO.
 * `StorageService` is the seam: swap `LocalDiskStorageService` for an
 * S3-backed implementation later without touching callers.
 */
export abstract class StorageService {
  abstract upload(file: UploadableFile, folder: string): Promise<string>;
}
