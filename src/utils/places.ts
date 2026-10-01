import { z } from "zod";
import { ALL_HEC_UNIVERSITIES } from "@/config/hec-universities";
import { ALL_PAKISTAN_CITIES } from "@/config/pakistan-cities";

/**
 * University and city fields only accept names from the HEC and Pakistan city
 * lists, so the public site can count distinct universities and cities.
 * Shared by the client forms and the API schemas.
 */

const universities = new Set<string>(ALL_HEC_UNIVERSITIES);
const cities = new Set<string>(ALL_PAKISTAN_CITIES);

export const isHecUniversity = (value: string) => universities.has(value);
export const isPakistanCity = (value: string) => cities.has(value);

/** Required: one of the HEC universities. Optional: that, or "" for none. */
export function universityField(required: boolean) {
  return z
    .string()
    .trim()
    .refine((value) => (value === "" ? !required : isHecUniversity(value)), {
      message: required ? "Choose a university from the list" : "Choose a university from the list, or leave it empty",
    });
}

/** Required: one of the listed cities. Optional: that, or "" for none. */
export function cityField(required: boolean) {
  return z
    .string()
    .trim()
    .refine((value) => (value === "" ? !required : isPakistanCity(value)), {
      message: required ? "Choose a city from the list" : "Choose a city from the list, or leave it empty",
    });
}
