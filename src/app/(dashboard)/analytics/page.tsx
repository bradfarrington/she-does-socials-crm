"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    Users, Eye, Heart, BarChart3,
    Instagram, Facebook, Linkedin, Music2,
    Download, FileText, Loader2, RefreshCw, Wifi, WifiOff,
    Link2, Settings, ArrowUpRight, ArrowDownRight,
    MessageCircle, Share2, Image, Film, ThumbsUp, TrendingUp,
    Calendar, Activity, ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { ReportSettingsModal, DEFAULT_REPORT_SETTINGS } from "./report-settings-modal";
import type { ReportSettings } from "./report-settings-modal";
import { AnalyticsReport, generateAnalyticsPdf } from "./analytics-report";

// ─── Config ─────────────────────────────────────────────
const platformConfig: Record<string, { label: string; icon: React.ElementType; gradient: string }> = {
    instagram: { label: "Instagram", icon: Instagram, gradient: "from-purple-500 to-pink-500" },
    facebook: { label: "Facebook", icon: Facebook, gradient: "from-blue-500 to-blue-600" },
    tiktok: { label: "TikTok", icon: Music2, gradient: "from-gray-800 to-black" },
    linkedin: { label: "LinkedIn", icon: Linkedin, gradient: "from-blue-600 to-blue-800" },
};

const postTypeIcons: Record<string, React.ElementType> = {
    photo: Image, video: Film, link: Share2, status: FileText,
    IMAGE: Image, VIDEO: Film, CAROUSEL_ALBUM: Image, REEL: Film,
};

// ─── Types ──────────────────────────────────────────────
interface WeeklyDataPoint { label: string; reach: number; engagement: number; impressions: number }
interface TopPost { id: string; message: string; created_time: string; type: string; image_url: string | null; reactions: number; comments: number; shares: number; views: number }
interface PlatformInsights { platform: "facebook" | "instagram"; followers: number; reach: number; engagement: number; impressions: number; weekly_data: WeeklyDataPoint[]; top_posts: TopPost[]; prev_reach: number; prev_engagement: number; prev_impressions: number }
interface ClientAnalytics { client_id: string; client_name: string; logo_url: string | null; platforms: PlatformInsights[] }

// ─── Helpers ────────────────────────────────────────────
function formatNum(value: number): string {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return value.toString();
}

function calcTrend(current: number, previous: number): { percent: number; up: boolean } | null {
    if (previous === 0 && current === 0) return null;
    if (previous === 0) return { percent: 100, up: true };
    const pct = ((current - previous) / previous) * 100;
    return { percent: Math.abs(pct), up: pct >= 0 };
}

