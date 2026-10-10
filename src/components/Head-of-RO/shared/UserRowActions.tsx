"use client";

import { Ban, KeyRound, LockKeyhole, Pencil, RotateCcw, Trash2 } from "lucide-react";
import type { UserStatus } from "@/types/user.types";
import type { UserRow } from "./users";

type UserRowActionsProps = {
  user: UserRow;
  onEdit?: (user: UserRow) => void;
  onDelete?: (user: UserRow) => void;
  onStatusChange?: (user: UserRow, status: UserStatus) => void;
  /** Email them a link to set a new password. */
  onSendReset?: (user: UserRow) => void;
  /** Set a temporary password to pass on directly. Only shown until they first sign in. */
  onSetPassword?: (user: UserRow) => void;
};

/** Edit / suspend-or-reactivate / delete icon buttons for a user table row. */
export function UserRowActions({ user, onEdit, onDelete, onStatusChange, onSendReset, onSetPassword }: UserRowActionsProps) {
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
      {onSendReset && (
        <button
          type="button"
          onClick={() => onSendReset(user)}
          aria-label={`Send ${user.name} a password reset link`}
          title="Send password reset link"
          className="text-gray-400 hover:text-brand"
        >
          <KeyRound className="h-4 w-4" />
        </button>
      )}
      {onSetPassword && user.status === "Pending" && <SetPasswordButton name={user.name} onClick={() => onSetPassword(user)} />}
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

/** Icon button for "Set temporary password"; callers show it only for members who haven't signed in. */
export function SetPasswordButton({ name, onClick }: { name: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Set a temporary password for ${name}`}
      title="Set temporary password"
      className="text-gray-400 hover:text-brand"
    >
      <LockKeyhole className="h-4 w-4" />
    </button>
  );
}
