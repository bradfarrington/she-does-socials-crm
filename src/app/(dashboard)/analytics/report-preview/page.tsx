"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ColourPicker } from "@/components/ui/colour-picker";
import {
    ArrowLeft, Download, Loader2, ChevronDown,
    Users, BarChart3, TrendingUp, Heart, Eye,
    Upload, X, Settings2,
} from "lucide-react";
import Link from "next/link";
import { AnalyticsReport, generateAnalyticsPdf } from "../analytics-report";
import type { ClientAnalytics } from "../analytics-report";
import { DEFAULT_REPORT_SETTINGS } from "../report-settings-modal";
import type { ReportSettings } from "../report-settings-modal";

// ─── Toggle Switch ──────────────────────────────────────
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
    return (
        <label className="flex items-center justify-between gap-2 cursor-pointer py-1">
            <span className="text-xs font-medium text-text-secondary">{label}</span>
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

// ─── Main Page ──────────────────────────────────────────
export default function ReportPreviewPage() {
    const [clients, setClients] = useState<ClientAnalytics[]>([]);
    const [selectedClient, setSelectedClient] = useState<string>("all");
    const [settings, setSettings] = useState<ReportSettings>(DEFAULT_REPORT_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [dateRange, setDateRange] = useState(28);
    const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);

    // Fetch analytics data
    useEffect(() => {
        setLoading(true);
        fetch(`/api/analytics/clients?days=${dateRange}`)
            .then((r) => r.json())
            .then((data) => setClients(data.clients || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [dateRange]);

    // Load saved settings
    useEffect(() => {
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
            .catch(() => { });
    }, []);

    const update = useCallback(<K extends keyof ReportSettings>(key: K, value: ReportSettings[K]) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    }, []);

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
                setTimeout(() => setSaved(false), 2000);
            }
        } catch { }
        setSaving(false);
    }, [settings]);

    const handleExport = useCallback(async () => {
        if (!reportRef.current) return;
        setExporting(true);
        try {
            const name = selectedClient !== "all" && clients.length > 0
                ? clients.find((c) => c.client_id === selectedClient)?.client_name || "report"
                : "all_clients";
            await generateAnalyticsPdf(reportRef.current, name);
        } catch (err) { console.error("PDF error:", err); }
        setExporting(false);
    }, [selectedClient, clients]);

    // Logo upload
    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) return;
        const reader = new FileReader();
        reader.onload = (ev) => update("logo_url", ev.target?.result as string);
        reader.readAsDataURL(file);
        e.target.value = "";
    }, [update]);

    const inputCls = "flex h-8 w-full rounded-lg border border-border bg-surface px-2.5 py-1 text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all";
    const labelCls = "block text-[11px] font-semibold text-text-secondary mb-1";

    const clientsWithData = clients.filter((c) => c.platforms.length > 0);

    return (
        <>
            <Header
                title="Report Preview"
                subtitle="Edit your report layout with live data"
                actions={
                    <div className="flex items-center gap-2">
                        <Link href="/analytics">
                            <Button size="sm" variant="secondary">
                                <ArrowLeft className="w-4 h-4" /> Back to Analytics
                            </Button>
                        </Link>
                        <Button size="sm" variant="secondary" onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                            {saved ? "✓ Saved!" : saving ? "Saving..." : "Save Settings"}
                        </Button>
                        <Button size="sm" onClick={handleExport} disabled={exporting || loading}>
                            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            {exporting ? "Exporting..." : "Export PDF"}
                        </Button>
                    </div>
                }
            />

            <div className="flex h-[calc(100vh-64px)]">
                {/* ─── Sidebar ─────────────────────────────── */}
                <div className={cn(
                    "flex-shrink-0 border-r border-border-light bg-surface overflow-y-auto transition-all",
                    sidebarCollapsed ? "w-0 p-0 overflow-hidden" : "w-72 p-4"
                )}>
                    <div className="space-y-4">
                        {/* Client Selector */}
                        <div>
                            <label className={labelCls}>Client</label>
                            <div className="relative">
                                <button
                                    onClick={() => setClientDropdownOpen(!clientDropdownOpen)}
                                    className={cn(inputCls, "justify-between cursor-pointer")}
                                >
                                    <span>{selectedClient === "all" ? "All Clients" : clients.find((c) => c.client_id === selectedClient)?.client_name || "All"}</span>
                                    <ChevronDown className="w-3 h-3 text-text-tertiary" />
                                </button>
                                {clientDropdownOpen && (
                                    <div className="absolute left-0 right-0 top-full mt-1 bg-surface border border-border rounded-xl shadow-lg py-1 z-50 max-h-48 overflow-y-auto">
                                        <button onClick={() => { setSelectedClient("all"); setClientDropdownOpen(false); }}
                                            className={cn("w-full px-3 py-1.5 text-left text-xs font-medium transition-colors hover:bg-surface-hover",
                                                selectedClient === "all" ? "text-brand-600 bg-brand-50" : "text-text-secondary")}>
                                            All Clients
                                        </button>
                                        {clients.map((c) => (
                                            <button key={c.client_id} onClick={() => { setSelectedClient(c.client_id); setClientDropdownOpen(false); }}
                                                className={cn("w-full px-3 py-1.5 text-left text-xs font-medium transition-colors hover:bg-surface-hover flex items-center gap-2",
                                                    selectedClient === c.client_id ? "text-brand-600 bg-brand-50" : "text-text-secondary")}>
                                                {c.logo_url && <img src={c.logo_url} alt="" className="w-4 h-4 rounded-full object-cover" />}
                                                {c.client_name}
                                                {c.platforms.length === 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-auto" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Date Range */}
                        <div>
                            <label className={labelCls}>Date Range</label>
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(Number(e.target.value))}
                                className={inputCls}
                            >
                                <option value={7}>Last 7 days</option>
                                <option value={14}>Last 14 days</option>
                                <option value={28}>Last 28 days</option>
                                <option value={60}>Last 60 days</option>
                                <option value={90}>Last 90 days</option>
                            </select>
                        </div>

                        <hr className="border-border-light" />

                        {/* Branding */}
                        <div>
                            <h4 className="text-xs font-display font-semibold text-text-primary flex items-center gap-1.5 mb-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-400" /> Branding
                            </h4>
                            <div className="space-y-2">
                                <div>
                                    <label className={labelCls}>Company Name</label>
                                    <input type="text" value={settings.company_name} onChange={(e) => update("company_name", e.target.value)} className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Logo</label>
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                    {settings.logo_url ? (
                                        <div className="flex items-center gap-2">
                                            <img src={settings.logo_url} alt="" className="h-8 w-auto rounded border border-border bg-white p-0.5" />
                                            <button onClick={() => update("logo_url", "")} className="text-[10px] text-rose-500 hover:text-rose-600">Remove</button>
                                            <button onClick={() => fileInputRef.current?.click()} className="text-[10px] text-brand-600 hover:text-brand-700">Change</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg border border-dashed border-border-strong bg-surface-secondary hover:bg-surface-hover transition-all cursor-pointer text-xs text-text-secondary">
                                            <Upload className="w-3.5 h-3.5" /> Upload logo
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className={cn(labelCls, "mb-0 flex-shrink-0")}>Accent</label>
                                    <ColourPicker value={settings.accent_color} onChange={(hex) => update("accent_color", hex)} />
                                    <input type="text" value={settings.accent_color} onChange={(e) => update("accent_color", e.target.value)} className={cn(inputCls, "w-24 font-mono")} />
                                </div>
                            </div>
                        </div>

                        <hr className="border-border-light" />

                        {/* Content */}
                        <div>
                            <h4 className="text-xs font-display font-semibold text-text-primary flex items-center gap-1.5 mb-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-lavender-400" /> Content
                            </h4>
                            <div className="space-y-2">
                                <div>
                                    <label className={labelCls}>Report Title</label>
                                    <input type="text" value={settings.header_text} onChange={(e) => update("header_text", e.target.value)} className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Footer Text</label>
                                    <input type="text" value={settings.footer_text} onChange={(e) => update("footer_text", e.target.value)} className={inputCls} />
                                </div>
                            </div>
                        </div>

                        <hr className="border-border-light" />

                        {/* Section Toggles */}
                        <div>
                            <h4 className="text-xs font-display font-semibold text-text-primary flex items-center gap-1.5 mb-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-sage-400" /> Sections
                            </h4>
                            <div className="space-y-1">
                                <Toggle checked={settings.show_overview} onChange={(v) => update("show_overview", v)} label="Overview Stats" />
                                <Toggle checked={settings.show_platform_breakdown} onChange={(v) => update("show_platform_breakdown", v)} label="Platform Breakdown" />
                                <Toggle checked={settings.show_weekly_charts} onChange={(v) => update("show_weekly_charts", v)} label="Weekly Charts" />
                                <Toggle checked={settings.show_top_posts} onChange={(v) => update("show_top_posts", v)} label="Top Posts" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Sidebar toggle ─────────────────────── */}
                <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="flex-shrink-0 w-6 flex items-center justify-center border-r border-border-light hover:bg-surface-hover transition-colors text-text-tertiary hover:text-text-secondary"
                    title={sidebarCollapsed ? "Show settings" : "Hide settings"}
                >
                    <Settings2 className={cn("w-3.5 h-3.5 transition-transform", sidebarCollapsed && "rotate-180")} />
                </button>

                {/* ─── Preview Area ───────────────────────── */}
                <div className="flex-1 overflow-auto bg-surface-tertiary">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3">
                            <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
                            <p className="text-sm text-text-tertiary">Loading analytics data...</p>
                        </div>
                    ) : clientsWithData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3">
                            <Users className="w-8 h-8 text-text-tertiary" />
                            <p className="text-sm text-text-tertiary">No clients with analytics data</p>
                            <Link href="/analytics"><Button size="sm" variant="secondary">Back to Analytics</Button></Link>
                        </div>
                    ) : (
                        <div className="p-8 flex justify-center">
                            <div className="shadow-xl rounded-lg overflow-hidden border border-border-light">
                                <AnalyticsReport
                                    ref={reportRef}
                                    clients={clients}
                                    settings={settings}
                                    dateRange={dateRange}
                                    selectedClient={selectedClient}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
