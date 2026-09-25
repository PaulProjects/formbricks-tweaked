import { Invite, User } from "@prisma/client";

export interface InviteWithCreator extends Pick<
    Invite,
    "id" | "organizationId" | "role" | "teamIds" | "email" | "expiresAt"
  > {
  creator: Pick<User, "name" | "email" | "locale">;
}

export interface CreateMembershipInvite extends Pick<Invite, "organizationId" | "role" | "teamIds"> {}