function formatDate(dateStr: string): string {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// ─── Mini Bar Chart ─────────────────────────────────────
function MiniBarChart({ data, colour, label }: { data: { label: string; value: number }[]; colour: string; label: string }) {
    const max = Math.max(...data.map((d) => d.value), 1);
    return (
        <div className="space-y-1.5">
            <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wide">{label}</p>
            <div className="flex items-end gap-1 h-16">
                {data.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group/bar relative cursor-default">
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-text-primary text-white text-[9px] font-semibold whitespace-nowrap opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none z-10">
                            {formatNum(d.value)}
                        </div>
                        <div
                            className={cn("w-full rounded-t-sm transition-all group-hover/bar:opacity-80", colour)}
                            style={{ height: `${Math.max(4, (d.value / max) * 56)}px` }}
                        />
                        <span className="text-[8px] text-text-tertiary">{d.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Stat Pill with Trend ───────────────────────────────
function StatPill({ label, value, icon: Icon, trend, change }: { label: string; value: number; icon: React.ElementType; trend?: { percent: number; up: boolean } | null; change?: number }) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border hover:shadow-card-hover transition-all">
            <div className="p-2 rounded-lg bg-surface-secondary"><Icon className="w-4 h-4 text-text-secondary" /></div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <p className="text-lg font-display font-bold text-text-primary">{formatNum(value)}</p>
                    {trend && (
                        <span className={cn("flex items-center gap-0.5 text-[10px] font-semibold", trend.up ? "text-emerald-500" : "text-red-400")}>
                            {trend.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {trend.percent.toFixed(0)}%
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1.5">
                    <p className="text-[10px] text-text-tertiary font-medium">{label}</p>
                    {change !== undefined && change !== 0 && (
                        <span className={cn("text-[10px] font-semibold", change > 0 ? "text-emerald-500" : "text-red-400")}>
                            {change > 0 ? "+" : ""}{formatNum(change)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Large Stat Card (for overview) ─────────────────────
function LargeStatCard({ label, value, icon: Icon, accentColour, trend, change }: { label: string; value: number; icon: React.ElementType; accentColour: string; trend?: { percent: number; up: boolean } | null; change?: number }) {
    return (
        <Card className="hover:shadow-card-hover transition-all">
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <div className={cn("p-2 rounded-lg", accentColour)}><Icon className="w-4 h-4" /></div>
                    {trend ? (
                        <div className="flex flex-col items-end">
                            <span className={cn("flex items-center gap-0.5 text-xs font-semibold", trend.up ? "text-emerald-500" : "text-red-400")}>
                                {trend.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                {trend.percent.toFixed(0)}%
                            </span>
                            {change !== undefined && change !== 0 && (
                                <span className={cn("text-[10px] font-semibold", change > 0 ? "text-emerald-500" : "text-red-400")}>
                                    {change > 0 ? "+" : ""}{formatNum(change)}
                                </span>
                            )}
                        </div>
                    ) : (
                        <ArrowUpRight className="w-3.5 h-3.5 text-text-tertiary" />
                    )}
                </div>
                <p className="text-2xl font-display font-bold text-text-primary">{formatNum(value)}</p>
                <p className="text-xs text-text-tertiary font-medium mt-0.5">{label}</p>
            </CardContent>
        </Card>
    );
}

// ─── Top Post Card ──────────────────────────────────────
function TopPostCard({ post, rank }: { post: TopPost; rank: number }) {
    const TypeIcon = postTypeIcons[post.type] || FileText;
    return (
        <div className="flex gap-3 p-3 rounded-xl bg-surface-secondary/50 hover:bg-surface-hover transition-colors border border-transparent hover:border-border">
            <div className="flex-shrink-0 flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-50 text-brand-600 text-[10px] font-bold flex items-center justify-center">
                    {rank}
                </span>
                {post.image_url ? (
                    <img src={post.image_url} alt="" className="w-12 h-12 rounded-lg object-cover border border-border" />
                ) : (
                    <div className="w-12 h-12 rounded-lg bg-surface border border-border flex items-center justify-center">
                        <TypeIcon className="w-5 h-5 text-text-tertiary" />
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-text-primary line-clamp-2 leading-relaxed">{post.message}</p>
                <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-[10px] text-text-tertiary">
                        <ThumbsUp className="w-3 h-3 text-blue-400" />
                        {post.reactions.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-text-tertiary">
                        <MessageCircle className="w-3 h-3 text-sage-400" />
                        {post.comments.toLocaleString()}
                    </span>
                    {post.shares > 0 && (
                        <span className="flex items-center gap-1 text-[10px] text-text-tertiary">
                            <Share2 className="w-3 h-3 text-lavender-400" />
                            {post.shares.toLocaleString()}
                        </span>
                    )}
                    <span className="text-[9px] text-text-tertiary ml-auto">{formatDate(post.created_time)}</span>
                </div>
            </div>
        </div>
    );
}

// ─── Empty State ────────────────────────────────────────
function EmptyState({ icon: Icon, title, description, action }: { icon: React.ElementType; title: string; description: string; action?: React.ReactNode }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-secondary flex items-center justify-center mb-4">
                <Icon className="w-7 h-7 text-text-tertiary" />
            </div>
            <h3 className="font-display font-semibold text-text-primary mb-1">{title}</h3>
            <p className="text-sm text-text-secondary max-w-sm mb-4">{description}</p>
            {action}
        </div>
    );
}
// ─── Cache Config ───────────────────────────────────────
const CACHE_KEY = "analytics_cache";
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

function getCachedData(): { clients: ClientAnalytics[]; meta_connected: boolean; timestamp: number } | null {
    try {
        const raw = sessionStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
            sessionStorage.removeItem(CACHE_KEY);
            return null;
        }
        return parsed;
    } catch { return null; }
}

function setCachedData(clients: ClientAnalytics[], meta_connected: boolean) {
    try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ clients, meta_connected, timestamp: Date.now() }));
    } catch { /* quota exceeded — ignore */ }
}

// ─── Main Page ──────────────────────────────────────────
export default function AnalyticsPage() {
    const [clients, setClients] = useState<ClientAnalytics[]>([]);
    const [metaConnected, setMetaConnected] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedClient, setSelectedClient] = useState<string>("all");
    const [refreshing, setRefreshing] = useState(false);
    const [fromCache, setFromCache] = useState(false);
    const [dateRange, setDateRange] = useState(28);
    const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
    const [reportSettingsOpen, setReportSettingsOpen] = useState(false);
    const [reportSettings, setReportSettings] = useState<ReportSettings>(DEFAULT_REPORT_SETTINGS);
    const [exporting, setExporting] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);

    const dateOptions = [
        { label: "Last 7 days", value: 7 },
        { label: "Last 14 days", value: 14 },
        { label: "Last 28 days", value: 28 },
        { label: "Last 60 days", value: 60 },
        { label: "Last 90 days", value: 90 },
    ];

    const fetchAnalytics = useCallback(async (isRefresh = false, days = 28) => {
        // Check cache first (skip on manual refresh)
        const cacheKey = `${CACHE_KEY}_${days}`;
        if (!isRefresh) {
            try {
                const raw = sessionStorage.getItem(cacheKey);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
                        setClients(parsed.clients);
                        setMetaConnected(parsed.meta_connected);
                        setFromCache(true);
                        setLoading(false);
                        return;
                    }
                }
            } catch { /* ignore */ }
        }

        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);
        setFromCache(false);
        try {
            const res = await fetch(`/api/analytics/clients?days=${days}`);
            if (!res.ok) throw new Error("Failed to fetch analytics");
            const data = await res.json();
            const clientsData = data.clients || [];
            setClients(clientsData);
            setMetaConnected(data.meta_connected ?? true);
            setCachedData(clientsData, data.meta_connected ?? true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchAnalytics(false, dateRange); }, [fetchAnalytics, dateRange]);

    // Auto-load report settings so Export uses saved values
    useEffect(() => {
        fetch("/api/report-settings")
            .then((r) => r.json())
            .then((data) => { if (data.settings) setReportSettings(data.settings); })
            .catch(() => { });
    }, []);

    const displayData = useMemo(() => {
        if (selectedClient === "all") return clients;
        return clients.filter((c) => c.client_id === selectedClient);
    }, [selectedClient, clients]);

    const clientsWithData = useMemo(() => clients.filter((c) => c.platforms.length > 0), [clients]);
    const clientsWithoutData = useMemo(() => clients.filter((c) => c.platforms.length === 0), [clients]);

    // Aggregate totals + previous period
    const totals = useMemo(() => {
        let followers = 0, reach = 0, engagement = 0, impressions = 0;
        let prevReach = 0, prevEngagement = 0, prevImpressions = 0;
        displayData.forEach((c) => c.platforms.forEach((p) => {
            followers += p.followers;
            reach += p.reach;
            engagement += p.engagement;
            impressions += p.impressions;
            prevReach += p.prev_reach;
            prevEngagement += p.prev_engagement;
            prevImpressions += p.prev_impressions;
        }));
        return { followers, reach, engagement, impressions, prevReach, prevEngagement, prevImpressions };
    }, [displayData]);

    const reachTrend = calcTrend(totals.reach, totals.prevReach);
    const engTrend = calcTrend(totals.engagement, totals.prevEngagement);
    const imprTrend = calcTrend(totals.impressions, totals.prevImpressions);

    // Platform breakdown
    const platformTotals = useMemo(() => {
        const map: Record<string, { followers: number }> = {};
        displayData.forEach((c) => c.platforms.forEach((p) => {
            if (!map[p.platform]) map[p.platform] = { followers: 0 };
            map[p.platform].followers += p.followers;
        }));
        return map;
    }, [displayData]);

    // Loading
    if (loading) {
        return (
            <>
                <Header title="Analytics" subtitle="Loading performance data..." />
                <div className="flex flex-col items-center justify-center py-32 gap-3 animate-fade-in">
                    <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
                    <p className="text-sm text-text-tertiary">Fetching data from Meta Business Suite...</p>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header title="Analytics" />
                <EmptyState icon={WifiOff} title="Failed to load analytics" description={error}
                    action={<Button size="sm" onClick={() => fetchAnalytics()}><RefreshCw className="w-4 h-4" /> Try Again</Button>} />
            </>
        );
    }

    if (!metaConnected) {
        return (
            <>
                <Header title="Analytics" subtitle="Connect Meta to see your client stats" />
                <EmptyState icon={Wifi} title="Connect Meta Business Suite"
                    description="Link your Meta account in Settings to start pulling real analytics for your clients' Facebook and Instagram pages."
                    action={<Link href="/settings"><Button size="sm"><Settings className="w-4 h-4" /> Go to Settings</Button></Link>} />
            </>
        );
    }

    if (clients.length === 0) {
        return (
            <>
                <Header title="Analytics" subtitle="No active clients" />
                <EmptyState icon={Users} title="No active clients found"
                    description="Add some clients and link them to their Meta pages to start tracking performance."
                    action={<Link href="/clients"><Button size="sm"><Users className="w-4 h-4" /> View Clients</Button></Link>} />
            </>
        );
    }

    return (
        <>
            <Header title="Analytics" subtitle={`Performance across ${displayData.length} client${displayData.length !== 1 ? "s" : ""}`}
                actions={
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Button size="sm" variant="secondary" onClick={() => setDateDropdownOpen(!dateDropdownOpen)}>
                                <Calendar className="w-4 h-4" />
                                {dateOptions.find(o => o.value === dateRange)?.label}
                                <ChevronDown className="w-3 h-3" />
                            </Button>
                            {dateDropdownOpen && (
                                <div className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-xl shadow-lg py-1 z-50 min-w-[160px]">
                                    {dateOptions.map((opt) => (
                                        <button key={opt.value} onClick={() => { setDateRange(opt.value); setDateDropdownOpen(false); }}
                                            className={cn("w-full px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-surface-hover",
                                                dateRange === opt.value ? "text-brand-600 bg-brand-50" : "text-text-secondary")}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <Button size="sm" variant="secondary" onClick={() => fetchAnalytics(true, dateRange)} disabled={refreshing}>
                            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
                            {refreshing ? "Refreshing..." : "Refresh"}
                        </Button>
                        <Button size="sm" variant="secondary" disabled={exporting} onClick={async () => {
                            if (!reportRef.current) return;
                            setExporting(true);
                            try {
                                const clientName = selectedClient !== "all" && clients.length > 0
                                    ? clients.find(c => c.client_id === selectedClient)?.client_name || "report"
                                    : "all_clients";
                                await generateAnalyticsPdf(reportRef.current, clientName);
                            } catch (err) { console.error("PDF generation failed:", err); }
                            setExporting(false);
                        }}>
                            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            {exporting ? "Exporting..." : "Export"}
                        </Button>
                    </div>
                }
            />
            <div className="p-6 space-y-6 animate-fade-in">
                {/* Client Filter */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    <button onClick={() => setSelectedClient("all")} className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap", selectedClient === "all" ? "bg-text-primary text-white" : "bg-surface border border-border text-text-secondary hover:bg-surface-hover")}>All Clients</button>
                    {clients.map((c) => (
                        <button key={c.client_id} onClick={() => setSelectedClient(c.client_id)} className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5", selectedClient === c.client_id ? "bg-brand-50 text-brand-700" : "bg-surface border border-border text-text-secondary hover:bg-surface-hover")}>
                            {c.logo_url && <img src={c.logo_url} alt="" className="w-4 h-4 rounded-full object-cover" />}
                            {c.client_name}
                            {c.platforms.length === 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="No Meta data" />}
                        </button>
                    ))}
                </div>

                {/* Overview Stats with Trends */}
                {clientsWithData.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <LargeStatCard label="Total Followers" value={totals.followers} icon={Users} accentColour="bg-brand-50 text-brand-600" />
                        <LargeStatCard label={`Reach (${dateRange}d)`} value={totals.reach} icon={Eye} accentColour="bg-lavender-50 text-lavender-500" trend={reachTrend} change={totals.reach - totals.prevReach} />
                        <LargeStatCard label={`Engagement (${dateRange}d)`} value={totals.engagement} icon={Heart} accentColour="bg-rose-50 text-rose-500" trend={engTrend} change={totals.engagement - totals.prevEngagement} />
                        <LargeStatCard label={`Impressions (${dateRange}d)`} value={totals.impressions} icon={BarChart3} accentColour="bg-sage-50 text-sage-600" trend={imprTrend} change={totals.impressions - totals.prevImpressions} />
                    </div>
                )}

                {/* Platform Summary */}
                {Object.keys(platformTotals).length > 1 && (
                    <div className="flex items-center gap-3 flex-wrap">
                        {Object.entries(platformTotals).map(([platform, stats]) => {
                            const config = platformConfig[platform];
                            if (!config) return null;
                            const PIcon = config.icon;
                            return (
                                <div key={platform} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-border">
                                    <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center text-white bg-gradient-to-br", config.gradient)}>
                                        <PIcon className="w-3 h-3" />
                                    </div>
                                    <div className="text-xs">
                                        <span className="font-semibold text-text-primary">{formatNum(stats.followers)}</span>
                                        <span className="text-text-tertiary ml-1">followers</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Per-Client Sections */}
                {displayData.map((client) => (
                    <div key={client.client_id} className="space-y-4">
                        <div className="flex items-center gap-2">
                            {client.logo_url && <img src={client.logo_url} alt="" className="w-7 h-7 rounded-lg object-cover border border-border" />}
                            <h2 className="font-display font-semibold text-lg text-text-primary">{client.client_name}</h2>
                            {client.platforms.length > 0 ? (
                                <Badge variant="outline" size="sm">{client.platforms.length} platform{client.platforms.length !== 1 ? "s" : ""}</Badge>
                            ) : (
                                <Badge variant="outline" size="sm" className="text-amber-600 bg-amber-50 border-amber-200">
                                    <Link2 className="w-3 h-3" /> No Meta link
                                </Badge>
                            )}
                        </div>

                        {client.platforms.length === 0 ? (
                            <Card className="border-dashed border-amber-200 bg-amber-50/30">
                                <CardContent className="p-5 text-center">
                                    <p className="text-sm text-text-secondary mb-2">This client isn&apos;t linked to a Meta page yet.</p>
                                    <Link href={`/clients/${client.client_id}`}>
                                        <Button size="sm" variant="secondary"><Link2 className="w-4 h-4" /> Link Meta Page</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className={cn("grid gap-4", client.platforms.length > 1 ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1")}>
                                {client.platforms.map((platform) => {
                                    const config = platformConfig[platform.platform];
                                    if (!config) return null;
                                    const PlatformIcon = config.icon;
                                    const hasWeeklyData = platform.weekly_data?.length > 0;
                                    const hasTopPosts = platform.top_posts?.length > 0;

                                    const reachTrend = calcTrend(platform.reach, platform.prev_reach);
                                    const engTrend = calcTrend(platform.engagement, platform.prev_engagement);
                                    const imprTrend = calcTrend(platform.impressions, platform.prev_impressions);

                                    return (
                                        <Card key={platform.platform} className="animate-fade-in overflow-hidden">
                                            <div className={cn("h-1.5 bg-gradient-to-r", config.gradient)} />
                                            <CardContent className="p-5">
                                                {/* Platform Header */}
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-white bg-gradient-to-br", config.gradient)}>
                                                            <PlatformIcon className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm font-semibold text-text-primary">{config.label}</h3>
                                                            <p className="text-[10px] text-text-tertiary">Last {dateRange} days</p>
                                                        </div>
                                                    </div>
                                                    {platform.reach > 0 && platform.engagement > 0 && (
                                                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-secondary border border-border">
                                                            <Activity className="w-3 h-3 text-brand-500" />
                                                            <div>
                                                                <p className="text-xs font-display font-bold text-text-primary">{((platform.engagement / platform.reach) * 100).toFixed(1)}%</p>
                                                                <p className="text-[8px] text-text-tertiary font-medium">Engagement</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Stats Grid — 2x2 in side-by-side mode */}
                                                <div className="grid grid-cols-2 gap-3 mb-4">
                                                    <StatPill label="Followers" value={platform.followers} icon={Users} />
                                                    <StatPill label="Reach" value={platform.reach} icon={Eye} trend={reachTrend} change={platform.reach - platform.prev_reach} />
                                                    <StatPill label="Engagement" value={platform.engagement} icon={Heart} trend={engTrend} change={platform.engagement - platform.prev_engagement} />
                                                    <StatPill label="Impressions" value={platform.impressions} icon={BarChart3} trend={imprTrend} change={platform.impressions - platform.prev_impressions} />
                                                </div>

                                                {/* Weekly Charts — stacked for narrower column */}
                                                {hasWeeklyData && (
                                                    <div className="grid grid-cols-3 gap-3 mb-4">
                                                        <MiniBarChart data={platform.weekly_data.map((d) => ({ label: d.label, value: d.reach }))} colour="bg-brand-400" label="Reach" />
                                                        <MiniBarChart data={platform.weekly_data.map((d) => ({ label: d.label, value: d.engagement }))} colour="bg-lavender-400" label="Engagement" />
                                                        <MiniBarChart data={platform.weekly_data.map((d) => ({ label: d.label, value: d.impressions }))} colour="bg-sage-400" label="Impressions" />
                                                    </div>
                                                )}

                                                {/* Top Posts */}
                                                {hasTopPosts && (
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <TrendingUp className="w-3.5 h-3.5 text-brand-500" />
                                                            <p className="text-xs font-semibold text-text-primary">Top Posts</p>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            {platform.top_posts.slice(0, 5).map((post, idx) => (
                                                                <TopPostCard key={post.id} post={post} rank={idx + 1} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}

                {/* Unlinked clients */}
                {clientsWithoutData.length > 0 && selectedClient === "all" && clientsWithData.length > 0 && (
                    <Card className="bg-surface-secondary/50 border-dashed">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Link2 className="w-4 h-4 text-text-tertiary" />
                                <p className="text-sm font-medium text-text-secondary">
                                    {clientsWithoutData.length} client{clientsWithoutData.length !== 1 ? "s" : ""} not linked to Meta
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {clientsWithoutData.map((c) => (
                                    <Link key={c.client_id} href={`/clients/${c.client_id}`}>
                                        <Badge variant="outline" size="sm" className="cursor-pointer hover:bg-surface-hover transition-colors">{c.client_name}</Badge>
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Report CTA */}
                <Card className="bg-gradient-to-br from-brand-50 to-lavender-50 border-brand-200">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <h3 className="font-display font-semibold text-text-primary mb-1">Monthly Report</h3>
                            <p className="text-xs text-text-secondary max-w-md">Preview and customise a branded PDF report with analytics, top posts, and growth commentary.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="secondary" onClick={() => setReportSettingsOpen(true)}><Settings className="w-4 h-4" />Settings</Button>
                            <Link href="/analytics/report-preview"><Button size="sm"><Eye className="w-4 h-4" />Preview Report</Button></Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Report Settings Modal */}
            <ReportSettingsModal
                isOpen={reportSettingsOpen}
                onClose={() => setReportSettingsOpen(false)}
                onSettingsLoaded={setReportSettings}
            />

            {/* Hidden report renderer for PDF export */}
            <div style={{ position: "fixed", left: "-9999px", top: 0, zIndex: -1 }}>
                <AnalyticsReport
                    ref={reportRef}
                    clients={clients}
                    settings={reportSettings}
                    dateRange={dateRange}
                    selectedClient={selectedClient}
                />
            </div>
        </>
    );
}
