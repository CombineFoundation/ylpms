import { z } from "zod";
import { memberIdSchema, optionalMemberIdSchema } from "@/utils/member-id";
import { universityField } from "@/utils/places";
import type { UserRow } from "../shared/users";

export type Sro = UserRow;

export const sroFormSchema = z.object({
  email: z.string().trim(),
  memberId: optionalMemberIdSchema,
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  region: z.string().trim().min(2, "Region must be at least 2 characters"),
  university: universityField(false),
});

export const createSroFormSchema = sroFormSchema.extend({
  email: z.string().trim().email("Enter a valid email address"),
  memberId: memberIdSchema,
});

export type SroForm = z.infer<typeof sroFormSchema>;
