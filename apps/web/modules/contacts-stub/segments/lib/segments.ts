/**
 * Segments stub.
 *
 * Returns empty arrays since segments are an EE feature.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import "server-only";

/** Returns empty array — segments disabled. */
export const getSegments = async (_environmentId: string): Promise<any[]> => [];
