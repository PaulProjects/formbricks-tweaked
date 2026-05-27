/**
 * Stub license utilities.
 *
 * All EE-only features return false. Whitelabel features return true (always enabled).
 * This replaces the enterprise license-check module with hardcoded defaults.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import "server-only";

// Whitelabel features: always enabled (no license gating)
export const getRemoveBrandingPermission = async (_organizationId: string): Promise<boolean> => true;
export const getWhiteLabelPermission = async (_organizationId: string): Promise<boolean> => true;

// EE features: always disabled
export const getBiggerUploadFileSizePermission = async (_organizationId: string): Promise<boolean> => false;
export const getIsMultiOrgEnabled = async (): Promise<boolean> => false;
export const getIsContactsEnabled = async (_organizationId: string): Promise<boolean> => false;
export const getIsTwoFactorAuthEnabled = async (): Promise<boolean> => false;
export const getIsSsoEnabled = async (): Promise<boolean> => false;
export const getIsQuotasEnabled = async (_organizationId: string): Promise<boolean> => false;
export const getIsAISmartToolsEnabled = async (_organizationId: string): Promise<boolean> => false;
export const getIsAIDataAnalysisEnabled = async (_organizationId: string): Promise<boolean> => false;
export const getIsAuditLogsEnabled = async (): Promise<boolean> => false;
export const getIsSamlSsoEnabled = async (): Promise<boolean> => false;
export const getIsSpamProtectionEnabled = async (_organizationId: string): Promise<boolean> => false;
export const getAccessControlPermission = async (_organizationId: string): Promise<boolean> => false;
export const getOrganizationProjectsLimit = async (_organizationId: string): Promise<number> => 3;
