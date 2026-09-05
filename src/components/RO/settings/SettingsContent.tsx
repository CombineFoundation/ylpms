"use client";

import { useState } from "react";
import {
  User,
  Mail,
  MapPin,
  Phone,
  Bell,
  Smartphone,
  BarChart,
  Lock,
  Shield,
  Check,
  ChevronRight,
} from "lucide-react";

export function SettingsContent() {
  const [profile, setProfile] = useState({
    fullName: "Juan Dela Cruz",
    email: "juan.delacruz@ro-portal.gov",
    region: "Region IV-A (CALABARZON)",
    phone: "+63 912 345 6789",
  });

  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    weeklyDigest: false,
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key],
    });
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    // Save profile logic here
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your administrative profile and platform preferences.
        </p>
      </div>

      {/* Profile Information */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-sm font-semibold text-gray-700">Profile Information</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Full Name
              </label>
              <div className="flex items-center gap-2">
                <User size={16} className="text-gray-400" />
                {isEditing ? (
                  <input
                    type="text"
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleProfileChange}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
                  />
                ) : (
                  <span className="text-sm text-gray-800 font-medium">
                    {profile.fullName}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Email Address
              </label>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-gray-400" />
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
                  />
                ) : (
                  <span className="text-sm text-gray-600">{profile.email}</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Assigned Region
              </label>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-400" />
                {isEditing ? (
                  <input
                    type="text"
                    name="region"
                    value={profile.region}
                    onChange={handleProfileChange}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
                  />
                ) : (
                  <span className="text-sm text-gray-600">{profile.region}</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Phone Number
              </label>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-gray-400" />
                {isEditing ? (
                  <input
                    type="text"
                    name="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
                  />
                ) : (
                  <span className="text-sm text-gray-600">{profile.phone}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveProfile}
                  className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Check size={16} />
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-sm font-semibold text-gray-700">Notification Preferences</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-start gap-3">
              <Bell size={18} className="text-orange-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-800">Email Notifications</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Get system alerts and report results on email.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleNotificationToggle("email")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.email ? "bg-orange-500" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.email ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-start gap-3">
              <Smartphone size={18} className="text-orange-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-800">SMS Mobile Alerts</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Receive emergency disaster and safety alerts over SMS.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleNotificationToggle("sms")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.sms ? "bg-orange-500" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.sms ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-start gap-3">
              <BarChart size={18} className="text-orange-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-800">Weekly Performance Digest</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Get weekly emails regarding hours and events stats.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleNotificationToggle("weeklyDigest")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.weeklyDigest ? "bg-orange-500" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.weeklyDigest ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Account Security & Safety */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-sm font-semibold text-gray-700">Account Security &amp; Safety</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-start gap-3">
              <Lock size={18} className="text-orange-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-800">Change Password</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Ensure your admin credentials remain updated regularly.
                </p>
              </div>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-1.5 bg-orange-500 text-white text-xs font-medium rounded-lg hover:bg-orange-600 transition-colors">
              Change Password
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-start gap-3">
              <Shield size={18} className="text-orange-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Two-Factor Authentication (2FA)
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Keep secure access active via an additional safety token.
                </p>
              </div>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-1.5 bg-orange-500 text-white text-xs font-medium rounded-lg hover:bg-orange-600 transition-colors">
              Enable 2FA
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">Juan Dela Cruz</span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-400">Regional VP-A Officer</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Last updated: Today</span>
        </div>
      </div>
    </div>
  );
}