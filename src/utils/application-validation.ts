import { z } from "zod";

/**
 * Public YLP application form (landing page "Apply" buttons). Kept apart from
 * validation.ts so the landing page can check fields with the same rules the
 * API uses without bundling the university/city lists.
 */

/** A Pakistani mobile number, with or without +92 / 0092 / 0, as 03XXXXXXXXX. */
export function normalizePakistanMobile(value: string) {
  const digits = value.replace(/[\s()-]/g, "");
  const match = /^(?:\+92|0092|92|0)?(3\d{9})$/.exec(digits);
  return match ? `0${match[1]}` : null;
}

export const applicationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your full name")
    .max(80, "Name is too long")
    .regex(/^[\p{L}\s.'-]+$/u, "Use letters only"),
  email: z.string().trim().toLowerCase().max(120, "Email is too long").email("Enter a valid email address"),
  contact: z
    .string()
    .trim()
    .refine((value) => normalizePakistanMobile(value) !== null, "Enter a Pakistani mobile number, e.g. 03001234567")
    .transform((value) => normalizePakistanMobile(value) as string),
  /** Honeypot: hidden from people, filled in by bots. */
  website: z.string().optional(),
});

export type ApplicationInput = z.input<typeof applicationSchema>;
