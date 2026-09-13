export const USER_ROLES = [
  "developer",
  "head-ro",
  "sro",
  "ro",
  "youth-leader",
  "volunteer",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type UserProfile = {
  email: string;
  name: string | null;
  role: UserRole;
};
