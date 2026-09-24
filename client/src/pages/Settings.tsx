import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Switch from "../components/Switch";
import TextField from "../components/TextField";
import Button from "../components/Button";
import Avatar from "@mui/material/Avatar";
import { Camera, UserCircle, LockKey, BellRinging, X, Gear, Palette, Sun, Moon, CheckCircle } from "@phosphor-icons/react";
import PageHeader from "../components/PageHeader";
import Panel from "../components/Panel";
import FormAlert from "../components/FormAlert";
import { colorTokens } from "../theme/tokens";
import { setMode } from "../store/slices/themeSlice";
import {
  useUpdatePreferencesMutation,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} from "../store/api/usersApi";
import { getRtkErrorMessage } from "../store/lib/getRtkErrorMessage";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { notifyApiError, notifySuccess } from "../lib/toast";
import PasswordField from "../components/PasswordField";
import type { NotificationPreferences } from "../types";
import { NAME_MAX, validateMatch, validateMaxLength, validatePassword, validateRequired } from "../lib/validation";

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

const SECTIONS = [
  { id: "profile", label: "Profile", icon: UserCircle },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "security", label: "Password", icon: LockKey },
  { id: "notifications", label: "Notifications", icon: BellRinging },
];

export default function Settings() {
  const user = useAppSelector((state) => state.auth.user);
  const mode = useAppSelector((state) => state.theme.mode);
  const dispatch = useAppDispatch();
  const [updatePreferences] = useUpdatePreferencesMutation();
  const [updateProfile, { isLoading: profileSubmitting }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: passwordSubmitting }] = useChangePasswordMutation();

  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [profileError, setProfileError] = useState("");
  const [nameError, setNameError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const validateName = (value: string) => validateRequired(value, "Name") || validateMaxLength(value, NAME_MAX, "Name");

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

    const nextNameError = validateName(name);
    setNameError(nextNameError || "");
    if (nextNameError) return;

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

    const nextCurrentPasswordError = validateRequired(currentPassword, "Current password");
    const nextNewPasswordError = validatePassword(newPassword);
    const nextConfirmPasswordError = validateMatch(confirmPassword, newPassword, "New password and confirmation");
    setCurrentPasswordError(nextCurrentPasswordError || "");
    setNewPasswordError(nextNewPasswordError || "");
    setConfirmPasswordError(nextConfirmPasswordError || "");
    if (nextCurrentPasswordError || nextNewPasswordError || nextConfirmPasswordError) return;

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
    <div className="mx-auto w-full max-w-[1100px] px-md pb-16 pt-lg sm:px-lg">
      <PageHeader icon={Gear} title="Settings" description="Manage your profile, security, appearance and notifications." />

      <div className="grid gap-lg lg:grid-cols-[200px_minmax(0,1fr)]">
        <nav aria-label="Settings sections" className="hidden lg:block">
          <ul className="sticky top-20 flex flex-col gap-0.5">
            {SECTIONS.map(({ id, label, icon: SectionIcon }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="flex h-10 items-center gap-sm rounded-md px-3 text-caption text-muted-foreground transition-colors duration-fast hover:bg-muted hover:text-foreground"
                >
                  <SectionIcon size={18} aria-hidden />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex min-w-0 flex-col gap-lg">
          <Panel id="profile" icon={UserCircle} title="Profile" description="Update your photo and display name" className="scroll-mt-20">
            <form onSubmit={handleProfileSubmit} noValidate className="flex flex-col gap-md">
              {profileError && <FormAlert>{profileError}</FormAlert>}
              <div className="flex items-center gap-md">
                <div className="group relative shrink-0">
                  <Avatar
                    src={avatarPreview || user.profileImage || undefined}
                    alt=""
                    sx={{ width: 80, height: 80, fontSize: "1.75rem" }}
                    className="ring-2 ring-border"
                  >
                    {user.name?.[0]?.toUpperCase()}
                  </Avatar>
                  <label
                    htmlFor="avatar-input"
                    className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-scrim/0 text-transparent transition-colors duration-fast group-hover:bg-scrim/55 group-hover:text-on-scrim group-has-[:focus-visible]:bg-scrim/55 group-has-[:focus-visible]:text-on-scrim"
                  >
                    <Camera size={22} weight="bold" aria-hidden />
                    <span className="sr-only">Change profile photo</span>
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
                <div className="min-w-0">
                  <p className="truncate text-caption-strong text-foreground">{avatar ? avatar.name : "Profile photo"}</p>
                  {avatar ? (
                    <button
                      type="button"
                      onClick={() => setAvatar(null)}
                      className="mt-0.5 inline-flex items-center gap-1 text-fine-print font-semibold text-accent hover:underline"
                    >
                      <X size={12} weight="bold" aria-hidden />
                      Remove selection
                    </button>
                  ) : (
                    <p className="text-fine-print text-muted-foreground">JPG or PNG. Click the photo to change it.</p>
                  )}
                </div>
              </div>
              <TextField
                label="Name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setNameError(validateName(name) || "")}
                error={!!nameError}
                helperText={nameError}
                disabled={profileSubmitting}
                fullWidth
              />
              <TextField label="Email" value={user.email} disabled fullWidth helperText="Your email can't be changed." />
              <div className="flex justify-end">
                <Button type="submit" variant="contained" loading={profileSubmitting}>
                  {profileSubmitting ? "Saving…" : "Save profile"}
                </Button>
              </div>
            </form>
          </Panel>

          <Panel id="appearance" icon={Palette} title="Appearance" description="Choose how MiniTube looks on this device" className="scroll-mt-20">
            <div role="radiogroup" aria-label="Theme" className="grid gap-sm sm:grid-cols-2">
              {(["dark", "light"] as const).map((option) => {
                const active = mode === option;
                return (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => dispatch(setMode(option))}
                    className={`flex items-center gap-sm rounded-md border p-sm text-left transition-colors duration-fast ${
                      active ? "border-accent bg-accent-soft" : "border-border hover:border-foreground/25"
                    }`}
                  >
                    <span
                      aria-hidden
                      className="flex h-12 w-20 shrink-0 flex-col gap-1 overflow-hidden rounded-sm border border-border p-1.5"
                      style={{ background: colorTokens[option].background }}
                    >
                      <span className="h-1.5 w-10 rounded-full opacity-70" style={{ background: colorTokens[option].foreground }} />
                      <span className="h-1.5 w-6 rounded-full" style={{ background: colorTokens[option].accent }} />
                      <span className="mt-auto h-3 w-full rounded-[3px]" style={{ background: colorTokens[option].elevated }} />
                    </span>
                    <span className="flex-1">
                      <span className="flex items-center gap-1.5 text-caption-strong capitalize text-foreground">
                        {option === "dark" ? <Moon size={16} aria-hidden /> : <Sun size={16} aria-hidden />}
                        {option}
                      </span>
                      <span className="text-fine-print text-muted-foreground">
                        {option === "dark" ? "Easy on the eyes, great for watching." : "Bright and crisp for daytime."}
                      </span>
                    </span>
                    {active && <CheckCircle size={20} weight="fill" className="shrink-0 text-accent" aria-hidden />}
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel
            id="security"
            icon={LockKey}
            title="Change password"
            description="Choose a strong password you don't use elsewhere"
            className="scroll-mt-20"
          >
            <form onSubmit={handlePasswordSubmit} noValidate className="flex flex-col gap-md">
              {passwordError && <FormAlert>{passwordError}</FormAlert>}
              <PasswordField
                label="Current password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                onBlur={() => currentPassword && setCurrentPasswordError(validateRequired(currentPassword, "Current password") || "")}
                error={!!currentPasswordError}
                helperText={currentPasswordError}
                disabled={passwordSubmitting}
                fullWidth
              />
              <div className="grid gap-md sm:grid-cols-2">
                <PasswordField
                  label="New password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onBlur={() => newPassword && setNewPasswordError(validatePassword(newPassword) || "")}
                  error={!!newPasswordError}
                  helperText={newPasswordError || "8+ characters with upper, lower and a number"}
                  disabled={passwordSubmitting}
                  fullWidth
                />
                <PasswordField
                  label="Confirm new password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() =>
                    confirmPassword &&
                    setConfirmPasswordError(validateMatch(confirmPassword, newPassword, "New password and confirmation") || "")
                  }
                  error={!!confirmPasswordError}
                  helperText={confirmPasswordError}
                  disabled={passwordSubmitting}
                  fullWidth
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" variant="contained" loading={passwordSubmitting}>
                  {passwordSubmitting ? "Updating…" : "Update password"}
                </Button>
              </div>
            </form>
          </Panel>

          <Panel
            id="notifications"
            icon={BellRinging}
            title="Notifications"
            description="Choose what you get emailed about"
            className="scroll-mt-20"
          >
            <div className="flex flex-col divide-y divide-border">
              {NOTIFICATION_OPTIONS.map(({ key, label, description }) => (
                <Switch
                  key={key}
                  className="!ml-0 !flex !justify-between !gap-md !py-sm"
                  labelPlacement="start"
                  checked={user[key]}
                  onChange={() => handleToggle(key)}
                  label={label}
                  description={description}
                />
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
