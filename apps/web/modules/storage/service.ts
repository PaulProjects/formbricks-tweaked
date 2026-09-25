import { randomUUID } from "crypto";
import { logger } from "@formbricks/logger";
import {
  type FileStreamResult,
  type StorageError,
  StorageErrorCode,
  deleteFile as deleteFileFromS3,
  deleteFilesByPrefix,
  getFileStream,
  getSignedUploadUrl,
} from "@formbricks/storage";
import { Result, err, ok } from "@formbricks/types/error-handlers";
import { TAccessType } from "@formbricks/types/storage";
import { sanitizeFileName } from "./utils";

// Extra key segments (e.g. surveys/<id>/elements/<id>) must be plain identifiers.
const SAFE_FILE_PATH_SEGMENT = /^[A-Za-z0-9_-]+$/;

export const getSignedUrlForUpload = async (
  fileName: string,
  environmentId: string,
  fileType: string,
  accessType: TAccessType,
  maxFileUploadSize: number = 1024 * 1024 * 10, // 10MB
  filePathSegments: string[] = []
): Promise<
  Result<
    {
      signedUrl: string;
      presignedFields: Record<string, string>;
      fileUrl: string;
    },
    StorageError
  >
> => {
  try {
    const safeFileName = sanitizeFileName(fileName);
    if (!safeFileName) {
      return err({ code: StorageErrorCode.InvalidInput });
    }
    const fileNameWithoutExtension = safeFileName.split(".").slice(0, -1).join(".");
    const fileExtension = safeFileName.split(".").pop();

    const updatedFileName = `${fileNameWithoutExtension}--fid--${randomUUID()}.${fileExtension}`;

    if (filePathSegments.some((segment) => !SAFE_FILE_PATH_SEGMENT.test(segment))) {
      return err({ code: StorageErrorCode.InvalidInput });
    }

    const filePath = [environmentId, accessType, ...filePathSegments].join("/");
    const signedUrlResult = await getSignedUploadUrl(updatedFileName, fileType, filePath, maxFileUploadSize);

    if (!signedUrlResult.ok) {
      return signedUrlResult;
    }

    // Return relative path - can be resolved to absolute URL at runtime when needed
    return ok({
      signedUrl: signedUrlResult.data.signedUrl,
      presignedFields: signedUrlResult.data.presignedFields,
      fileUrl: `/storage/${environmentId}/${accessType}/${[
        ...filePathSegments.map((segment) => encodeURIComponent(segment)),
        encodeURIComponent(updatedFileName),
      ].join("/")}`,
    });
  } catch (error) {
    logger.error({ error }, "Error getting signed url for upload");

    return err({
      code: StorageErrorCode.Unknown,
    });
  }
};

/**
 * Get a file stream for downloading/streaming files directly
 * Use this instead of signed URL redirect for Next.js Image component compatibility
 */
export const getFileStreamForDownload = async (
  fileName: string,
  environmentId: string,
  accessType: TAccessType
): Promise<Result<FileStreamResult, StorageError>> => {
  try {
    const fileNameDecoded = decodeURIComponent(fileName);
    const fileKey = `${environmentId}/${accessType}/${fileNameDecoded}`;

    const streamResult = await getFileStream(fileKey);

    if (!streamResult.ok) {
      return streamResult;
    }

    return streamResult;
  } catch (error) {
    logger.error({ error }, "Error getting file stream for download");

    return err({
      code: StorageErrorCode.Unknown,
    });
  }
};

// We don't need to return or throw any errors, even if the file doesn't exist, we should not fail the request, nor log any errors, those will be handled by the deleteFile function
export const deleteFile = async (environmentId: string, accessType: TAccessType, fileName: string) =>
  await deleteFileFromS3(`${environmentId}/${accessType}/${fileName}`);

// We don't need to return or throw any errors, even if the files don't exist, we should not fail the request, nor log any errors, those will be handled by the deleteFilesByPrefix function
export const deleteFilesByEnvironmentId = async (environmentId: string) =>
  await deleteFilesByPrefix(environmentId);
