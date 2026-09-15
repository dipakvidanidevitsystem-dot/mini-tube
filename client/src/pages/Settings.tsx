import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import Switch from "../components/Switch";
import TextField from "../components/TextField";
import Button from "../components/Button";
import Avatar from "@mui/material/Avatar";
import { Camera, UserCircle, LockKey, BellRinging, X } from "@phosphor-icons/react";
import {
  useUpdatePreferencesMutation,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} from "../store/api/usersApi";
import { getRtkErrorMessage } from "../store/lib/getRtkErrorMessage";
import { useAppSelector } from "../store/hooks";
import { notifyApiError, notifySuccess } from "../lib/toast";
import PasswordField from "../components/PasswordField";
import type { NotificationPreferences } from "../types";

const NOTIFICATION_OPTIONS: { key: keyof NotificationPreferences; label: string; description: string }[] = [
  {
    key: "notifyNewSubscriber",
    label: "New subscribers",
    description: "Email me when someone subscribes to my channel",
  },
  {
    key: "notifyVideoUploaded",
    label: "Upload confirmations",
    description: "Email me a confirmation when my video upload finishes",
  },
  {
    key: "notifyComment",
    label: "Comments",
    description: "Email me when someone comments on my video",
  },
  {
    key: "notifyLike",
    label: "Likes",
    description: "Email me when someone likes my video",
  },
];

function SettingsSection({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-lg dark:border-border-dark dark:bg-card-dark">
      <div className="mb-lg flex items-center gap-sm">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
          {icon}
        </span>
        <div>
          <h2 className="text-body-strong text-foreground dark:text-foreground-dark">{title}</h2>
          <p className="text-fine-print text-muted-foreground dark:text-muted-foreground-dark">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function Settings() {
  const user = useAppSelector((state) => state.auth.user);
  const [updatePreferences] = useUpdatePreferencesMutation();
  const [updateProfile, { isLoading: profileSubmitting }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: passwordSubmitting }] = useChangePasswordMutation();

  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [profileError, setProfileError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (!avatar) {
      setAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatar);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatar]);

  if (!user) return null;

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAvatar(e.target.files?.[0] || null);
    e.target.value = "";
  };

  const handleToggle = async (key: keyof NotificationPreferences) => {
    try {
      await updatePreferences({
        notifyNewSubscriber: user.notifyNewSubscriber,
        notifyVideoUploaded: user.notifyVideoUploaded,
        notifyComment: user.notifyComment,
        notifyLike: user.notifyLike,
        [key]: !user[key],
      }).unwrap();
    } catch (err) {
      notifyApiError(err);
    }
  };

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProfileError("");
    try {
      await updateProfile({
        name: name.trim() !== user.name ? name.trim() : undefined,
        profileImage: avatar || undefined,
      }).unwrap();
      setAvatar(null);
      notifySuccess("Profile updated.");
    } catch (err) {
      setProfileError(getRtkErrorMessage(err));
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }
    setPasswordError("");
    try {
      await changePassword({ currentPassword, newPassword }).unwrap();
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      notifySuccess("Password updated.");
    } catch (err) {
      setPasswordError(getRtkErrorMessage(err));
    }
  };

  return (
    <div className="mx-auto mt-8 max-w-2xl px-4 pb-16">
      <div className="mb-lg">
        <h1 className="text-display-md text-foreground dark:text-foreground-dark">Settings</h1>
        <p className="mt-xxs text-body text-muted-foreground dark:text-muted-foreground-dark">
          Manage your profile, security, and notification preferences.
        </p>
      </div>

      <div className="flex flex-col gap-lg">
        <SettingsSection
          icon={<UserCircle size={20} weight="bold" />}
          title="Profile"
          description="Update your photo and display name"
        >
          <form onSubmit={handleProfileSubmit} className="flex flex-col gap-md">
            <div className="flex items-center gap-md">
              <div className="group relative shrink-0">
                <Avatar
                  src={avatarPreview || user.profileImage || undefined}
                  sx={{ width: 72, height: 72, fontSize: "1.75rem" }}
                >
                  {user.name?.[0]?.toUpperCase()}
                </Avatar>
                <label
                  htmlFor="avatar-input"
                  className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/0 text-transparent transition-colors group-hover:bg-black/50 group-hover:text-white"
                >
                  <Camera size={22} weight="bold" />
                </label>
                <input
                  id="avatar-input"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="sr-only"
                  disabled={profileSubmitting}
                />
              </div>
              <div>
                <p className="text-caption-strong text-foreground dark:text-foreground-dark">
                  {avatar ? avatar.name : "Profile photo"}
                </p>
                {avatar ? (
                  <button
                    type="button"
                    onClick={() => setAvatar(null)}
                    className="flex items-center gap-xxs text-fine-print text-accent hover:underline"
                  >
                    <X size={12} weight="bold" />
                    Remove selection
                  </button>
                ) : (
                  <p className="text-fine-print text-muted-foreground dark:text-muted-foreground-dark">
                    Click the avatar to change it
                  </p>
                )}
              </div>
            </div>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={profileSubmitting}
              fullWidth
            />
            {profileError && (
              <p className="text-fine-print font-medium text-destructive dark:text-destructive-dark">{profileError}</p>
            )}
            <div>
              <Button type="submit" variant="contained" disabled={profileSubmitting}>
                {profileSubmitting ? "Saving..." : "Save profile"}
              </Button>
            </div>
          </form>
        </SettingsSection>

        <SettingsSection
          icon={<LockKey size={20} weight="bold" />}
          title="Change password"
          description="Choose a strong password you don't use elsewhere"
        >
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-md">
            <PasswordField
              label="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              disabled={passwordSubmitting}
              fullWidth
            />
            <PasswordField
              label="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={passwordSubmitting}
              fullWidth
            />
            <PasswordField
              label="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={passwordSubmitting}
              fullWidth
            />
            {passwordError && (
              <p className="text-fine-print font-medium text-destructive dark:text-destructive-dark">{passwordError}</p>
            )}
            <div>
              <Button type="submit" variant="contained" disabled={passwordSubmitting}>
                {passwordSubmitting ? "Updating..." : "Update password"}
              </Button>
            </div>
          </form>
        </SettingsSection>

        <SettingsSection
          icon={<BellRinging size={20} weight="bold" />}
          title="Notifications"
          description="Choose what you get emailed about"
        >
          <div className="flex flex-col divide-y divide-border dark:divide-border-dark">
            {NOTIFICATION_OPTIONS.map(({ key, label, description }) => (
              <Switch
                key={key}
                className="!ml-0 !flex !justify-between !py-sm"
                labelPlacement="start"
                checked={user[key]}
                onChange={() => handleToggle(key)}
                label={label}
                description={description}
              />
            ))}
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}
