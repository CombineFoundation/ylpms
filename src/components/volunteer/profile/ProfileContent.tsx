"use client";

import { useState, useRef } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  CheckCircle,
  Shield,
  Link2,
} from "lucide-react";
import Image from "next/image";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  role: string;
  joinDate: string;
  avatar: string;
  avatarUrl?: string;
  bio: string;
  skills: string[];
  stats: {
    volunteers: number;
    activities: number;
    certificates: number;
    hours: number;
  };
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
  preferences: {
    emailNotifications: boolean;
    smsAlerts: boolean;
    weeklyDigest: boolean;
  };
};

const initialProfile: UserProfile = {
  id: "1",
  name: "Zainab Ali",
  email: "zainab.ali@ylp.org",
  phone: "+92 300 1234567",
  location: "Lahore, Pakistan",
  role: "Youth Leader Volunteer",
  joinDate: "January 2024",
  avatar: "ZA",
  avatarUrl: "",
  bio: "Passionate Youth Leader Volunteer with 2+ years of experience in community engagement and volunteer management. Dedicated to empowering young people and creating positive social impact.",
  skills: ["Leadership", "Community Engagement", "Event Planning", "Public Speaking", "Team Management"],
  stats: {
    volunteers: 8,
    activities: 12,
    certificates: 4,
    hours: 156,
  },
  socialLinks: {
    linkedin: "https://linkedin.com/in/zainabali",
    twitter: "https://twitter.com/zainabali",
    instagram: "https://instagram.com/zainabali",
  },
  preferences: {
    emailNotifications: true,
    smsAlerts: true,
    weeklyDigest: false,
  },
};

