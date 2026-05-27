/**
 * Quotas service stub.
 *
 * Returns empty quotas since quotas are an EE feature.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import "server-only";

/** Returns empty quotas array. */
export const getQuotas = async (_surveyId: string): Promise<any[]> => [];
export const getQuota = async (..._args: any[]): Promise<any> => null;
export const reduceQuotaLimits = async (..._args: any[]) => {};
