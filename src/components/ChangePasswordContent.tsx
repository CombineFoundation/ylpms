"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Lock } from "lucide-react";
import { getFirebaseAuth } from "@/lib/firebase";
import { zodResolver } from "@/lib/zod-resolver";
import { changeOwnPassword, passwordChangeError, passwordSchema, type PasswordForm } from "@/lib/change-password";
import { signOutUser } from "@/utils/session";

const fieldClass =
  "w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand";

const FIELDS: { name: keyof PasswordForm; label: string; autoComplete: string }[] = [
  { name: "current", label: "Temporary password (from your email)", autoComplete: "current-password" },
  { name: "next", label: "New password", autoComplete: "new-password" },
  { name: "confirm", label: "Confirm new password", autoComplete: "new-password" },
];

/** Only same-site paths, so the link can't send someone elsewhere after sign-in. */
function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/login";
}

/**
 * First sign-in: a new account must replace the temporary password it was
 * emailed before it can use the app (the API refuses everything else until then).
 */
export default function ChangePasswordContent() {
  const next = safeNext(useSearchParams().get("next"));
  const [ready, setReady] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current: "", next: "", confirm: "" },
  });

  useEffect(() => {
    const auth = getFirebaseAuth();
    auth.authStateReady().then(() => {
      if (auth.currentUser) setReady(true);
      else window.location.assign("/login");
    });
  }, []);

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      await changeOwnPassword(values.current, values.next);
      // Full page load, so every screen starts with the unblocked account.
      window.location.assign(next);
    } catch (error) {
      const problem = passwordChangeError(error);
      if (problem.field) form.setError(problem.field, { type: "server", message: problem.message });
      else setFormError(problem.message);
    }
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
            <Lock className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Set your password</h1>
            <p className="text-sm text-gray-500">Replace the temporary password from your welcome email to continue.</p>
          </div>
        </div>

        {!ready ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : (
          <form onSubmit={onSubmit} noValidate className="space-y-4">
            {FIELDS.map((field) => {
              const message = form.formState.errors[field.name]?.message;
              return (
                <div key={field.name}>
                  <label htmlFor={field.name} className="mb-1 block text-sm font-medium text-gray-700">
                    {field.label}
                  </label>
                  <input
                    id={field.name}
                    type="password"
                    autoComplete={field.autoComplete}
                    className={fieldClass}
                    aria-invalid={!!message}
                    {...form.register(field.name)}
                  />
                  {message && (
                    <p role="alert" className="mt-1 text-xs text-red-600">
                      {message}
                    </p>
                  )}
                </div>
              );
            })}
            <p className="text-xs text-gray-500">At least 8 characters, with a letter and a number.</p>

            {formError && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {form.formState.isSubmitting ? "Saving…" : "Save and continue"}
            </button>
            <button
              type="button"
              onClick={() => signOutUser()}
              className="w-full text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Sign out
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
