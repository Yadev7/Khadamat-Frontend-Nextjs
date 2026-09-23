"use client";

import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { useTheme } from "next-themes";
import {
  User,
  Lock,
  Bell,
  Globe,
  Palette,
  ShieldAlert,
  ChevronRight,
  Moon,
  Sun,
  Check,
  Loader2,
  Eye,
  EyeOff,
  Trash2,
  LogOut,
  Mail,
  Smartphone,
  Volume2,
  Monitor,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type Section = "profile" | "security" | "appearance" | "notifications" | "language" | "danger";

interface NavItem {
  id: Section;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
      <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">{icon}</div>
      <div>
        <h2 className="text-xl font-black text-slate-800">{title}</h2>
        <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-sm font-bold text-slate-700">{label}</p>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        enabled ? "bg-indigo-600" : "bg-slate-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

// ─── Section Panels ───────────────────────────────────────────────────────────

function ProfileSection({ user }: { user: any }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000)); // replace with actual API call
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <SectionHeader icon={<User size={22} />} title="Profile Information" subtitle="Update your personal details" />

      {/* Avatar Row */}
      <div className="flex items-center gap-6 mb-8 p-4 bg-slate-50 rounded-2xl">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-black text-white shadow-lg shadow-indigo-200 shrink-0">
          {user?.firstName?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800">{user?.firstName} {user?.lastName}</p>
          <p className="text-sm text-slate-400">{user?.email}</p>
          <button className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition">
            Change Avatar →
          </button>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100">
          {/* @ts-ignore */}
          {user?.role?.name || "User"}
        </span>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          { label: "First Name", key: "firstName", placeholder: "Enter first name" },
          { label: "Last Name", key: "lastName", placeholder: "Enter last name" },
        ].map(({ label, key, placeholder }) => (
          <div key={key}>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</label>
            <input
              value={form[key as keyof typeof form]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              placeholder={placeholder}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-400 outline-none text-sm font-medium text-slate-700 bg-white transition-all"
            />
          </div>
        ))}
        <div className="md:col-span-2">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
          <div className="relative">
            <input
              value={form.email}
              disabled
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 outline-none text-sm font-medium text-slate-400 bg-slate-50 pr-28"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase tracking-wider bg-slate-200 text-slate-500 px-2 py-1 rounded-md">
              Read Only
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-60 active:scale-95"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : null}
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

function SecuritySection() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessionAlerts, setSessionAlerts] = useState(true);

  return (
    <div>
      <SectionHeader icon={<Lock size={22} />} title="Security & Privacy" subtitle="Manage your password and account security" />

      {/* Password Change */}
      <div className="bg-slate-50 rounded-2xl p-5 mb-6 space-y-4">
        <h3 className="text-sm font-black text-slate-700 uppercase tracking-wide">Change Password</h3>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Current Password</label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 outline-none text-sm font-medium bg-white transition-all pr-12"
            />
            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">New Password</label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 outline-none text-sm font-medium bg-white transition-all pr-12"
            />
            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Confirm New Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 outline-none text-sm font-medium bg-white transition-all"
          />
        </div>
        <div className="flex justify-end pt-2">
          <button
            onClick={async () => { setSaving(true); await new Promise(r => setTimeout(r, 1000)); setSaving(false); }}
            disabled={saving}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-60 flex items-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Update Password
          </button>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5">
        <h3 className="text-sm font-black text-slate-700 uppercase tracking-wide mb-2">Security Options</h3>
        <SettingRow label="Two-Factor Authentication" description="Add an extra layer of security to your account">
          <Toggle enabled={twoFactor} onChange={setTwoFactor} />
        </SettingRow>
        <SettingRow label="Login Alerts" description="Receive alerts for new sign-in activity">
          <Toggle enabled={sessionAlerts} onChange={setSessionAlerts} />
        </SettingRow>
        <SettingRow label="Active Sessions" description="Manage devices where you're logged in">
          <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            View All <ChevronRight size={14} />
          </button>
        </SettingRow>
      </div>
    </div>
  );
}

