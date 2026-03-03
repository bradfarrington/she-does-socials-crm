"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ColourPicker } from "@/components/ui/colour-picker";
import {
    X, Settings2, Eye, Upload, Loader2,
    Users, BarChart3, TrendingUp, FileText, Heart,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────
export interface ReportSettings {
    company_name: string;
    logo_url: string;
    accent_color: string;
    header_text: string;
    footer_text: string;
    show_overview: boolean;
    show_platform_breakdown: boolean;
    show_weekly_charts: boolean;
    show_top_posts: boolean;
}

export const DEFAULT_REPORT_SETTINGS: ReportSettings = {
    company_name: "She Does Socials",
    logo_url: "",
    accent_color: "#f472b6",
    header_text: "Monthly Performance Report",
    footer_text: "Prepared by She Does Socials",
    show_overview: true,
    show_platform_breakdown: true,
    show_weekly_charts: true,
    show_top_posts: true,
};

interface ReportSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSettingsLoaded?: (settings: ReportSettings) => void;
}

// ─── Toggle Switch ──────────────────────────────────────
function ToggleSwitch({ checked, onChange, label, description, icon: Icon }: {
    checked: boolean;
    onChange: (v: boolean) => void;
    label: string;
    description?: string;
    icon?: React.ElementType;
}) {
    return (
        <label className="flex items-center gap-3 p-3 rounded-xl bg-surface-secondary/50 hover:bg-surface-hover transition-colors cursor-pointer group">
            {Icon && (
                <div className="p-1.5 rounded-lg bg-surface border border-border">
                    <Icon className="w-3.5 h-3.5 text-text-secondary" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text-primary">{label}</p>
                {description && <p className="text-[10px] text-text-tertiary">{description}</p>}
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={cn(
                    "relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0",
                    checked ? "bg-brand-500" : "bg-border-strong"
                )}
            >
                <span className={cn(
                    "inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform",
                    checked ? "translate-x-4" : "translate-x-0.5"
                )} />
            </button>
        </label>
    );
}

// ─── Logo Upload ────────────────────────────────────────
function LogoUpload({ logoUrl, onLogoChange }: { logoUrl: string; onLogoChange: (url: string) => void }) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) return;
        if (file.size > 2 * 1024 * 1024) return;

        setUploading(true);
        const reader = new FileReader();
        reader.onload = (ev) => {
            onLogoChange(ev.target?.result as string);
            setUploading(false);
        };
        reader.onerror = () => setUploading(false);
        reader.readAsDataURL(file);
        e.target.value = "";
    }, [onLogoChange]);

    return (
        <div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            {logoUrl ? (
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <img src={logoUrl} alt="Logo" className="h-10 w-auto max-w-[100px] rounded-lg border border-border object-contain bg-white p-1" />
                        <button onClick={() => onLogoChange("")} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                    <button onClick={() => fileInputRef.current?.click()} className="text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors">Change</button>
                </div>
            ) : (
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-dashed border-border-strong bg-surface-secondary hover:bg-surface-hover hover:border-brand-300 transition-all cursor-pointer"
                >
                    <div className="p-1.5 rounded-lg bg-brand-50">
                        {uploading ? <Loader2 className="w-4 h-4 text-brand-500 animate-spin" /> : <Upload className="w-4 h-4 text-brand-500" />}
                    </div>
                    <div className="text-left">
                        <div className="text-xs font-medium text-text-primary">{uploading ? "Uploading..." : "Upload logo"}</div>
                        <div className="text-[10px] text-text-tertiary">PNG, JPG, or SVG — max 2MB</div>
                    </div>
                </button>
            )}
        </div>
    );
}