export function ProfileContent() {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(profile);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEdit = () => {
    setEditData(profile);
    setImagePreview(profile.avatarUrl || null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(profile);
    setImagePreview(null);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      const updatedProfile = {
        ...editData,
        avatarUrl: imagePreview || editData.avatarUrl || "",
      };
      setProfile(updatedProfile);
      setIsSaving(false);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleSkillAdd = (skill: string) => {
    if (skill.trim() && !editData.skills.includes(skill.trim())) {
      setEditData({
        ...editData,
        skills: [...editData.skills, skill.trim()],
      });
    }
  };

  const handleSkillRemove = (skill: string) => {
    setEditData({
      ...editData,
      skills: editData.skills.filter((s) => s !== skill),
    });
  };

  const handlePreferenceToggle = (key: keyof typeof profile.preferences) => {
    setEditData({
      ...editData,
      preferences: {
        ...editData.preferences,
        [key]: !editData.preferences[key],
      },
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getAvatarDisplay = () => {
    // In edit mode, show preview if available
    if (isEditing && imagePreview) {
      return { type: 'image', value: imagePreview };
    }
    // Show saved avatar URL
    if (profile.avatarUrl && !isEditing) {
      return { type: 'image', value: profile.avatarUrl };
    }
    // Show initials
    return { type: 'text', value: getInitials(editData.name) };
  };

  const avatarDisplay = getAvatarDisplay();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Profile</h1>
          <p className="text-sm text-gray-500">
            Manage your personal information and preferences
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="flex items-center gap-1.5 text-sm font-medium text-white bg-[#E8622C] px-4 py-2 rounded-lg hover:bg-[#d45520] transition-colors"
          >
            <Edit size={16} />
            Edit Profile
          </button>
        )}
      </div>

      {/* Save Success Toast */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle size={18} />
          <span className="text-sm font-medium">Profile updated successfully!</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-[#E8622C] to-orange-400" />

        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12">
            <div className="relative group">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-[#E8622C] text-2xl font-bold text-white shadow-lg overflow-hidden">
                {avatarDisplay.type === 'image' && avatarDisplay.value ? (
                  <img 
                    src={avatarDisplay.value} 
                    alt={editData.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span>{avatarDisplay.value}</span>
                )}
              </div>
              
              <button
                onClick={triggerFileInput}
                className="absolute bottom-0 right-0 rounded-full bg-white p-1.5 shadow-md hover:bg-gray-50 transition-colors border border-gray-200"
                title="Upload photo"
              >
                <Camera size={16} className="text-gray-500" />
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">{profile.name}</h2>
              <p className="text-sm text-gray-500">{profile.role}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar size={14} />
              <span>Joined {profile.joinDate}</span>
            </div>
          </div>

          {isEditing && imagePreview && (
            <div className="mt-2 flex items-center gap-2 text-sm text-emerald-600">
              <CheckCircle size={14} />
              <span>New image selected</span>
              <button
                onClick={removeImage}
                className="text-red-500 hover:text-red-600"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xl font-bold text-gray-800">{profile.stats.volunteers}</p>
              <p className="text-xs text-gray-500">Volunteers</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xl font-bold text-gray-800">{profile.stats.activities}</p>
              <p className="text-xs text-gray-500">Activities</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xl font-bold text-gray-800">{profile.stats.certificates}</p>
              <p className="text-xs text-gray-500">Certificates</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xl font-bold text-gray-800">{profile.stats.hours}</p>
              <p className="text-xs text-gray-500">Hours</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-sm font-semibold text-gray-700">Personal Information</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={editData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30 focus:border-[#E8622C]"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <User size={16} className="text-gray-400" />
                    <span>{profile.name}</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30 focus:border-[#E8622C]"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Mail size={16} className="text-gray-400" />
                    <span>{profile.email}</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={editData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30 focus:border-[#E8622C]"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Phone size={16} className="text-gray-400" />
                    <span>{profile.phone}</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={editData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30 focus:border-[#E8622C]"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPin size={16} className="text-gray-400" />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Bio</label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={editData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30 focus:border-[#E8622C]"
                />
              ) : (
                <p className="text-sm text-gray-600">{profile.bio}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-sm font-semibold text-gray-700">Skills</h3>
            </div>
            <div className="p-4">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {editData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 rounded-full bg-[#E8622C]/10 px-3 py-1 text-xs font-medium text-[#E8622C]"
                      >
                        {skill}
                        <button
                          onClick={() => handleSkillRemove(skill)}
                          className="text-[#E8622C]/60 hover:text-[#E8622C]"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add skill..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSkillAdd((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = "";
                        }
                      }}
                      className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30 focus:border-[#E8622C]"
                    />
                    <button
                      onClick={() => {
                        const input = document.querySelector('input[placeholder="Add skill..."]') as HTMLInputElement;
                        if (input) {
                          handleSkillAdd(input.value);
                          input.value = "";
                        }
                      }}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-[#E8622C] rounded-lg hover:bg-[#d45520] transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-[#E8622C]/10 px-3 py-1 text-xs font-medium text-[#E8622C]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-sm font-semibold text-gray-700">Social Links</h3>
            </div>
            <div className="p-4 space-y-2">
              {isEditing ? (
                <>
                  <input
                    type="url"
                    value={editData.socialLinks.linkedin || ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        socialLinks: { ...editData.socialLinks, linkedin: e.target.value },
                      })
                    }
                    placeholder="LinkedIn URL"
                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30 focus:border-[#E8622C]"
                  />
                  <input
                    type="url"
                    value={editData.socialLinks.twitter || ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        socialLinks: { ...editData.socialLinks, twitter: e.target.value },
                      })
                    }
                    placeholder="Twitter URL"
                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30 focus:border-[#E8622C]"
                  />
                  <input
                    type="url"
                    value={editData.socialLinks.instagram || ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        socialLinks: { ...editData.socialLinks, instagram: e.target.value },
                      })
                    }
                    placeholder="Instagram URL"
                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30 focus:border-[#E8622C]"
                  />
                </>
              ) : (
                <div className="space-y-1.5 text-sm">
                  {profile.socialLinks.linkedin && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Link2 size={14} className="text-gray-400" />
                      <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#E8622C] hover:underline">
                        LinkedIn
                      </a>
                    </div>
                  )}
                  {profile.socialLinks.twitter && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Link2 size={14} className="text-gray-400" />
                      <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-[#E8622C] hover:underline">
                        Twitter
                      </a>
                    </div>
                  )}
                  {profile.socialLinks.instagram && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Link2 size={14} className="text-gray-400" />
                      <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-[#E8622C] hover:underline">
                        Instagram
                      </a>
                    </div>
                  )}
                  {!profile.socialLinks.linkedin && !profile.socialLinks.twitter && !profile.socialLinks.instagram && (
                    <p className="text-sm text-gray-400">No social links added</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-sm font-semibold text-gray-700">Preferences</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Email Notifications</p>
                  <p className="text-xs text-gray-400">Get updates via email</p>
                </div>
                <button
                  onClick={() => handlePreferenceToggle("emailNotifications")}
                  disabled={!isEditing}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    editData.preferences.emailNotifications ? "bg-[#E8622C]" : "bg-gray-300"
                  } ${!isEditing ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      editData.preferences.emailNotifications ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">SMS Alerts</p>
                  <p className="text-xs text-gray-400">Get SMS notifications</p>
                </div>
                <button
                  onClick={() => handlePreferenceToggle("smsAlerts")}
                  disabled={!isEditing}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    editData.preferences.smsAlerts ? "bg-[#E8622C]" : "bg-gray-300"
                  } ${!isEditing ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      editData.preferences.smsAlerts ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Weekly Digest</p>
                  <p className="text-xs text-gray-400">Get weekly summary email</p>
                </div>
                <button
                  onClick={() => handlePreferenceToggle("weeklyDigest")}
                  disabled={!isEditing}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    editData.preferences.weeklyDigest ? "bg-[#E8622C]" : "bg-gray-300"
                  } ${!isEditing ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      editData.preferences.weeklyDigest ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#E8622C] rounded-lg hover:bg-[#d45520] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Shield size={14} className="text-gray-400" />
          <span className="font-medium">Last updated: Today</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Profile ID: {profile.id}</span>
        </div>
      </div>
    </div>
  );
}