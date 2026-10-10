import { getInitials } from "@/utils/user-status";
import { StatusBadge, TableMessageRow } from "@/components/Head-of-RO/shared/ListParts";
import type { UserRow } from "@/components/Head-of-RO/shared/users";
import { SetPasswordButton } from "@/components/Head-of-RO/shared/UserRowActions";

type YouthLeaderTableProps = {
  leaders: UserRow[];
  isLoading: boolean;
  error: string | null;
  emptyMessage: string;
  /** Set a temporary password for a youth leader who hasn't signed in yet. */
  onSetPassword?: (leader: UserRow) => void;
};

const AVATAR_COLORS = ["bg-pink-500", "bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-brand"];
const avatarColor = (id: string) => AVATAR_COLORS[[...id].reduce((sum, c) => sum + c.charCodeAt(0), 0) % AVATAR_COLORS.length];

export function YouthLeaderTable({ leaders, isLoading, error, emptyMessage, onSetPassword }: YouthLeaderTableProps) {
  const colSpan = onSetPassword ? 6 : 5;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold text-gray-500">
            <th className="px-5 py-3">Name</th>
            <th className="px-4 py-3">City</th>
            <th className="px-4 py-3">Volunteers Under</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Joined</th>
            {onSetPassword && <th className="px-4 py-3">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {isLoading && <TableMessageRow colSpan={colSpan} message="Loading youth leaders..." />}
          {!isLoading && error && <TableMessageRow colSpan={colSpan} message={error} error />}

          {!isLoading &&
            !error &&
            leaders.map((leader) => (
              <tr key={leader.id} className="transition-colors hover:bg-gray-50/60">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${avatarColor(leader.id)}`}
                    >
                      {getInitials(leader.name) || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-800">{leader.name}</p>
                      <p className="truncate text-xs text-gray-400">{leader.memberId ? `ID ${leader.memberId} · ` : ""}{leader.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-gray-600">{leader.regionLabel}</td>
                <td className="px-4 py-4 text-gray-600">
                  {leader.directReportCount} member{leader.directReportCount === 1 ? "" : "s"}
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={leader.status} />
                </td>
                <td className="px-4 py-4 text-gray-500">{leader.joined}</td>
                {onSetPassword && (
                  <td className="px-4 py-4">
                    {leader.status === "Pending" && <SetPasswordButton name={leader.name} onClick={() => onSetPassword(leader)} />}
                  </td>
                )}
              </tr>
            ))}

          {!isLoading && !error && leaders.length === 0 && <TableMessageRow colSpan={colSpan} message={emptyMessage} />}
        </tbody>
      </table>
    </div>
  );
}
