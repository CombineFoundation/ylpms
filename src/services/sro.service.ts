import { getDocsByIds, selectFields } from "@/utils/firestore";
import { getEffectiveStatus, type DisplayStatus } from "@/utils/user-status";
import { logger } from "@/utils/errors";
import { chunk, getTeam } from "./team.service";
import type { ReportStatus } from "@/types/report.types";
import type { User } from "@/types/user.types";

// ---------------------------------------------------------------------------
// Assigned ROs

export interface SROAssignedRO {
  id: string;
  name: string;
  email?: string;
  region?: string;
  youthLeaders: number;
  volunteers: number;
  openTasks: number;
  overdueTasks: number;
  reports: number;
  performance: number | null;
  status: DisplayStatus;
}

export async function getSROAssignedROs(sroId: string): Promise<SROAssignedRO[]> {
  try {
    const { tree } = await getTeam(sroId);
    const roNodes = (tree.nodes[sroId]?.childIds ?? []).map((id) => tree.nodes[id]).filter((node) => node.role === "ro");
    if (roNodes.length === 0) return [];

    const roIds = roNodes.map((node) => node.id);
    const [users, reportRows] = await Promise.all([
      getDocsByIds<User>("users", roIds),
      Promise.all(
        chunk(roIds).map((ids) =>
          selectFields<{ submittedBy?: string; status?: ReportStatus }>(
            "reports",
            [{ field: "submittedBy", operator: "in", value: ids }],
            ["submittedBy", "status"]
          )
        )
      ).then((groups) => groups.flat()),
    ]);
    const userById = new Map(users.map((user) => [user.id, user]));
    const reportCount = new Map<string, number>();
    reportRows.forEach(({ submittedBy, status }) => {
      if (submittedBy && status !== "draft") reportCount.set(submittedBy, (reportCount.get(submittedBy) || 0) + 1);
    });

    return roNodes.map((node) => {
      const user = userById.get(node.id);
      const youthLeaders = node.childIds.filter((id) => tree.nodes[id]?.role === "youth-leader").length;
      return {
        id: node.id,
        name: node.name,
        email: user?.email,
        region: node.region,
        youthLeaders,
        volunteers: node.teamSize - youthLeaders,
        openTasks: node.teamTasks.assigned - node.teamTasks.completed,
        overdueTasks: node.teamTasks.overdue,
        reports: reportCount.get(node.id) || 0,
        performance: node.performance,
        status: user ? getEffectiveStatus(user) : "Pending",
      };
    });
  } catch (error) {
    logger.error(`Error fetching assigned ROs for SRO ${sroId}`, error);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Youth Leaders

export interface SROYouthLeader {
  id: string;
  name: string;
  email?: string;
  region?: string;
  roId: string | null;
  roName: string;
  volunteers: number;
  openTasks: number;
  overdueTasks: number;
  performance: number | null;
  status: DisplayStatus;
}

/** Every youth leader under the SRO's ROs (view-only for the SRO, per the permissions spec). */
export async function getSROYouthLeaders(sroId: string): Promise<SROYouthLeader[]> {
  try {
    const { tree, members } = await getTeam(sroId);
    const leaderNodes = members.filter((node) => node.role === "youth-leader");
    if (leaderNodes.length === 0) return [];

    const users = await getDocsByIds<User>("users", leaderNodes.map((node) => node.id));
    const userById = new Map(users.map((user) => [user.id, user]));

    return leaderNodes
      .map((node) => {
        const user = userById.get(node.id);
        const ro = node.parentId ? tree.nodes[node.parentId] : undefined;
        return {
          id: node.id,
          name: node.name,
          email: user?.email,
          region: node.region,
          roId: ro?.id ?? null,
          roName: ro?.name ?? "Unassigned",
          volunteers: node.teamSize,
          openTasks: node.ownTasks.assigned - node.ownTasks.completed,
          overdueTasks: node.ownTasks.overdue,
          performance: node.performance,
          status: user ? getEffectiveStatus(user) : ("Pending" as DisplayStatus),
        };
      })
      .sort((a, b) => a.roName.localeCompare(b.roName) || a.name.localeCompare(b.name));
  } catch (error) {
    logger.error(`Error fetching youth leaders for SRO ${sroId}`, error);
    throw error;
  }
}
