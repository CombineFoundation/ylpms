// app/settings/page.tsx
import Sidebar from '@/components/sidebar';
import Topbar from '@/components/topbar';
import { SettingsForm } from '@/components/Head-of-RO/SettingsForm';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
              <p className="text-sm text-gray-500">
                Manage your account and system preferences.
              </p>
            </div>

            <SettingsForm />
          </div>
        </main>
      </div>
    </div>
  );
}