"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { AlertTriangle } from "lucide-react";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { apiFetch, errorMessage, ApiError } from "@/lib/api-client";
import { zodResolver, applyServerFieldErrors } from "@/lib/zod-resolver";
import { useCurrentProfile, roleTitles } from "@/hooks/useCurrentProfile";
import { signOutUser } from "@/utils/session";
import { getInitials } from "@/utils/user-status";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { UniversitySelect } from "@/components/shared/PlaceSelects";
import { universityField } from "@/utils/places";
import { CohortSettings } from "./settings/CohortSettings";
import { FieldError, PageHeader } from "./shared/ListParts";
import type { UserRole } from "@/types/user.types";

type PreferenceKey = "reportSubmissions" | "newRegistrations" | "taskUpdates" | "eventReminders";
type Preferences = Record<PreferenceKey, boolean>;

const preferenceLabels: Record<PreferenceKey, { label: string; hint: string }> = {
  reportSubmissions: { label: "Report submissions", hint: "When someone submits a report for review" },
  newRegistrations: { label: "New user registrations", hint: "When someone is added to your team" },
  taskUpdates: { label: "Task updates", hint: "When a task you assigned is completed" },
  eventReminders: { label: "New event alerts", hint: "When a new event is scheduled" },
};

/** Volunteers don't review reports, assign tasks or manage a team, so those toggles don't apply. */
const preferencesForRole = (role: UserRole | undefined): PreferenceKey[] =>
  role === "volunteer" ? ["eventReminders"] : (Object.keys(preferenceLabels) as PreferenceKey[]);

const profileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim(),
  phone: z
    .string()
    .trim()
    .refine((value) => value === "" || /^\+?[0-9][0-9\s-]{6,17}$/.test(value), "Enter a valid phone number"),
  university: universityField(false),
});
type ProfileForm = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    current: z.string().min(1, "Enter your current password"),
    next: z
      .string()
      .min(8, "Use at least 8 characters")
      .regex(/[A-Za-z]/, "Include at least one letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirm: z.string(),
  })
  .refine((data) => data.next === data.confirm, { message: "Passwords don't match", path: ["confirm"] })
  .refine((data) => data.next !== data.current, { message: "Choose a different password from your current one", path: ["next"] });
type PasswordForm = z.infer<typeof passwordSchema>;

const cardClass = "flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm";
const fieldClass =
  "w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand";
const primaryButton =
  "w-full rounded-lg bg-brand px-4 py-1.5 text-sm font-medium text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60";

