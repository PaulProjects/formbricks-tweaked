/**
 * Stub for enterprise license feature types.
 *
 * Preserves the type shape so that existing consumers compile.
 * No enterprise-licensed code is included.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type TEnterpriseLicenseFeatures = {
  isMultiOrgEnabled: boolean;
  contacts: boolean;
  projects: number | null;
  whitelabel: boolean;
  removeBranding: boolean;
  twoFactorAuth: boolean;
  sso: boolean;
  saml: boolean;
  spamProtection: boolean;
  aiSmartTools: boolean;
  aiDataAnalysis: boolean;
  auditLogs: boolean;
  accessControl: boolean;
  quotas: boolean;
};

export type TEnterpriseLicenseStatus = "active" | "expired";

export type TEnterpriseLicenseDetails = {
  status: TEnterpriseLicenseStatus;
  features: TEnterpriseLicenseFeatures;
};

export type TLicenseStatus =
  | "active"
  | "expired"
  | "instance_mismatch"
  | "unreachable"
  | "invalid_license"
  | "no-license";
