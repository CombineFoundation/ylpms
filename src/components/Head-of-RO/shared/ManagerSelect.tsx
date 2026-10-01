"use client";

import { useEffect, useState } from "react";
import { apiFetchPage, errorMessage } from "@/lib/api-client";
import type { UserRole } from "@/types/user.types";
import type { ApiUser } from "./users";
import { inputClass } from "./ListParts";

type ManagerSelectProps = {
  id?: string;
  /** Roles eligible to be the manager (e.g. ["sro"] for an RO). */
  roles: UserRole[];
  value: string;
  onChange: (managerId: string) => void;
  disabled?: boolean;
  allowUnassigned?: boolean;
  /** Label for an empty-value option shown when `allowUnassigned` is false (e.g. "Anyone" in a filter). */
  placeholder?: string;
};

const roleLabels: Partial<Record<UserRole, string>> = { sro: "SRO", ro: "RO", "youth-leader": "Youth Leader" };

/**
 * Dropdown of eligible managers. Loads every page of each eligible role
 * (capped) so the list is complete, and hides deactivated/suspended users.
 */
export function ManagerSelect({
  id,
  roles,
  value,
  onChange,
  disabled,
  allowUnassigned = true,
  placeholder,
}: ManagerSelectProps) {
  const [options, setOptions] = useState<ApiUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const rolesKey = roles.join(",");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const all: ApiUser[] = [];
        for (const role of rolesKey.split(",")) {
          for (let page = 1; page <= 20; page++) {
            const { items, meta } = await apiFetchPage<ApiUser>(`/api/users?role=${role}&pageSize=100&pageNumber=${page}`);
            all.push(...items);
            if (!meta.hasMore) break;
          }
        }
        if (!cancelled) {
          setOptions(
            all
              .filter((user) => user.status !== "inactive" && user.status !== "suspended")
              .sort((a, b) => a.name.localeCompare(b.name))
          );
        }
      } catch (err) {
        if (!cancelled) setError(errorMessage(err, "Unable to load managers."));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [rolesKey]);

  const multipleRoles = roles.length > 1;

  return (
    <>
      <select
        id={id}
        value={value}
        disabled={disabled || isLoading}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      >
        {isLoading ? (
          <option value={value}>Loading…</option>
        ) : (
          <>
            {allowUnassigned ? (
              <option value="">Unassigned</option>
            ) : (
              placeholder && <option value="">{placeholder}</option>
            )}
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
                {multipleRoles ? ` (${roleLabels[option.role] || option.role})` : ""}
                {option.region ? ` · ${option.region}` : ""}
              </option>
            ))}
          </>
        )}
      </select>
      {error && <span className="mt-1 block text-xs font-normal text-red-500">{error}</span>}
    </>
  );
}