export function SettingsForm() {
  const router = useRouter();
  const { profile, isLoading: isLoadingProfile, setProfile } = useCurrentProfile();

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: "", lastName: "", phone: "", university: "" },
  });
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current: "", next: "", confirm: "" },
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [preferencesError, setPreferencesError] = useState<string | null>(null);
  const [savingPreference, setSavingPreference] = useState<PreferenceKey | null>(null);

  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    const [firstName, ...rest] = (profile.name || "").split(" ");
    profileForm.reset({
      firstName: firstName || "",
      lastName: rest.join(" "),
      phone: profile.phone || "",
      university: profile.university || "",
    });
    // Only re-seed when a different user loads, not on every local edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  useEffect(() => {
    apiFetch<Preferences>("/api/notification-preferences")
      .then(setPreferences)
      .catch((error) => setPreferencesError(errorMessage(error, "Unable to load your notification preferences.")));
  }, []);

  const handleSaveProfile = profileForm.handleSubmit(async (values) => {
    if (!profile) return;
    setProfileError(null);
    setProfileMessage(null);
    const name = `${values.firstName} ${values.lastName}`.trim();
    try {
      await apiFetch(`/api/users/${profile.id}`, {
        method: "PUT",
        body: { name, phone: values.phone, university: values.university },
      });
      setProfile({ name, phone: values.phone, university: values.university });
      profileForm.reset(values);
      setProfileMessage("Profile updated.");
    } catch (error) {
      const handled =
        error instanceof ApiError &&
        applyServerFieldErrors(error.fieldErrors, profileForm.setError as never, ["phone", "university"]);
      setProfileError(handled ? null : errorMessage(error, "Unable to save your profile."));
    }
  });

  const handlePreferenceToggle = async (key: PreferenceKey) => {
    if (!preferences || savingPreference) return;
    const previous = preferences;
    const next = { ...preferences, [key]: !preferences[key] };
    setPreferences(next);
    setPreferencesError(null);
    setSavingPreference(key);
    try {
      const saved = await apiFetch<Preferences>("/api/notification-preferences", {
        method: "PUT",
        body: { [key]: next[key] },
      });
      setPreferences(saved);
    } catch (error) {
      setPreferences(previous);
      setPreferencesError(errorMessage(error, "Couldn't save that preference."));
    } finally {
      setSavingPreference(null);
    }
  };

  const handleUpdatePassword = passwordForm.handleSubmit(async (values) => {
    setPasswordError(null);
    setPasswordMessage(null);

    const authUser = getFirebaseAuth().currentUser;
    if (!authUser || !authUser.email) {
      setPasswordError("Please sign in again.");
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(authUser.email, values.current);
      await reauthenticateWithCredential(authUser, credential);
      await updatePassword(authUser, values.next);
      setPasswordMessage("Password updated.");
      passwordForm.reset();
    } catch (error) {
      const code = (error as { code?: string } | null)?.code;
      if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
        passwordForm.setError("current", { type: "server", message: "Current password is incorrect." });
      } else if (code === "auth/weak-password") {
        passwordForm.setError("next", { type: "server", message: "That password is too weak." });
      } else if (code === "auth/too-many-requests") {
        setPasswordError("Too many attempts. Please wait a few minutes and try again.");
      } else if (code === "auth/requires-recent-login") {
        setPasswordError("For security, please sign out and sign back in, then try again.");
      } else {
        setPasswordError("Unable to update password. Please try again.");
      }
    }
  });

  const handleDeactivate = async () => {
    if (!profile) return;
    setIsDeactivating(true);
    setDeactivateError(null);
    try {
      await apiFetch(`/api/users/${profile.id}`, { method: "PUT", body: { status: "inactive" } });
      await signOutUser(router);
    } catch (error) {
      setDeactivateError(errorMessage(error, "Unable to deactivate your account."));
      setIsDeactivating(false);
    }
  };

  const displayName = profile?.name || (profile ? roleTitles[profile.role] : "");
  const { errors: profileErrors, isSubmitting: isSavingProfile, isDirty: isProfileDirty } = profileForm.formState;
  const { errors: passwordErrors, isSubmitting: isUpdatingPassword } = passwordForm.formState;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title="Settings" description="Manage your account and notification preferences." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Profile Information */}
        <section className={cardClass} aria-labelledby="profile-heading">
          <div className="border-b border-gray-200 px-6 py-3">
            <h3 id="profile-heading" className="text-lg font-semibold text-gray-800">
              Profile Information
            </h3>
          </div>
          <div className="flex-1 p-5">
            {isLoadingProfile && <p className="text-sm text-gray-400">Loading your profile...</p>}
            {!isLoadingProfile && !profile && <p className="text-sm text-red-500">Unable to load your profile.</p>}
            {profile && (
              <>
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-lg font-semibold text-orange-700">
                    {getInitials(displayName)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{displayName}</p>
                    <p className="text-sm text-gray-500">
                      {profile.email} · {roleTitles[profile.role]}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-3" noValidate>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <span className="mb-1 block">First Name</span>
                      <input {...profileForm.register("firstName")} className={fieldClass} aria-invalid={!!profileErrors.firstName} />
                      <FieldError message={profileErrors.firstName?.message} />
                    </label>
                    <label className="block text-sm font-medium text-gray-700">
                      <span className="mb-1 block">Last Name</span>
                      <input {...profileForm.register("lastName")} className={fieldClass} />
                    </label>
                  </div>
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="mb-1 block">Email Address</span>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-400"
                    />
                  </label>
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="mb-1 block">Phone Number</span>
                    <input
                      type="tel"
                      placeholder="+92 300 1234567"
                      {...profileForm.register("phone")}
                      className={fieldClass}
                      aria-invalid={!!profileErrors.phone}
                    />
                    <FieldError message={profileErrors.phone?.message} />
                  </label>
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="mb-1 block">University</span>
                    <Controller
                      control={profileForm.control}
                      name="university"
                      render={({ field }) => (
                        <UniversitySelect
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          className={fieldClass}
                          invalid={!!profileErrors.university}
                        />
                      )}
                    />
                    <FieldError message={profileErrors.university?.message} />
                  </label>
                  {profileError && (
                    <p role="alert" className="text-sm text-red-500">
                      {profileError}
                    </p>
                  )}
                  {profileMessage && <p className="text-sm text-emerald-600">{profileMessage}</p>}
                  <button type="submit" disabled={isSavingProfile || !isProfileDirty} className={primaryButton}>
                    {isSavingProfile ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              </>
            )}
          </div>
        </section>

        {/* Notification Preferences */}
        <section className={cardClass} aria-labelledby="preferences-heading">
          <div className="border-b border-gray-200 px-6 py-3">
            <h3 id="preferences-heading" className="text-lg font-semibold text-gray-800">
              Notification Preferences
            </h3>
          </div>
          <div className="flex-1 space-y-4 p-5">
            {!preferences && !preferencesError && <p className="text-sm text-gray-400">Loading preferences...</p>}
            {preferencesError && (
              <p role="alert" className="text-sm text-red-500">
                {preferencesError}
              </p>
            )}
            {preferences &&
              preferencesForRole(profile?.role).map((key) => {
                const labelId = `pref-${key}`;
                return (
                  <div key={key} className="flex items-center justify-between gap-4">
                    <div>
                      <p id={labelId} className="text-sm text-gray-700">
                        {preferenceLabels[key].label}
                      </p>
                      <p className="text-xs text-gray-400">{preferenceLabels[key].hint}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={preferences[key]}
                      aria-labelledby={labelId}
                      disabled={savingPreference !== null}
                      onClick={() => handlePreferenceToggle(key)}
                      className={`relative inline-flex h-5 w-10 shrink-0 items-center rounded-full transition disabled:opacity-60 ${
                        preferences[key] ? "bg-brand" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          preferences[key] ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
          </div>
        </section>

        {/* Change Password */}
        <section className={cardClass} aria-labelledby="password-heading">
          <div className="border-b border-gray-200 px-6 py-3">
            <h3 id="password-heading" className="text-lg font-semibold text-gray-800">
              Change Password
            </h3>
          </div>
          <div className="flex-1 p-5">
            <form onSubmit={handleUpdatePassword} className="space-y-3" noValidate>
              <label className="block text-sm font-medium text-gray-700">
                <span className="mb-1 block">Current Password</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  {...passwordForm.register("current")}
                  className={fieldClass}
                  aria-invalid={!!passwordErrors.current}
                />
                <FieldError message={passwordErrors.current?.message} />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                <span className="mb-1 block">New Password</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  {...passwordForm.register("next")}
                  className={fieldClass}
                  aria-invalid={!!passwordErrors.next}
                />
                <span className="mt-1 block text-xs font-normal text-gray-400">At least 8 characters, with a letter and a number.</span>
                <FieldError message={passwordErrors.next?.message} />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                <span className="mb-1 block">Confirm Password</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  {...passwordForm.register("confirm")}
                  className={fieldClass}
                  aria-invalid={!!passwordErrors.confirm}
                />
                <FieldError message={passwordErrors.confirm?.message} />
              </label>
              {passwordError && (
                <p role="alert" className="text-sm text-red-500">
                  {passwordError}
                </p>
              )}
              {passwordMessage && <p className="text-sm text-emerald-600">{passwordMessage}</p>}
              <button type="submit" disabled={isUpdatingPassword} className={primaryButton}>
                {isUpdatingPassword ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </section>

        {(profile?.role === "head-ro" || profile?.role === "developer") && <CohortSettings />}

        {/* Danger Zone */}
        <section className="rounded-lg border border-red-200 bg-white" aria-labelledby="danger-heading">
          <div className="border-b border-red-100 px-6 py-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-600" />
              <h3 id="danger-heading" className="text-lg font-semibold text-gray-900">
                Danger Zone
              </h3>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Deactivating signs you out everywhere and blocks sign-in. Only a developer can reactivate your account.
            </p>
          </div>
          <div className="px-6 py-4">
            <button
              type="button"
              onClick={() => {
                setDeactivateError(null);
                setIsDeactivateOpen(true);
              }}
              disabled={!profile}
              className="cursor-pointer rounded-md border border-red-600 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Deactivate Account
            </button>
          </div>
        </section>
      </div>

      <ConfirmDialog
        isOpen={isDeactivateOpen}
        title="Deactivate your account?"
        message={`You'll be signed out immediately and won't be able to sign in again until a developer reactivates your account.${
          profile?.role === "head-ro" ? " If you're the only active Head RO, add another one first." : ""
        }`}
        confirmLabel="Deactivate"
        tone="danger"
        isBusy={isDeactivating}
        error={deactivateError}
        onConfirm={handleDeactivate}
        onCancel={() => setIsDeactivateOpen(false)}
      />
    </div>
  );
}
