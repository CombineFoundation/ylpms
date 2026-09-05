// components/SettingsForm.tsx
'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

export function SettingsForm() {
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'headro@organization.gov.ph',
    phone: '+63 912 345 6789',
  });

  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const [preferences, setPreferences] = useState({
    reportSubmissions: false,
    newRegistrations: false,
    taskUpdates: false,
    eventReminders: false,
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword({ ...password, [e.target.name]: e.target.value });
  };

  const handlePreferenceToggle = (key: keyof typeof preferences) => {
    setPreferences({ ...preferences, [key]: !preferences[key] });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Profile saved:', profile);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Password updated');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Profile Information - Left */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="px-6 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Profile Information</h3>
        </div>
        <div className="p-5 flex-1">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-semibold text-lg">
              HR
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Head Regional Officer</p>
              <p className="text-sm text-gray-500">headro@organization.gov.ph</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={profile.firstName}
                onChange={handleProfileChange}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={profile.lastName}
                onChange={handleProfileChange}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleProfileChange}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium text-sm"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>

      {/* Notification Preferences - Right */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="px-6 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Notification Preferences
          </h3>
        </div>
        <div className="p-5 flex-1">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Report submissions</span>
              <button
                onClick={() => handlePreferenceToggle('reportSubmissions')}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition ${
                  preferences.reportSubmissions ? 'bg-orange-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    preferences.reportSubmissions ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">New user registrations</span>
              <button
                onClick={() => handlePreferenceToggle('newRegistrations')}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition ${
                  preferences.newRegistrations ? 'bg-orange-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    preferences.newRegistrations ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Task updates</span>
              <button
                onClick={() => handlePreferenceToggle('taskUpdates')}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition ${
                  preferences.taskUpdates ? 'bg-orange-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    preferences.taskUpdates ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Event reminders</span>
              <button
                onClick={() => handlePreferenceToggle('eventReminders')}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition ${
                  preferences.eventReminders ? 'bg-orange-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    preferences.eventReminders ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password - Left */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="px-6 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Change Password</h3>
        </div>
        <div className="p-5 flex-1">
          <form onSubmit={handleUpdatePassword} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                name="current"
                value={password.current}
                onChange={handlePasswordChange}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                name="new"
                value={password.new}
                onChange={handlePasswordChange}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirm"
                value={password.confirm}
                onChange={handlePasswordChange}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium text-sm"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>

      {/* Danger Zone - Right */}
 <div className="bg-white border border-grey-400 rounded-lg rounded-lg rounded-[30px]">
      <div className="px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-black" />
          <h3 className="text-lg font-semibold text-black">Danger Zone</h3>
        </div>
        <p className="text-sm text-black mt-1">
          These actions are irreversible. Please proceed with caution.
        </p>
      </div>
      <div className="px-6 py-4">
        <button className="px-4 py-2 bg-white text-red-600 border border-red-600 rounded-md hover:bg-red-100 cursor-pointer transition text-sm font-medium">
          Deactivate Account
        </button>
      </div>
    </div>
    </div>
  );
}