function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  const [accentColor, setAccentColor] = useState("indigo");
  const [compactMode, setCompactMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const themes = [
    { id: "light", label: "Light", icon: <Sun size={18} /> },
    { id: "dark", label: "Dark", icon: <Moon size={18} /> },
    { id: "system", label: "System", icon: <Monitor size={18} /> },
  ] as const;

  const accents = [
    { id: "indigo", color: "bg-indigo-500" },
    { id: "blue", color: "bg-blue-500" },
    { id: "violet", color: "bg-violet-500" },
    { id: "emerald", color: "bg-emerald-500" },
    { id: "rose", color: "bg-rose-500" },
    { id: "amber", color: "bg-amber-500" },
  ];

  return (
    <div>
      <SectionHeader icon={<Palette size={22} />} title="Appearance" subtitle="Personalise the look and feel of your dashboard" />

      {/* Theme Chooser */}
      <div className="mb-8">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Theme</label>
        <div className="grid grid-cols-3 gap-3">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all font-bold text-sm ${
                theme === t.id
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                  : "border-slate-100 bg-white text-slate-500 hover:border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-700"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Accent Color */}
      <div className="mb-8">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Accent Color</label>
        <div className="flex gap-3 flex-wrap">
          {accents.map((a) => (
            <button
              key={a.id}
              onClick={() => setAccentColor(a.id)}
              className={`w-9 h-9 rounded-full ${a.color} transition-all hover:scale-110 active:scale-95 ${
                accentColor === a.id ? "ring-4 ring-offset-2 ring-slate-400 scale-110" : ""
              }`}
            />
          ))}
        </div>
      </div>

      {/* Display options */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 dark:bg-slate-900 dark:border-slate-800">
        <h3 className="text-sm font-black text-slate-700 uppercase tracking-wide mb-2 dark:text-slate-200">Display Options</h3>
        <SettingRow label="Compact Mode" description="Reduce spacing for a denser layout">
          <Toggle enabled={compactMode} onChange={setCompactMode} />
        </SettingRow>
        <SettingRow label="Reduce Motion" description="Minimise animations and transitions">
          <Toggle enabled={reducedMotion} onChange={setReducedMotion} />
        </SettingRow>
      </div>
    </div>
  );
}

function NotificationsSection() {
  const [prefs, setPrefs] = useState({
    emailMarketing: false,
    emailSecurity: true,
    emailUpdates: true,
    pushAll: true,
    pushMentions: true,
    smsAlerts: false,
    soundEnabled: true,
  });

  const toggle = (key: keyof typeof prefs) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div>
      <SectionHeader icon={<Bell size={22} />} title="Notifications" subtitle="Control how and when you receive alerts" />

      {/* Email */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Mail size={14} className="text-slate-400" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Notifications</span>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5">
          <SettingRow label="Security Alerts" description="Password changes, new logins">
            <Toggle enabled={prefs.emailSecurity} onChange={() => toggle("emailSecurity")} />
          </SettingRow>
          <SettingRow label="Product Updates" description="New features and announcements">
            <Toggle enabled={prefs.emailUpdates} onChange={() => toggle("emailUpdates")} />
          </SettingRow>
          <SettingRow label="Marketing" description="Tips, offers, and newsletters">
            <Toggle enabled={prefs.emailMarketing} onChange={() => toggle("emailMarketing")} />
          </SettingRow>
        </div>
      </div>

      {/* Push */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Smartphone size={14} className="text-slate-400" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Push Notifications</span>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5">
          <SettingRow label="All Push Notifications" description="Master toggle for push alerts">
            <Toggle enabled={prefs.pushAll} onChange={() => toggle("pushAll")} />
          </SettingRow>
          <SettingRow label="Mentions & Replies" description="When someone mentions you">
            <Toggle enabled={prefs.pushMentions} onChange={() => toggle("pushMentions")} />
          </SettingRow>
        </div>
      </div>

      {/* Other */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Volume2 size={14} className="text-slate-400" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Other</span>
        </div>
        <SettingRow label="Sound Effects" description="Play a sound for important notifications">
          <Toggle enabled={prefs.soundEnabled} onChange={() => toggle("soundEnabled")} />
        </SettingRow>
        <SettingRow label="SMS Alerts" description="Critical alerts via text message">
          <Toggle enabled={prefs.smsAlerts} onChange={() => toggle("smsAlerts")} />
        </SettingRow>
      </div>
    </div>
  );
}

function LanguageSection() {
  const [lang, setLang] = useState("en");
  const [timezone, setTimezone] = useState("Africa/Casablanca");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");

  const languages = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "ar", label: "العربية", flag: "🇲🇦" },
  ];

  return (
    <div>
      <SectionHeader icon={<Globe size={22} />} title="Language & Region" subtitle="Set your preferred language, timezone and date format" />

      {/* Language Picker */}
      <div className="mb-8">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Interface Language</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                lang === l.code
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-slate-100 bg-white text-slate-600 hover:border-slate-200"
              }`}
            >
              <span className="text-2xl">{l.flag}</span>
              {l.label}
              {lang === l.code && <Check size={14} className="ml-auto text-indigo-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* Timezone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Timezone</label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-400 outline-none text-sm font-medium text-slate-700 bg-white transition-all"
          >
            <option value="Africa/Casablanca">Africa/Casablanca (GMT+1)</option>
            <option value="Europe/Paris">Europe/Paris (GMT+2)</option>
            <option value="America/New_York">America/New_York (GMT-4)</option>
            <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Date Format</label>
          <select
            value={dateFormat}
            onChange={(e) => setDateFormat(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-400 outline-none text-sm font-medium text-slate-700 bg-white transition-all"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 transition-all active:scale-95">
          Save Preferences
        </button>
      </div>
    </div>
  );
}

function DangerZoneSection({ logout }: { logout: () => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  return (
    <div>
      <SectionHeader
        icon={<ShieldAlert size={22} />}
        title="Danger Zone"
        subtitle="Irreversible actions — proceed with extreme caution"
      />

      {/* Sign Out All */}
      <div className="border border-amber-200 bg-amber-50 rounded-2xl p-5 mb-4 flex items-center justify-between">
        <div>
          <p className="font-bold text-amber-800 text-sm">Sign Out Everywhere</p>
          <p className="text-xs text-amber-600 mt-0.5">Revoke access from all devices and active sessions</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-800 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-amber-200"
        >
          <LogOut size={14} /> Sign Out All
        </button>
      </div>

      {/* Delete Account */}
      <div className="border border-red-200 bg-red-50 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-bold text-red-800 text-sm">Delete Account</p>
            <p className="text-xs text-red-500 mt-0.5">Permanently removes all your data. This cannot be undone.</p>
          </div>
          {!confirmDelete && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-red-200"
            >
              <Trash2 size={14} /> Delete Account
            </button>
          )}
        </div>

        {confirmDelete && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
            <p className="text-sm text-red-700 font-medium">
              Type <span className="font-black">DELETE</span> to confirm:
            </p>
            <input
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="DELETE"
              className="w-full px-4 py-3 rounded-xl border-2 border-red-200 focus:border-red-500 outline-none text-sm font-bold text-red-700 bg-white transition-all tracking-widest"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setConfirmDelete(false); setDeleteInput(""); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                disabled={deleteInput !== "DELETE"}
                className="flex-1 py-2.5 rounded-xl text-sm font-black bg-red-600 text-white hover:bg-red-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-red-200"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>("profile");

  const navItems: NavItem[] = [
    { id: "profile", label: "Profile", icon: <User size={18} /> },
    { id: "security", label: "Security", icon: <Lock size={18} /> },
    { id: "appearance", label: "Appearance", icon: <Palette size={18} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={18} />, badge: "3" },
    { id: "language", label: "Language & Region", icon: <Globe size={18} /> },
    { id: "danger", label: "Danger Zone", icon: <ShieldAlert size={18} /> },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "profile": return <ProfileSection user={user} />;
      case "security": return <SecuritySection />;
      case "appearance": return <AppearanceSection />;
      case "notifications": return <NotificationsSection />;
      case "language": return <LanguageSection />;
      case "danger": return <DangerZoneSection logout={logout} />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account preferences and configuration</p>
      </div>

      <div className="flex gap-6 items-start">
        {/* ── Sidebar Nav ── */}
        <aside className="w-56 shrink-0 sticky top-6">
          <nav className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            {navItems.map((item, i) => {
              const isDanger = item.id === "danger";
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold transition-all text-left
                    ${i < navItems.length - 1 ? "border-b border-slate-50" : ""}
                    ${isDanger
                      ? isActive
                        ? "bg-red-50 text-red-600"
                        : "text-red-400 hover:bg-red-50 hover:text-red-600"
                      : isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}
                  `}
                >
                  <span className={isActive ? (isDanger ? "text-red-500" : "text-indigo-600") : "text-slate-400"}>
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-black bg-indigo-600 text-white w-4 h-4 rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight size={14} className={isDanger ? "text-red-400" : "text-indigo-400"} />}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ── Main Panel ── */}
        <main className="flex-1 min-w-0 bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
