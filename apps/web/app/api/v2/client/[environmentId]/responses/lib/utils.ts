import { logger } from "@formbricks/logger";
import { TSurvey } from "@formbricks/types/surveys/types";
import { validateSingleUseResponseInput } from "@/app/api/client/[environmentId]/responses/lib/single-use";
import { getOrganizationBillingByEnvironmentId } from "@/app/api/v2/client/[environmentId]/responses/lib/organization";
import { verifyRecaptchaToken } from "@/app/api/v2/client/[environmentId]/responses/lib/recaptcha";
import { TResponseInputV2 } from "@/app/api/v2/client/[environmentId]/responses/types/response";
import { responses } from "@/app/lib/api/response";
import { getOrganizationIdFromEnvironmentId } from "@/lib/utils/helper";
import { getIsSpamProtectionEnabled } from "@/modules/license-stub/lib/utils";
import { verifyLinkSurveyPinToken } from "@/modules/survey/link/lib/pin-token";
import { validateClientFileUploads } from "@/modules/storage/utils";
import { enforceVerifiedEmailGate } from "@/modules/survey/link/lib/verify-email-gate";

export const RECAPTCHA_VERIFICATION_ERROR_CODE = "recaptcha_verification_failed";

export const checkSurveyValidity = async (
  survey: TSurvey,
  environmentId: string,
  responseInput: TResponseInputV2
): Promise<Response | null> => {
  if (survey.environmentId !== environmentId) {
    return responses.badRequestResponse("Survey does not belong to this environment", undefined, true);
  }

  // PIN-protected link surveys require a server-verifiable PIN token (ENG-1579).
  if (survey.pin && !verifyLinkSurveyPinToken(responseInput.pinAuthToken, survey.id)) {
    return responses.forbiddenResponse("Survey is protected by a PIN", true, { surveyId: survey.id });
  }

  const singleUseValidationResult = validateSingleUseResponseInput(survey, environmentId, responseInput);
  if (singleUseValidationResult) {
    if ("response" in singleUseValidationResult) {
      return singleUseValidationResult.response;
    }
    responseInput.singleUseId = singleUseValidationResult.singleUseId;
  }

  // File-upload answers must be private uploads made for this environment, survey and element (#8044).
  if (
    !validateClientFileUploads({
      data: responseInput.data,
      environmentId,
      surveyId: survey.id,
      blocks: survey.blocks,
      questions: survey.questions,
    })
  ) {
    return responses.badRequestResponse("Invalid file upload response", undefined, true);
  }

  // Email verification must be enforced here, not only in the page renderer: this endpoint is public.
  const verifiedEmailErrorResponse = enforceVerifiedEmailGate({
    survey,
    responseData: responseInput.data,
    metaUrl: responseInput.meta?.url,
  });
  if (verifiedEmailErrorResponse) {
    return verifiedEmailErrorResponse;
  }

  return await verifyResponseRecaptcha(survey, environmentId, responseInput.recaptchaToken);
};

/** Shared by the v1 and v2 client response endpoints so the reCAPTCHA gate cannot drift apart. */
export const verifyResponseRecaptcha = async (
  survey: TSurvey,
  environmentId: string,
  recaptchaToken: string | null | undefined
): Promise<Response | null> => {
  if (survey.recaptcha?.enabled) {
    if (!recaptchaToken) {
      logger.error("Missing recaptcha token");
      return responses.badRequestResponse(
        "Missing recaptcha token",
        {
          code: RECAPTCHA_VERIFICATION_ERROR_CODE,
        },
        true
      );
    }
    const billing = await getOrganizationBillingByEnvironmentId(environmentId);

    if (!billing) {
      return responses.notFoundResponse("Organization", null);
    }

    const organizationId = await getOrganizationIdFromEnvironmentId(environmentId);
    const isSpamProtectionEnabled = await getIsSpamProtectionEnabled(organizationId);

    if (!isSpamProtectionEnabled) {
      logger.error("Spam protection is not enabled for this organization");
    }

    const isPassed = await verifyRecaptchaToken(recaptchaToken, survey.recaptcha.threshold);
    if (!isPassed) {
      return responses.badRequestResponse(
        "reCAPTCHA verification failed",
        {
          code: RECAPTCHA_VERIFICATION_ERROR_CODE,
        },
        true
      );
    }
  }

  return null;
};
