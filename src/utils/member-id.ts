import { z } from "zod";

/**
 * A person's program ID (e.g. "CF-YL-0012"), entered when their account is
 * created. Stored upper-case and unique across users. Shared by the client
 * forms and the API schemas.
 */
export const memberIdSchema = z
  .string()
  .trim()
  .min(2, "ID must be at least 2 characters")
  .max(32, "ID must be 32 characters or fewer")
  .regex(/^[A-Za-z0-9][A-Za-z0-9_\-/]*$/, "Use letters, numbers, - _ or / only")
  .transform((value) => value.toUpperCase());

export const normalizeMemberId = (value: string) => value.trim().toUpperCase();

/** For edit forms: blank keeps "no ID" (older accounts); anything typed must be a valid ID. */
export const optionalMemberIdSchema = z
  .string()
  .trim()
  .superRefine((value, ctx) => {
    if (value === "") return;
    const result = memberIdSchema.safeParse(value);
    if (!result.success) ctx.addIssue({ code: z.ZodIssueCode.custom, message: result.error.issues[0].message });
  })
  .transform((value) => value.toUpperCase());
