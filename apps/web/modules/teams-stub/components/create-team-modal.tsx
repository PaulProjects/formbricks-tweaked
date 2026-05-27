/**
 * Create team modal stub.
 *
 * Always returns null since Teams are an EE feature.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const CreateTeamModal = (_props: {
  open?: boolean;
  setOpen?: any;
  organizationId?: string;
  onCreate?: (teamId: string) => void;
}) => null;
