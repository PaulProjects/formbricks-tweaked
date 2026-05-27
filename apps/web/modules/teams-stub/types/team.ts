/**
 * Team permission type stubs.
 *
 * Preserves the type definitions used by the survey editor and other
 * components, without any enterprise-licensed logic.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from "zod";

export const ZTeamPermission = z.enum(["read", "readWrite", "manage"]);
export type TTeamPermission = "read" | "readWrite" | "manage";
export type TOrganizationMember = any;

export type TProjectTeam = {
  id: string;
  name: string;
  memberCount: number;
  permission: TTeamPermission;
};

export type TOrganizationTeam = {
  id: string;
  name: string;
};

export type TTeamRole = "admin" | "contributor";

export type TTeamDetails = {
  id: string;
  name: string;
  organizationId: string;
  members: { userId: string; name: string; role: TTeamRole }[];
  projects: { projectId: string; projectName: string; permission: TTeamPermission }[];
};

export type TTeam = {
  id: string;
  name: string;
  teamUsers: { role: TTeamRole; id: string; name: string; email: string; isRoleEditable: boolean }[];
};

export type TTeamSettingsFormSchema = {
  name: string;
  members: { userId: string; role: TTeamRole }[];
  projects: { projectId: string; permission: TTeamPermission }[];
};
