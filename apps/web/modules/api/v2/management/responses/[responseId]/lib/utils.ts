import { Response, Survey } from "@prisma/client";
import { logger } from "@formbricks/logger";
import { Result, okVoid } from "@formbricks/types/error-handlers";
import { TSurveyQuestionTypeEnum } from "@formbricks/types/surveys/types";
import { ApiErrorResponseV2 } from "@/modules/api/v2/types/api-error";
import { deleteFile } from "@/modules/storage/service";
import { hasStoragePathTraversal, parseStorageFileUrl } from "@/modules/storage/utils";

export const findAndDeleteUploadedFilesInResponse = async (
  responseData: Response["data"],
  questions: Survey["questions"],
  surveyEnvironmentId: string
): Promise<Result<void, ApiErrorResponseV2>> => {
  const fileUploadQuestions = new Set(
    questions
      .filter(
        (question: { type: string; id: string }) => question.type === TSurveyQuestionTypeEnum.FileUpload
      )
      .map((q: { type: string; id: string }) => q.id)
  );

  const fileUrls = Object.entries(responseData)
    .filter(([questionId]) => fileUploadQuestions.has(questionId))
    .flatMap(([, questionResponse]) => questionResponse as string[]);

  const deletionPromises = fileUrls.map(async (fileUrl) => {
    try {
      // Handles relative and absolute URLs and nested keys (surveys/<id>/elements/<id>/<file>).
      const parsed = parseStorageFileUrl(fileUrl);
      if (!parsed) {
        throw new Error(`Invalid file path: ${fileUrl}`);
      }
      const { storageId: environmentId, accessType, fileName } = parsed;
      const pathname = fileUrl;
      // Never trust the storage id in a stored URL: only delete files of the survey's own environment.
      if (environmentId !== surveyEnvironmentId || hasStoragePathTraversal(fileName)) {
        throw new Error(`Refusing to delete file outside the survey's environment: ${pathname}`);
      }
      return deleteFile(environmentId, accessType, fileName);
    } catch (error) {
      logger.error({ error, fileUrl }, "Failed to delete file");
    }
  });

  await Promise.all(deletionPromises);

  return okVoid();
};
