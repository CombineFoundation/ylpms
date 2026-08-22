"use client";

import { useState } from "react";
import {
  Bell,
  Smartphone,
  Mail,
  Lock,
  Shield,
  Globe,
  Moon,
  Sun,
  Save,
  Check,
  X,
  AlertCircle,
  ChevronRight,
  Eye,
  EyeOff,
  User,
  Key,
} from "lucide-react";

type Settings = {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    activityUpdates: boolean;
    taskReminders: boolean;
    certificateAlerts: boolean;
  };
  appearance: {
    theme: "light" | "dark" | "system";
    compactView: boolean;
    showAvatars: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: string;
  };
  privacy: {
    profileVisibility: "public" | "private" | "team";
    showEmail: boolean;
    showPhone: boolean;
  };
};

const initialSettings: Settings = {
  notifications: {
    email: true,
    sms: true,
    push: true,
    activityUpdates: true,
    taskReminders: true,
    certificateAlerts: true,
  },
  appearance: {
    theme: "light",
    compactView: false,
    showAvatars: true,
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: "30",
  },
  privacy: {
    profileVisibility: "public",
    showEmail: true,
    showPhone: false,
  },
};

export function SettingsContent() {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleNotificationToggle = (key: keyof typeof settings.notifications) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key],
      },
    });
  };

  const handleAppearanceChange = <K extends keyof typeof settings.appearance>(
    key: K,
    value: typeof settings.appearance[K]
  ) => {
    setSettings({
      ...settings,
      appearance: {
        ...settings.appearance,
        [key]: value,
      },
    });
  };

  const handleSecurityChange = <K extends keyof typeof settings.security>(
    key: K,
    value: typeof settings.security[K]
  ) => {
    setSettings({
      ...settings,
      security: {
        ...settings.security,
        [key]: value,
      },
    });
  };

  const handlePrivacyChange = <K extends keyof typeof settings.privacy>(
    key: K,
    value: typeof settings.privacy[K]
  ) => {
    setSettings({
      ...settings,
      privacy: {
        ...settings.privacy,
        [key]: value,
      },
    });
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1500);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handleSavePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match.");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    // Simulate password change
    alert("Password changed successfully!");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const NotificationSection = () => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-[#E8622C]" />
          <h3 className="text-sm font-semibold text-gray-700">Notification Preferences</h3>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">Choose how you want to be notified</p>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Email Notifications</p>
            <p className="text-xs text-gray-400">Receive notifications via email</p>
          </div>
          <button
            onClick={() => handleNotificationToggle("email")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.notifications.email ? "bg-[#E8622C]" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.notifications.email ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">SMS Notifications</p>
            <p className="text-xs text-gray-400">Receive notifications via SMS</p>
          </div>
          <button
            onClick={() => handleNotificationToggle("sms")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.notifications.sms ? "bg-[#E8622C]" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.notifications.sms ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Push Notifications</p>
            <p className="text-xs text-gray-400">Receive push notifications in browser</p>
          </div>
          <button
            onClick={() => handleNotificationToggle("push")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.notifications.push ? "bg-[#E8622C]" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.notifications.push ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="border-t border-gray-100 pt-3 mt-1">
          <p className="text-xs font-semibold text-gray-500 mb-2">Specific Alerts</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Activity Updates</p>
            </div>
            <button
              onClick={() => handleNotificationToggle("activityUpdates")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.notifications.activityUpdates ? "bg-[#E8622C]" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.notifications.activityUpdates ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div>
              <p className="text-sm font-medium text-gray-700">Task Reminders</p>
            </div>
            <button
              onClick={() => handleNotificationToggle("taskReminders")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.notifications.taskReminders ? "bg-[#E8622C]" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.notifications.taskReminders ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div>
              <p className="text-sm font-medium text-gray-700">Certificate Alerts</p>
            </div>
            <button
              onClick={() => handleNotificationToggle("certificateAlerts")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.notifications.certificateAlerts ? "bg-[#E8622C]" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.notifications.certificateAlerts ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const AppearanceSection = () => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
          <Globe size={18} className="text-[#E8622C]" />
          <h3 className="text-sm font-semibold text-gray-700">Appearance</h3>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">Customize your interface</p>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Theme</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleAppearanceChange("theme", "light")}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                settings.appearance.theme === "light"
                  ? "border-[#E8622C] bg-[#E8622C]/5 text-[#E8622C]"
                  : "border-gray-200 hover:border-gray-300 text-gray-600"
              }`}
            >
              <Sun size={16} />
              Light
            </button>
            <button
              onClick={() => handleAppearanceChange("theme", "dark")}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                settings.appearance.theme === "dark"
                  ? "border-[#E8622C] bg-[#E8622C]/5 text-[#E8622C]"
                  : "border-gray-200 hover:border-gray-300 text-gray-600"
              }`}
            >
              <Moon size={16} />
              Dark
            </button>
            <button
              onClick={() => handleAppearanceChange("theme", "system")}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                settings.appearance.theme === "system"
                  ? "border-[#E8622C] bg-[#E8622C]/5 text-[#E8622C]"
                  : "border-gray-200 hover:border-gray-300 text-gray-600"
              }`}
            >
              <Monitor size={16} />
              System
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Compact View</p>
            <p className="text-xs text-gray-400">Reduce spacing between items</p>
          </div>
          <button
            onClick={() => handleAppearanceChange("compactView", !settings.appearance.compactView)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.appearance.compactView ? "bg-[#E8622C]" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.appearance.compactView ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Show Avatars</p>
            <p className="text-xs text-gray-400">Display profile avatars in lists</p>
          </div>
          <button
            onClick={() => handleAppearanceChange("showAvatars", !settings.appearance.showAvatars)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.appearance.showAvatars ? "bg-[#E8622C]" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.appearance.showAvatars ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  const SecuritySection = () => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-[#E8622C]" />
          <h3 className="text-sm font-semibold text-gray-700">Security</h3>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">Manage your account security</p>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Two-Factor Authentication</p>
            <p className="text-xs text-gray-400">Add an extra layer of security</p>
          </div>
          <button
            onClick={() => handleSecurityChange("twoFactorAuth", !settings.security.twoFactorAuth)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.security.twoFactorAuth ? "bg-[#E8622C]" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.security.twoFactorAuth ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Session Timeout (minutes)
          </label>
          <select
            value={settings.security.sessionTimeout}
            onChange={(e) => handleSecurityChange("sessionTimeout", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30 focus:border-[#E8622C]"
          >
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="120">2 hours</option>
            <option value="480">8 hours</option>
          </select>
        </div>
      </div>
    </div>
  );

  const PrivacySection = () => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
          <Lock size={18} className="text-[#E8622C]" />
          <h3 className="text-sm font-semibold text-gray-700">Privacy</h3>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">Control your privacy settings</p>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Profile Visibility
          </label>
          <select
            value={settings.privacy.profileVisibility}
            onChange={(e) =>
              handlePrivacyChange("profileVisibility", e.target.value as any)
            }
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30 focus:border-[#E8622C]"
          >
            <option value="public">Public</option>
            <option value="team">Team Only</option>
            <option value="private">Private</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Show Email</p>
            <p className="text-xs text-gray-400">Display your email on profile</p>
          </div>
          <button
            onClick={() => handlePrivacyChange("showEmail", !settings.privacy.showEmail)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.privacy.showEmail ? "bg-[#E8622C]" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.privacy.showEmail ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Show Phone</p>
            <p className="text-xs text-gray-400">Display your phone on profile</p>
          </div>
          <button
            onClick={() => handlePrivacyChange("showPhone", !settings.privacy.showPhone)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.privacy.showPhone ? "bg-[#E8622C]" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.privacy.showPhone ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  const ChangePasswordSection = () => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
          <Key size={18} className="text-[#E8622C]" />
          <h3 className="text-sm font-semibold text-gray-700">Change Password</h3>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">Update your account password</p>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Current Password</label>
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              placeholder="Enter current password"
              className="w-full px-3 py-2 pr-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30 focus:border-[#E8622C]"
            />
            <button
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">New Password</label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              placeholder="Enter new password (min 6 characters)"
              className="w-full px-3 py-2 pr-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30 focus:border-[#E8622C]"
            />
            <button
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Confirm New Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Confirm new password"
              className="w-full px-3 py-2 pr-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30 focus:border-[#E8622C]"
            />
            <button
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          onClick={handleSavePassword}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-[#E8622C] rounded-lg hover:bg-[#d45520] transition-colors"
        >
          Change Password
        </button>
      </div>
    </div>
  );

  // Monitor icon for theme
  const Monitor = ({ size = 16, className = "" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={className}
    >
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Settings</h1>
          <p className="text-sm text-gray-500">
            Manage your account preferences and configurations
          </p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="flex items-center gap-1.5 text-sm font-medium text-white bg-[#E8622C] px-4 py-2 rounded-lg hover:bg-[#d45520] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Settings
            </>
          )}
        </button>
      </div>

      {/* Save Success Toast */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <Check size={18} />
          <span className="text-sm font-medium">Settings saved successfully!</span>
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-5">
          <NotificationSection />
          <AppearanceSection />
        </div>
        <div className="space-y-5">
          <SecuritySection />
          <PrivacySection />
          <ChangePasswordSection />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Shield size={14} className="text-gray-400" />
          <span className="font-medium">Settings last updated: Today</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Version 1.0.0</span>
        </div>
      </div>
    </div>
  );
}