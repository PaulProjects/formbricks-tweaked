import { Prisma } from "@prisma/client";
import { prisma } from "@formbricks/database";
import { ZId } from "@formbricks/types/common";
import { DatabaseError } from "@formbricks/types/errors";
import { validateInputs } from "../utils/validate";

export const hasUserEnvironmentAccess = async (userId: string, environmentId: string) => {
  validateInputs([userId, ZId], [environmentId, ZId]);

  try {
    const orgMembership = await prisma.membership.findFirst({
      where: {
        userId,
        organization: {
          projects: {
            some: {
              environments: {
                some: {
                  id: environmentId,
                },
              },
            },
          },
        },
      },
    });

    if (!orgMembership) return false;

    if (
      orgMembership.role === "owner" ||
      orgMembership.role === "manager" ||
      orgMembership.role === "billing"
    )
      return true;

    const teamMembership = await prisma.teamUser.findFirst({
      where: {
        userId,
        team: {
          projectTeams: {
            some: {
              project: {
                environments: {
                  some: {
                    id: environmentId,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (teamMembership) return true;

    return false;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(error.message);
    }
    throw error;
  }
};

/**
 * Authorization for the integration OAuth routes. Completing a flow writes the environment's
 * third-party credentials, so it needs write access — unlike {@link hasUserEnvironmentAccess}, which
 * admits the `billing` role and read-only team members. With `write: false` it still excludes billing.
 */
export const canUserAccessEnvironmentIntegrations = async (
  userId: string,
  environmentId: string,
  { write }: { write: boolean }
): Promise<boolean> => {
  validateInputs([userId, ZId], [environmentId, ZId]);

  try {
    const orgMembership = await prisma.membership.findFirst({
      where: {
        userId,
        organization: { projects: { some: { environments: { some: { id: environmentId } } } } },
      },
      select: { role: true },
    });

    if (!orgMembership || orgMembership.role === "billing") return false;
    if (orgMembership.role === "owner" || orgMembership.role === "manager") return true;

    const projectTeam = await prisma.projectTeam.findFirst({
      where: {
        project: { environments: { some: { id: environmentId } } },
        team: { teamUsers: { some: { userId } } },
        ...(write ? { permission: { in: ["readWrite", "manage"] } } : {}),
      },
      select: { teamId: true },
    });

    return !!projectTeam;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(error.message);
    }
    throw error;
  }
};
