/**
 * Team permission utility stubs.
 *
 * Always returns full access since RBAC is an enterprise feature.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { TTeamPermission } from "@/modules/teams-stub/types/team";

export type TTeamRole = "admin" | "contributor";

export const getTeamAccessFlags = (_role?: TTeamRole | null) => ({
  isAdmin: true,
  isContributor: false,
});

export const getTeamPermissionFlags = (_permissionLevel?: TTeamPermission | null) => ({
  hasReadAccess: true,
  hasReadWriteAccess: true,
  hasManageAccess: true,
});
