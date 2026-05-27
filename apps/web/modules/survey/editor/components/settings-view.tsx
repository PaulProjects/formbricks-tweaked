import { ActionClass, Environment, OrganizationRole } from "@prisma/client";
import { type Dispatch, type SetStateAction } from "react";
import { TContactAttributeKey } from "@formbricks/types/contact-attribute-key";
import { TSurveyQuota } from "@formbricks/types/quota";
import { TSegment } from "@formbricks/types/segment";
import { TSurvey } from "@formbricks/types/surveys/types";
import { HowToSendCard } from "@/modules/survey/editor/components/how-to-send-card";
import { RecontactOptionsCard } from "@/modules/survey/editor/components/recontact-options-card";
import { ResponseOptionsCard } from "@/modules/survey/editor/components/response-options-card";
import { SurveyPlacementCard } from "@/modules/survey/editor/components/survey-placement-card";
import { WhenToSendCard } from "@/modules/survey/editor/components/when-to-send-card";
import { TTeamPermission } from "@/modules/teams-stub/types/team";

interface SettingsViewProps {
  environment: Pick<Environment, "id" | "appSetupCompleted">;
  localSurvey: TSurvey;
  setLocalSurvey: Dispatch<SetStateAction<TSurvey>>;
  actionClasses: ActionClass[];
  contactAttributeKeys: TContactAttributeKey[];
  segments: TSegment[];
  responseCount: number;
  membershipRole?: OrganizationRole;
  isUserTargetingAllowed?: boolean;
  isSpamProtectionAllowed: boolean;
  projectPermission: TTeamPermission | null;
  isFormbricksCloud: boolean;
  isQuotasAllowed: boolean;
  quotas: TSurveyQuota[];
}

export const SettingsView = ({
  environment,
  localSurvey,
  setLocalSurvey,
  actionClasses,
  contactAttributeKeys: _contactAttributeKeys,
  segments: _segments,
  responseCount,
  membershipRole,
  isUserTargetingAllowed: _isUserTargetingAllowed = false,
  isSpamProtectionAllowed,
  isQuotasAllowed: _isQuotasAllowed,
  projectPermission,
  isFormbricksCloud: _isFormbricksCloud,
  quotas: _quotas,
}: SettingsViewProps) => {
  const isAppSurvey = localSurvey.type === "app";

  return (
    <div className="mt-12 space-y-3 p-5">
      <HowToSendCard localSurvey={localSurvey} setLocalSurvey={setLocalSurvey} environment={environment} />

      <WhenToSendCard
        localSurvey={localSurvey}
        setLocalSurvey={setLocalSurvey}
        environmentId={environment.id}
        propActionClasses={actionClasses}
        membershipRole={membershipRole}
        projectPermission={projectPermission}
      />

      <ResponseOptionsCard
        localSurvey={localSurvey}
        setLocalSurvey={setLocalSurvey}
        responseCount={responseCount}
        isSpamProtectionAllowed={isSpamProtectionAllowed}
      />

      <RecontactOptionsCard localSurvey={localSurvey} setLocalSurvey={setLocalSurvey} />

      {isAppSurvey && (
        <SurveyPlacementCard
          localSurvey={localSurvey}
          setLocalSurvey={setLocalSurvey}
          environmentId={environment.id}
        />
      )}
    </div>
  );
};
