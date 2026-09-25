import "server-only";
import jwt from "jsonwebtoken";
import { logger } from "@formbricks/logger";
import { NEXTAUTH_SECRET } from "@/lib/constants";

const PIN_TOKEN_PURPOSE = "link_survey_pin";
const PIN_TOKEN_TTL_SECONDS = 60 * 60; // 1 hour

// Resolved lazily (not at module scope) so tests mocking "@/lib/constants" keep working.
const resolvePinTokenSecret = (): string | undefined => NEXTAUTH_SECRET;

export const createLinkSurveyPinToken = (surveyId: string): string => {
  const secret = resolvePinTokenSecret();
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is not set");
  }
  return jwt.sign({ surveyId, purpose: PIN_TOKEN_PURPOSE }, secret, {
    algorithm: "HS256",
    expiresIn: PIN_TOKEN_TTL_SECONDS,
  });
};

export const verifyLinkSurveyPinToken = (token: string | null | undefined, surveyId: string): boolean => {
  const secret = resolvePinTokenSecret();
  if (!token || !secret) {
    return false;
  }
  try {
    const payload = jwt.verify(token, secret, { algorithms: ["HS256"] }) as jwt.JwtPayload & {
      surveyId?: string;
      purpose?: string;
    };
    return payload.purpose === PIN_TOKEN_PURPOSE && payload.surveyId === surveyId;
  } catch (error) {
    logger.warn({ error, surveyId }, "Invalid link survey PIN token");
    return false;
  }
};
