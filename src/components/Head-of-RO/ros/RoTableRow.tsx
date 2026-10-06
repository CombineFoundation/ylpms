import { getInitials } from "@/utils/user-status";
import type { UserStatus } from "@/types/user.types";
import { StatusBadge } from "../shared/ListParts";
import { UserRowActions } from "../shared/UserRowActions";
import type { Ro } from "./ro.types";

type RoTableRowProps = {
  ro: Ro;
  onEdit: (ro: Ro) => void;
  onDelete: (ro: Ro) => void;
  onStatusChange: (ro: Ro, status: UserStatus) => void;
  onSendReset: (ro: Ro) => void;
};

export function RoTableRow({ ro, onEdit, onDelete, onStatusChange, onSendReset }: RoTableRowProps) {
  return (
    <tr className="hover:bg-gray-50/60">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-white">
            {getInitials(ro.name)}
          </div>
          <div>
            <p className="font-medium text-gray-900">{ro.name}</p>
            <p className="text-xs text-gray-400">{ro.memberId ? `ID ${ro.memberId} · ` : ""}{ro.email}</p>
          </div>
        </div>
      </td>
      <td className={`px-6 py-4 font-medium ${ro.reportingToId ? "text-brand" : "text-gray-400"}`}>{ro.reportingToName}</td>
      <td className="px-6 py-4 text-gray-600">{ro.regionLabel}</td>
      <td className="px-6 py-4 text-gray-600">{ro.directReportCount}</td>
      <td className="px-6 py-4">
        <StatusBadge status={ro.status} />
      </td>
      <td className="px-6 py-4">
        <UserRowActions user={ro} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} onSendReset={onSendReset} />
      </td>
    </tr>
  );
}
