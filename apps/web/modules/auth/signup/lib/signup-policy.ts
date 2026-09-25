import { InvalidInputError } from "@formbricks/types/errors";
import { SIGNUP_ENABLED } from "@/lib/constants";
import { getIsFreshInstance } from "@/lib/instance/service";
import { verifyInviteToken } from "@/lib/jwt";
import { getInvite } from "@/modules/auth/signup/lib/invite";
import { getIsMultiOrgEnabled } from "@/modules/license-stub/lib/utils";

// An invite may only be redeemed by the invited address and before it expires (ENG-2091).
export const getValidInvite = async (inviteToken: string, email: string) => {
  const inviteTokenData = verifyInviteToken(inviteToken);
  const invite = await getInvite(inviteTokenData.inviteId);
  const normalizedEmail = email.toLowerCase();

  if (
    !invite ||
    invite.expiresAt < new Date() ||
    invite.email.toLowerCase() !== normalizedEmail ||
    inviteTokenData.email.toLowerCase() !== normalizedEmail
  ) {
    throw new InvalidInputError("Invalid or expired invite");
  }

  return invite;
};

// Mirrors the signup page gate so the action cannot be called directly on a closed instance.
export const assertSignupAllowed = async (inviteToken: string | undefined, email: string) => {
  if (inviteToken) {
    await getValidInvite(inviteToken, email);
    return;
  }

  if (SIGNUP_ENABLED && (await getIsMultiOrgEnabled())) return;
  if (await getIsFreshInstance()) return;

  throw new InvalidInputError("Sign up is disabled");
};
