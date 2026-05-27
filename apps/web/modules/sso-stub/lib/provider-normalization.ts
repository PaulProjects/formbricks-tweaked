/**
 * SSO provider normalization stub.
 *
 * Returns a no-op function since SSO is an EE feature.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const getAccountDeletionSSOReauthTarget = async (..._args: any[]) => ({ target: null });
export const getSsoProviderLookupCandidates = (..._args: any[]): any[] => [];
export const normalizeSsoProvider = (..._args: any[]): any => null;
