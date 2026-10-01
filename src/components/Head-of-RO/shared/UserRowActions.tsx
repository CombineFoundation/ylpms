"use client";

import { Ban, Pencil, RotateCcw, Trash2 } from "lucide-react";
import type { UserStatus } from "@/types/user.types";
import type { UserRow } from "./users";

type UserRowActionsProps = {
  user: UserRow;
  onEdit?: (user: UserRow) => void;
  onDelete?: (user: UserRow) => void;
  onStatusChange?: (user: UserRow, status: UserStatus) => void;
};

/** Edit / suspend-or-reactivate / delete icon buttons for a user table row. */
export function UserRowActions({ user, onEdit, onDelete, onStatusChange }: UserRowActionsProps) {
  const isDisabled = user.storedStatus === "inactive" || user.storedStatus === "suspended";

  return (
    <div className="flex items-center gap-3">
      {onEdit && (
        <button
          type="button"
          onClick={() => onEdit(user)}
          aria-label={`Edit ${user.name}`}
          title="Edit"
          className="text-gray-400 hover:text-gray-600"
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}
      {onStatusChange &&
        (isDisabled ? (
          <button
            type="button"
            onClick={() => onStatusChange(user, "active")}
            aria-label={`Reactivate ${user.name}`}
            title="Reactivate"
            className="text-gray-400 hover:text-emerald-600"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onStatusChange(user, "suspended")}
            aria-label={`Suspend ${user.name}`}
            title="Suspend"
            className="text-gray-400 hover:text-amber-600"
          >
            <Ban className="h-4 w-4" />
          </button>
        ))}
      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete(user)}
          aria-label={`Delete ${user.name}`}
          title="Delete"
          className="text-gray-400 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