// ─── Mini Preview ───────────────────────────────────────
function ReportPreview({ settings }: { settings: ReportSettings }) {
    return (
        <div className="bg-white rounded-lg shadow-lg border border-border-light overflow-hidden" style={{ fontSize: "10px" }}>
            {/* Cover / Header */}
            <div className="p-5 pb-4" style={{ borderBottom: `3px solid ${settings.accent_color}` }}>
                <div className="flex items-start justify-between">
                    <div>
                        {settings.logo_url ? (
                            <img src={settings.logo_url} alt="" className="h-7 w-auto mb-1.5" />
                        ) : (
                            <div className="text-sm font-display font-bold" style={{ color: settings.accent_color }}>
                                {settings.company_name || "Your Company"}
                            </div>
                        )}
                        <p className="text-[8px] text-text-tertiary">Client Name • Last 28 days</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-display font-semibold text-text-primary">{settings.header_text || "Performance Report"}</p>
                        <p className="text-[8px] text-text-tertiary">3 Mar 2026</p>
                    </div>
                </div>
            </div>

            {/* Overview Stats */}
            {settings.show_overview && (
                <div className="px-5 py-3">
                    <div className="text-[8px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">Overview</div>
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { label: "Followers", value: "12.4k", color: "bg-brand-50 text-brand-600" },
                            { label: "Reach", value: "45.2k", color: "bg-lavender-50 text-lavender-500" },
                            { label: "Engagement", value: "3.8k", color: "bg-rose-50 text-rose-500" },
                            { label: "Impressions", value: "89.1k", color: "bg-sage-50 text-sage-600" },
                        ].map((s) => (
                            <div key={s.label} className="p-1.5 rounded-lg bg-surface-secondary border border-border-light">
                                <p className="text-[10px] font-display font-bold text-text-primary">{s.value}</p>
                                <p className="text-[7px] text-text-tertiary">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Platform Breakdown */}
            {settings.show_platform_breakdown && (
                <div className="px-5 py-2">
                    <div className="text-[8px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">Platforms</div>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { name: "Facebook", followers: "8.2k", gradient: "from-blue-500 to-blue-600" },
                            { name: "Instagram", followers: "4.2k", gradient: "from-purple-500 to-pink-500" },
                        ].map((p) => (
                            <div key={p.name} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-surface-secondary border border-border-light">
                                <div className={cn("w-4 h-4 rounded-md bg-gradient-to-br flex items-center justify-center", p.gradient)}>
                                    <span className="text-[6px] text-white font-bold">{p.name[0]}</span>
                                </div>
                                <div>
                                    <p className="text-[9px] font-semibold text-text-primary">{p.followers}</p>
                                    <p className="text-[6px] text-text-tertiary">{p.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Weekly Charts */}
            {settings.show_weekly_charts && (
                <div className="px-5 py-2">
                    <div className="text-[8px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">Weekly Trends</div>
                    <div className="flex items-end gap-1 h-8">
                        {[40, 60, 45, 80].map((h, i) => (
                            <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, backgroundColor: settings.accent_color, opacity: 0.6 + i * 0.1 }} />
                        ))}
                    </div>
                    <div className="flex justify-between mt-0.5">
                        {["W1", "W2", "W3", "W4"].map((w) => (
                            <span key={w} className="text-[6px] text-text-tertiary">{w}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* Top Posts */}
            {settings.show_top_posts && (
                <div className="px-5 py-2">
                    <div className="text-[8px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">Top Posts</div>
                    <div className="space-y-1">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="flex items-center gap-1.5 p-1 rounded-md bg-surface-secondary/50">
                                <span className="w-3.5 h-3.5 rounded-full bg-brand-50 text-brand-600 text-[7px] font-bold flex items-center justify-center">{n}</span>
                                <div className="w-5 h-5 rounded bg-surface-tertiary border border-border-light" />
                                <div className="flex-1">
                                    <div className="h-1 bg-surface-tertiary rounded w-3/4 mb-0.5" />
                                    <div className="h-1 bg-surface-tertiary rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer */}
            {settings.footer_text && (
                <div className="px-5 py-2 border-t border-border-light text-center">
                    <p className="text-[7px] text-text-tertiary">{settings.footer_text}</p>
                </div>
            )}
        </div>
    );
}

// ─── Main Modal ─────────────────────────────────────────
export function ReportSettingsModal({ isOpen, onClose, onSettingsLoaded }: ReportSettingsModalProps) {
    const [settings, setSettings] = useState<ReportSettings>(DEFAULT_REPORT_SETTINGS);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(false);

    // Load from DB
    useEffect(() => {
        if (!isOpen) return;
        setSaved(false);
        setLoading(true);
        fetch("/api/report-settings")
            .then((r) => r.json())
            .then((data) => {
                if (data.settings) {
                    setSettings({
                        company_name: data.settings.company_name || DEFAULT_REPORT_SETTINGS.company_name,
                        logo_url: data.settings.logo_url || "",
                        accent_color: data.settings.accent_color || DEFAULT_REPORT_SETTINGS.accent_color,
                        header_text: data.settings.header_text || DEFAULT_REPORT_SETTINGS.header_text,
                        footer_text: data.settings.footer_text || DEFAULT_REPORT_SETTINGS.footer_text,
                        show_overview: data.settings.show_overview ?? true,
                        show_platform_breakdown: data.settings.show_platform_breakdown ?? true,
                        show_weekly_charts: data.settings.show_weekly_charts ?? true,
                        show_top_posts: data.settings.show_top_posts ?? true,
                    });
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [isOpen]);

    const handleSave = useCallback(async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/report-settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });
            if (res.ok) {
                setSaved(true);
                onSettingsLoaded?.(settings);
                setTimeout(() => setSaved(false), 2000);
            }
        } catch { }
        setSaving(false);
    }, [settings, onSettingsLoaded]);

    const update = useCallback(<K extends keyof ReportSettings>(key: K, value: ReportSettings[K]) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    }, []);

    if (!isOpen) return null;

    const inputCls = "flex h-9 w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all";
    const labelCls = "block text-xs font-semibold text-text-secondary mb-1";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-surface rounded-2xl border border-border shadow-xl w-full max-w-5xl mx-4 max-h-[92vh] flex flex-col animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border-light flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-brand-50">
                            <Settings2 className="w-5 h-5 text-brand-500" />
                        </div>
                        <div>
                            <h2 className="font-display font-semibold text-lg text-text-primary">Report Settings</h2>
                            <p className="text-xs text-text-tertiary">Customise your analytics report branding and sections</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant={saved ? "success" : "primary"}
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</> : saved ? "✓ Saved!" : "Save Settings"}
                        </Button>
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-hover transition-colors">
                            <X className="w-4 h-4 text-text-tertiary" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left: Settings */}
                            <div className="space-y-4">
                                {/* Branding */}
                                <Card>
                                    <CardContent className="p-4 space-y-3">
                                        <h3 className="text-sm font-display font-semibold text-text-primary flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                                            Branding
                                        </h3>
                                        <div>
                                            <label className={labelCls}>Company Name</label>
                                            <input
                                                type="text"
                                                value={settings.company_name}
                                                onChange={(e) => update("company_name", e.target.value)}
                                                className={inputCls}
                                                placeholder="She Does Socials"
                                            />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Logo</label>
                                            <LogoUpload logoUrl={settings.logo_url} onLogoChange={(url) => update("logo_url", url)} />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <label className={cn(labelCls, "mb-0")}>Accent Colour</label>
                                            <div className="flex items-center gap-2">
                                                <ColourPicker
                                                    value={settings.accent_color}
                                                    onChange={(hex) => update("accent_color", hex)}
                                                />
                                                <input
                                                    type="text"
                                                    value={settings.accent_color}
                                                    onChange={(e) => update("accent_color", e.target.value)}
                                                    className={cn(inputCls, "w-28 font-mono text-xs")}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Content */}
                                <Card>
                                    <CardContent className="p-4 space-y-3">
                                        <h3 className="text-sm font-display font-semibold text-text-primary flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-lavender-400" />
                                            Report Content
                                        </h3>
                                        <div>
                                            <label className={labelCls}>Report Title</label>
                                            <input
                                                type="text"
                                                value={settings.header_text}
                                                onChange={(e) => update("header_text", e.target.value)}
                                                className={inputCls}
                                                placeholder="Monthly Performance Report"
                                            />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Footer Text</label>
                                            <input
                                                type="text"
                                                value={settings.footer_text}
                                                onChange={(e) => update("footer_text", e.target.value)}
                                                className={inputCls}
                                                placeholder="Prepared by She Does Socials"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Section Toggles */}
                                <Card>
                                    <CardContent className="p-4 space-y-2">
                                        <h3 className="text-sm font-display font-semibold text-text-primary flex items-center gap-2 mb-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-sage-400" />
                                            Sections
                                        </h3>
                                        <ToggleSwitch
                                            checked={settings.show_overview}
                                            onChange={(v) => update("show_overview", v)}
                                            label="Overview Stats"
                                            description="Followers, reach, engagement, impressions"
                                            icon={Users}
                                        />
                                        <ToggleSwitch
                                            checked={settings.show_platform_breakdown}
                                            onChange={(v) => update("show_platform_breakdown", v)}
                                            label="Platform Breakdown"
                                            description="Per-platform stats and engagement rate"
                                            icon={BarChart3}
                                        />
                                        <ToggleSwitch
                                            checked={settings.show_weekly_charts}
                                            onChange={(v) => update("show_weekly_charts", v)}
                                            label="Weekly Charts"
                                            description="Reach, engagement, impressions over time"
                                            icon={TrendingUp}
                                        />
                                        <ToggleSwitch
                                            checked={settings.show_top_posts}
                                            onChange={(v) => update("show_top_posts", v)}
                                            label="Top Posts"
                                            description="Best performing posts with engagement metrics"
                                            icon={Heart}
                                        />
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right: Preview */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-display font-semibold text-text-primary">
                                    <Eye className="w-4 h-4 text-brand-400" />
                                    Report Preview
                                </div>
                                <div className="sticky top-0">
                                    <div className="bg-surface-tertiary rounded-xl p-6 border border-border-light">
                                        <ReportPreview settings={settings} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
