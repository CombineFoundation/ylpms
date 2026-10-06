import { z } from "zod";
import { memberIdSchema } from "@/utils/member-id";
import { cityField, universityField } from "@/utils/places";

export const addYouthLeaderFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .refine((value) => value === "" || /^\+?[0-9][0-9\s-]{6,17}$/.test(value), "Enter a valid phone number"),
  /** The new member's city (stored as their region). */
  region: cityField(true),
  university: universityField(true),
});

/** An RO's youth leader request also carries the new youth leader's ID. */
export const addYouthLeaderWithIdFormSchema = addYouthLeaderFormSchema.extend({ memberId: memberIdSchema });

/** A youth leader's volunteer request also says what the volunteer will do in the team. */
export const addVolunteerFormSchema = addYouthLeaderFormSchema.extend({
  teamRole: z.string().trim().min(2, "Team role must be at least 2 characters").max(60, "Keep the team role under 60 characters"),
});

export type AddYouthLeaderForm = z.infer<typeof addYouthLeaderFormSchema> & { memberId?: string; teamRole?: string };
