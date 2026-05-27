/**
 * Contact attribute keys stub.
 *
 * Returns empty arrays since contacts are an EE feature.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import "server-only";

/** Returns empty array — contacts disabled. */
export const getContactAttributeKeys = async (_environmentId: string): Promise<any[]> => [];
