/**
 * BrandingSettingsCard component.
 *
 * Settings card for toggling branding on link and app surveys.
 * Always enabled (no license gating).
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Project } from "@prisma/client";
import { SettingsCard } from "@/app/(app)/environments/[environmentId]/settings/components/SettingsCard";
import { getTranslate } from "@/lingodotdev/server";
import { Alert, AlertDescription } from "@/modules/ui/components/alert";
import { EditBranding } from "@/modules/whitelabel/remove-branding/components/edit-branding";

interface BrandingSettingsCardProps {
  canRemoveBranding: boolean;
  project: Project;
  environmentId: string;
  isReadOnly: boolean;
}

export const BrandingSettingsCard = async ({
  canRemoveBranding: _canRemoveBranding,
  project,
  environmentId: _environmentId,
  isReadOnly,
}: BrandingSettingsCardProps) => {
  const t = await getTranslate();

  return (
    <SettingsCard
      title={t("environments.workspace.look.formbricks_branding")}
      description={t("environments.workspace.look.formbricks_branding_settings_description")}>
      <div className="space-y-4">
        <EditBranding
          type="linkSurvey"
          isEnabled={project.linkSurveyBranding}
          projectId={project.id}
          isReadOnly={isReadOnly}
        />
        <EditBranding
          type="appSurvey"
          isEnabled={project.inAppSurveyBranding}
          projectId={project.id}
          isReadOnly={isReadOnly}
        />
      </div>
      {isReadOnly && (
        <Alert variant="warning" className="mt-4">
          <AlertDescription>
            {t("common.only_owners_managers_and_manage_access_members_can_perform_this_action")}
          </AlertDescription>
        </Alert>
      )}
    </SettingsCard>
  );
};
