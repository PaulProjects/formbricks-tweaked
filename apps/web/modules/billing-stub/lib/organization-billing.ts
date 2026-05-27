/**
 * Organization billing stub.
 *
 * Always returns defaults or no-op since billing is an EE feature.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const cleanupStripeCustomer = async (..._args: any[]) => {};
export const ensureCloudStripeSetupForOrganization = async (..._args: any[]) => {};
export const getDefaultOrganizationBilling = (..._args: any[]): any => ({});
export const getOrganizationBillingWithReadThroughSync = async (..._args: any[]): Promise<any> => ({});
