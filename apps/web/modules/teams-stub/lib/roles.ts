/**
 * Team roles stub.
 *
 * Always returns null (no team restrictions) since RBAC is an enterprise feature.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import "server-only";
import type { TTeamPermission } from "@/modules/teams-stub/types/team";

/** Always returns null — no team-based project permission restrictions. */
export const getProjectPermissionByUserId = async (
  _userId: string,
  _projectId: string
): Promise<TTeamPermission | null> => null;

/** Always returns null — no team role restrictions. */
export const getTeamRoleByTeamIdUserId = async (
  _teamId: string,
  _userId: string
): Promise<"admin" | "contributor" | null> => null;

/** Always returns empty array — no admin teams. */
export const getTeamsWhereUserIsAdmin = async (
  _userId: string,
  _organizationId: string
): Promise<string[]> => [];
