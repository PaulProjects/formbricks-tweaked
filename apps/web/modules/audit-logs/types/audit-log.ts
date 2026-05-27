/**
 * Audit log type stubs.
 *
 * These are lightweight type definitions that preserve the same public API surface
 * as the original audit-log types so that existing consumers compile without changes.
 * No enterprise-licensed code is included — only type declarations and a sentinel constant.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const UNKNOWN_DATA = "unknown";

export type TAuditTarget =
  | "segment"
  | "survey"
  | "webhook"
  | "user"
  | "contactAttributeKey"
  | "projectTeam"
  | "team"
  | "actionClass"
  | "response"
  | "contact"
  | "organization"
  | "tag"
  | "project"
  | "language"
  | "invite"
  | "membership"
  | "twoFactorAuth"
  | "apiKey"
  | "integration"
  | "file"
  | "quota";

export type TAuditAction =
  | "created"
  | "updated"
  | "deleted"
  | "signedIn"
  | "merged"
  | "verificationEmailSent"
  | "createdFromCSV"
  | "copiedToOtherEnvironment"
  | "addedToResponse"
  | "removedFromResponse"
  | "createdUpdated"
  | "subscriptionAccessed"
  | "subscriptionUpdated"
  | "twoFactorVerified"
  | "emailVerified"
  | "jwtTokenCreated"
  | "authenticationAttempted"
  | "authenticationSucceeded"
  | "passwordVerified"
  | "twoFactorAttempted"
  | "twoFactorRequired"
  | "emailVerificationAttempted"
  | "userSignedOut"
  | "passwordReset"
  | "bulkCreated";

export type TActor = "user" | "api" | "system";

export type TAuditStatus = "success" | "failure";

export type TAuditLogEvent = {
  actor: { id: string; type: TActor };
  action: TAuditAction;
  target: { id: string | undefined; type: TAuditTarget };
  status: TAuditStatus;
  timestamp: string;
  organizationId: string;
  ipAddress?: string;
  changes?: Record<string, unknown>;
  eventId?: string;
  apiUrl?: string;
};
