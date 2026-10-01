import type { FieldErrors, FieldValues, Resolver } from "react-hook-form";
import type { ZodType } from "zod";

/**
 * Minimal React Hook Form resolver for a Zod schema (avoids pulling in
 * @hookform/resolvers for the few forms that need it). Validates the whole
 * form and maps each issue to its field path.
 */
export function zodResolver<T extends FieldValues>(schema: ZodType<T>): Resolver<T> {
  return async (values) => {
    const result = await schema.safeParseAsync(values);
    if (result.success) {
      return { values: result.data, errors: {} };
    }

    const errors: Record<string, { type: string; message: string }> = {};
    for (const issue of result.error.errors) {
      const path = issue.path.join(".") || "root";
      if (!errors[path]) errors[path] = { type: issue.code, message: issue.message };
    }
    return { values: {}, errors: errors as unknown as FieldErrors<T> };
  };
}

/** Copies server-side field errors (from ApiError.fieldErrors) onto the form. */
export function applyServerFieldErrors(
  fieldErrors: Record<string, string[]> | undefined,
  setError: (name: never, error: { type: string; message: string }) => void,
  knownFields: readonly string[]
): boolean {
  if (!fieldErrors) return false;
  let applied = false;
  Object.entries(fieldErrors).forEach(([field, messages]) => {
    if (knownFields.includes(field) && messages[0]) {
      setError(field as never, { type: "server", message: messages[0] });
      applied = true;
    }
  });
  return applied;
}
