/**
 * Stub license module.
 *
 * Returns an inactive / no-license state for all license queries.
 * This replaces the enterprise license fetching and caching logic.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import "server-only";
import type {
  TEnterpriseLicenseDetails,
  TEnterpriseLicenseFeatures,
} from "@/modules/license-stub/types/enterprise-license";

type TEnterpriseLicenseResult = {
  active: boolean;
  features: TEnterpriseLicenseFeatures | null;
  lastChecked: Date;
  isPendingDowngrade: boolean;
  fallbackLevel: "live" | "cached" | "grace" | "default";
  status: "active" | "expired" | "instance_mismatch" | "unreachable" | "invalid_license" | "no-license";
};

/** Always returns an inactive license. */
export const getEnterpriseLicense = async (): Promise<TEnterpriseLicenseResult> => ({
  active: false,
  features: null,
  lastChecked: new Date(),
  isPendingDowngrade: false,
  fallbackLevel: "default",
  status: "no-license",
});

/** Always returns null (no license features). */
export const getLicenseFeatures = async (): Promise<TEnterpriseLicenseFeatures | null> => null;

/** No-op: nothing to clear. */
export const clearLicenseCache = async (): Promise<void> => {};

/** Always returns null. */
export const fetchLicenseFresh = async (): Promise<TEnterpriseLicenseDetails | null> => null;

/** Always returns null. */
export const fetchLicense = async (): Promise<TEnterpriseLicenseDetails | null> => null;

/** Returns inactive license state. */
export const computeFreshLicenseState = async (
  _freshLicense: TEnterpriseLicenseDetails | null
): Promise<TEnterpriseLicenseResult> => ({
  active: false,
  features: null,
  lastChecked: new Date(),
  isPendingDowngrade: false,
  fallbackLevel: "default",
  status: "no-license",
});

export const GRACE_PERIOD_MS = 0;
export const FETCH_LICENSE_TTL_MS = 0;
export const FAILED_FETCH_TTL_MS = 0;

export const getCacheKeys = () => ({
  FETCH_LICENSE_CACHE_KEY: "license:no-license:status",
  PREVIOUS_RESULT_CACHE_KEY: "license:no-license:previous_result",
  FETCH_LOCK_CACHE_KEY: "license:no-license:fetch_lock",
});

export class LicenseApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "LicenseApiError";
  }
}
