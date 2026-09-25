import { responses } from "@/app/lib/api/response";
import { withV1ApiWrapper } from "@/app/lib/api/with-api-logging";
import { AIRTABLE_CLIENT_ID, WEBAPP_URL } from "@/lib/constants";
import { hasUserEnvironmentAccessForAction } from "@/lib/environment/auth";
import { createIntegrationOAuthState, generatePkcePair } from "@/lib/oauth/integration-state";

const scope = `data.records:read data.records:write schema.bases:read schema.bases:write user.email:read`;

export const GET = withV1ApiWrapper({
  handler: async ({ req, authentication }) => {
    if (!authentication || !("user" in authentication)) {
      return { response: responses.notAuthenticatedResponse() };
    }

    const environmentId = req.headers.get("environmentId");

    if (!environmentId) {
      return {
        response: responses.badRequestResponse("environmentId is missing"),
      };
    }

    const canUserAccessEnvironment = await hasUserEnvironmentAccessForAction(
      authentication.user.id,
      environmentId,
      { write: true }
    );
    if (!canUserAccessEnvironment) {
      return {
        response: responses.unauthorizedResponse(),
      };
    }

    const client_id = AIRTABLE_CLIENT_ID;
    const redirect_uri = WEBAPP_URL + "/api/v1/integrations/airtable/callback";
    if (!client_id)
      return {
        response: responses.internalServerErrorResponse("Airtable client id is missing"),
      };
    const { codeChallenge, codeChallengeMethod, codeVerifier } = generatePkcePair();
    const state = await createIntegrationOAuthState({
      provider: "airtable",
      userId: authentication.user.id,
      environmentId,
      pkceCodeVerifier: codeVerifier,
    });

    const authUrl = new URL("https://airtable.com/oauth2/v1/authorize");

    authUrl.searchParams.append("client_id", client_id);
    authUrl.searchParams.append("redirect_uri", redirect_uri);
    authUrl.searchParams.append("state", state);
    authUrl.searchParams.append("scope", scope);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("code_challenge_method", codeChallengeMethod);
    authUrl.searchParams.append("code_challenge", codeChallenge);

    return {
      response: responses.successResponse({ authUrl: authUrl.toString() }),
    };
  },
});
