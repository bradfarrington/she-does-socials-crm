"use client";

import React, { useState, useMemo } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";
import type { Platform, ContentType } from "@/lib/types";
import {
    TrendingUp, TrendingDown, Users, Eye, Heart, BarChart3,
    Instagram, Facebook, Linkedin, Music2, ChevronLeft, ChevronRight,
    Download, FileText, ArrowUpRight, Sparkles, Target, Star,
    Image, Film, Layers, Radio,
} from "lucide-react";

// ─── Config ─────────────────────────────────────────────
const platformConfig: Record<Platform, { label: string; colour: string; bg: string; icon: React.ElementType; gradient: string }> = {
    instagram: { label: "Instagram", colour: "text-pink-600", bg: "bg-pink-50", icon: Instagram, gradient: "from-purple-500 to-pink-500" },
    facebook: { label: "Facebook", colour: "text-blue-600", bg: "bg-blue-50", icon: Facebook, gradient: "from-blue-500 to-blue-600" },
    tiktok: { label: "TikTok", colour: "text-gray-900", bg: "bg-gray-100", icon: Music2, gradient: "from-gray-800 to-black" },
    linkedin: { label: "LinkedIn", colour: "text-blue-700", bg: "bg-blue-50", icon: Linkedin, gradient: "from-blue-600 to-blue-800" },
};

const contentTypeIcons: Record<ContentType, React.ElementType> = {
    reel: Film, carousel: Layers, static_post: Image, story: Radio, live: Radio, email: FileText, blog: FileText,
};

// ─── Types ──────────────────────────────────────────────
interface ClientAnalytics {
    client_name: string;
    platforms: {
        platform: Platform;
        followers: number;
        follower_change: number;
        reach: number;
        reach_change: number;
        engagement: number;
        engagement_change: number;
        impressions: number;
        top_posts: { type: ContentType; caption: string; engagement: number; reach: number }[];
        monthly_data: { month: string; followers: number; engagement: number; reach: number }[];
    }[];
}

// ─── Demo Data ──────────────────────────────────────────
const demoAnalytics: ClientAnalytics[] = [
    {
        client_name: "Glow Studio",
        platforms: [
            {
                platform: "instagram", followers: 4820, follower_change: 12.3, reach: 18400, reach_change: 8.5, engagement: 5.2, engagement_change: 0.8, impressions: 34200,
                top_posts: [
                    { type: "reel", caption: "POV: You finally found your brow girl ✨", engagement: 847, reach: 12400 },
                    { type: "carousel", caption: "5 things to know before your first facial", engagement: 623, reach: 8900 },
                    { type: "static_post", caption: "Client transformation — before & after", engagement: 512, reach: 7200 },
                ],
                monthly_data: [
                    { month: "Oct", followers: 3980, engagement: 4.1, reach: 12000 },
                    { month: "Nov", followers: 4200, engagement: 4.5, reach: 14200 },
                    { month: "Dec", followers: 4380, engagement: 4.8, reach: 15800 },
                    { month: "Jan", followers: 4520, engagement: 5.0, reach: 16900 },
                    { month: "Feb", followers: 4680, engagement: 5.1, reach: 17600 },
                    { month: "Mar", followers: 4820, engagement: 5.2, reach: 18400 },
                ],
            },
            {
                platform: "tiktok", followers: 2340, follower_change: 28.5, reach: 45000, reach_change: 35.2, engagement: 8.7, engagement_change: 1.2, impressions: 89000,
                top_posts: [
                    { type: "reel", caption: "Get ready with me — 3 products only 💄", engagement: 2400, reach: 34000 },
                    { type: "reel", caption: "Brow lamination ASMR 🤩", engagement: 1800, reach: 28000 },
                ],
                monthly_data: [
                    { month: "Oct", followers: 1200, engagement: 6.5, reach: 18000 },
                    { month: "Nov", followers: 1480, engagement: 7.0, reach: 22000 },
                    { month: "Dec", followers: 1720, engagement: 7.5, reach: 28000 },
                    { month: "Jan", followers: 1900, engagement: 8.0, reach: 34000 },
                    { month: "Feb", followers: 2100, engagement: 8.4, reach: 39000 },
                    { month: "Mar", followers: 2340, engagement: 8.7, reach: 45000 },
                ],
            },
        ],
    },
    {
        client_name: "The Garden Kitchen",
        platforms: [
            {
                platform: "instagram", followers: 3150, follower_change: 6.8, reach: 11200, reach_change: 4.2, engagement: 4.1, engagement_change: 0.3, impressions: 22000,
                top_posts: [
                    { type: "reel", caption: "Sunday roast at The Garden Kitchen 🍖", engagement: 580, reach: 8400 },
                    { type: "carousel", caption: "Farm to fork: Meet our local suppliers 🌿", engagement: 420, reach: 6200 },
                ],
                monthly_data: [
                    { month: "Oct", followers: 2680, engagement: 3.5, reach: 8000 },
                    { month: "Nov", followers: 2800, engagement: 3.7, reach: 8800 },
                    { month: "Dec", followers: 2890, engagement: 3.8, reach: 9200 },
                    { month: "Jan", followers: 2960, engagement: 3.9, reach: 9800 },
                    { month: "Feb", followers: 3050, engagement: 4.0, reach: 10500 },
                    { month: "Mar", followers: 3150, engagement: 4.1, reach: 11200 },
                ],
            },
            {
                platform: "facebook", followers: 1890, follower_change: 2.1, reach: 6800, reach_change: -1.5, engagement: 2.8, engagement_change: -0.2, impressions: 14000,
                top_posts: [
                    { type: "static_post", caption: "This week's specials are here 🍽️", engagement: 245, reach: 3200 },
                ],
                monthly_data: [
                    { month: "Oct", followers: 1780, engagement: 3.0, reach: 7200 },
                    { month: "Nov", followers: 1810, engagement: 2.9, reach: 7000 },
                    { month: "Dec", followers: 1830, engagement: 2.9, reach: 6900 },
                    { month: "Jan", followers: 1850, engagement: 2.8, reach: 6700 },
                    { month: "Feb", followers: 1870, engagement: 2.8, reach: 6800 },
                    { month: "Mar", followers: 1890, engagement: 2.8, reach: 6800 },
                ],
            },
        ],
    },
    {
        client_name: "FitLife Academy",
        platforms: [
            {
                platform: "instagram", followers: 5680, follower_change: 9.4, reach: 21000, reach_change: 11.2, engagement: 4.8, engagement_change: 0.6, impressions: 38000,
                top_posts: [
                    { type: "reel", caption: "Stop doing crunches. Here's why. 💪", engagement: 920, reach: 14500 },
                    { type: "static_post", caption: "Spring challenge starts Monday — 6 weeks to transform", engagement: 680, reach: 9800 },
                    { type: "carousel", caption: "5 desk stretches you can do right now", engagement: 540, reach: 7600 },
                ],
                monthly_data: [
                    { month: "Oct", followers: 4600, engagement: 3.8, reach: 14000 },
                    { month: "Nov", followers: 4850, engagement: 4.0, reach: 15500 },
                    { month: "Dec", followers: 5000, engagement: 4.2, reach: 16800 },
                    { month: "Jan", followers: 5200, engagement: 4.4, reach: 18200 },
                    { month: "Feb", followers: 5420, engagement: 4.6, reach: 19500 },
                    { month: "Mar", followers: 5680, engagement: 4.8, reach: 21000 },
                ],
            },
            {
                platform: "linkedin", followers: 1240, follower_change: 15.2, reach: 8900, reach_change: 22.0, engagement: 3.4, engagement_change: 0.9, impressions: 16000,
                top_posts: [
                    { type: "static_post", caption: "Why corporate wellness isn't a perk — it's a strategy", engagement: 380, reach: 5200 },
                ],
                monthly_data: [
                    { month: "Oct", followers: 890, engagement: 2.2, reach: 4000 },
                    { month: "Nov", followers: 940, engagement: 2.4, reach: 4800 },
                    { month: "Dec", followers: 1000, engagement: 2.6, reach: 5500 },
                    { month: "Jan", followers: 1060, engagement: 2.8, reach: 6200 },
                    { month: "Feb", followers: 1140, engagement: 3.1, reach: 7400 },
                    { month: "Mar", followers: 1240, engagement: 3.4, reach: 8900 },
                ],
            },
        ],
    },
];

// ─── Mini Bar Chart ─────────────────────────────────────
function MiniBarChart({ data, colour, label }: { data: { month: string; value: number }[]; colour: string; label: string }) {
    const max = Math.max(...data.map((d) => d.value));
    return (
        <div className="space-y-1.5">
            <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wide">{label}</p>
            <div className="flex items-end gap-1 h-16">
                {data.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                        <div className={cn("w-full rounded-t-sm transition-all", colour)} style={{ height: `${Math.max(4, (d.value / max) * 56)}px` }} />
                        <span className="text-[8px] text-text-tertiary">{d.month}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Stat Pill ──────────────────────────────────────────
function StatPill({ label, value, change, icon: Icon, format }: { label: string; value: number; change: number; icon: React.ElementType; format?: "percent" | "number" }) {
    const isPositive = change >= 0;
    const formatted = format === "percent" ? `${value.toFixed(1)}%` : value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString();
    return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border hover:shadow-card-hover transition-all">
            <div className="p-2 rounded-lg bg-surface-secondary"><Icon className="w-4 h-4 text-text-secondary" /></div>
            <div className="flex-1 min-w-0">
                <p className="text-lg font-display font-bold text-text-primary">{formatted}</p>
                <p className="text-[10px] text-text-tertiary font-medium">{label}</p>
            </div>
            <Badge size="sm" className={cn(isPositive ? "bg-sage-50 text-sage-600" : "bg-rose-50 text-rose-600")}>
                {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                {isPositive ? "+" : ""}{change.toFixed(1)}%
            </Badge>
        </div>
    );
}

// ─── Main Page ──────────────────────────────────────────
export default function AnalyticsPage() {
    const [selectedClient, setSelectedClient] = useState<string>("all");
    const clients = demoAnalytics.map((c) => c.client_name);

    const displayData = useMemo(() => {
        if (selectedClient === "all") return demoAnalytics;
        return demoAnalytics.filter((c) => c.client_name === selectedClient);
    }, [selectedClient]);

    // Aggregate totals
    const totals = useMemo(() => {
        let followers = 0, reach = 0, engagement = 0, impressions = 0;
        let followerChanges: number[] = [], engagementChanges: number[] = [];
        displayData.forEach((c) => c.platforms.forEach((p) => {
            followers += p.followers; reach += p.reach; impressions += p.impressions;
            followerChanges.push(p.follower_change); engagementChanges.push(p.engagement_change);
            engagement += p.engagement;
        }));
        const platformCount = displayData.reduce((s, c) => s + c.platforms.length, 0);
        return {
            followers, reach, impressions,
            avgEngagement: platformCount > 0 ? engagement / platformCount : 0,
            followerChange: followerChanges.length > 0 ? followerChanges.reduce((a, b) => a + b, 0) / followerChanges.length : 0,
            engagementChange: engagementChanges.length > 0 ? engagementChanges.reduce((a, b) => a + b, 0) / engagementChanges.length : 0,
        };
    }, [displayData]);

    return (
        <>
            <Header title="Analytics" subtitle={`Performance across ${displayData.length} client${displayData.length !== 1 ? "s" : ""}`}
                actions={<Button size="sm" variant="secondary"><Download className="w-4 h-4" />Export Report</Button>}
            />
            <div className="p-6 space-y-6 animate-fade-in">
                {/* Client Filter */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    <button onClick={() => setSelectedClient("all")} className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap", selectedClient === "all" ? "bg-text-primary text-white" : "bg-surface border border-border text-text-secondary hover:bg-surface-hover")}>All Clients</button>
                    {clients.map((c) => (
                        <button key={c} onClick={() => setSelectedClient(c)} className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap", selectedClient === c ? "bg-brand-50 text-brand-700" : "bg-surface border border-border text-text-secondary hover:bg-surface-hover")}>{c}</button>
                    ))}
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatPill label="Total Followers" value={totals.followers} change={totals.followerChange} icon={Users} />
                    <StatPill label="Total Reach" value={totals.reach} change={8.5} icon={Eye} />
                    <StatPill label="Avg. Engagement" value={totals.avgEngagement} change={totals.engagementChange} icon={Heart} format="percent" />
                    <StatPill label="Impressions" value={totals.impressions} change={12.4} icon={BarChart3} />
                </div>

                {/* Per-Client Sections */}
                {displayData.map((client) => (
                    <div key={client.client_name} className="space-y-4">
                        <div className="flex items-center gap-2">
                            <h2 className="font-display font-semibold text-lg text-text-primary">{client.client_name}</h2>
                            <Badge variant="outline" size="sm">{client.platforms.length} platform{client.platforms.length !== 1 ? "s" : ""}</Badge>
                        </div>

                        {client.platforms.map((platform) => {
                            const config = platformConfig[platform.platform];
                            const PlatformIcon = config.icon;
                            return (
                                <Card key={platform.platform} className="animate-fade-in overflow-hidden">
                                    <div className={cn("h-1.5 bg-gradient-to-r", config.gradient)} />
                                    <CardContent className="p-5">
                                        <div className="flex items-center gap-2.5 mb-4">
                                            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-white bg-gradient-to-br", config.gradient)}>
                                                <PlatformIcon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-text-primary">{config.label}</h3>
                                                <p className="text-[10px] text-text-tertiary">Last 6 months performance</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                                            <StatPill label="Followers" value={platform.followers} change={platform.follower_change} icon={Users} />
                                            <StatPill label="Reach" value={platform.reach} change={platform.reach_change} icon={Eye} />
                                            <StatPill label="Engagement" value={platform.engagement} change={platform.engagement_change} icon={Heart} format="percent" />
                                            <StatPill label="Impressions" value={platform.impressions} change={0} icon={BarChart3} />
                                        </div>

                                        {/* Charts */}
                                        <div className="grid grid-cols-3 gap-4 mb-5">
                                            <MiniBarChart data={platform.monthly_data.map((d) => ({ month: d.month, value: d.followers }))} colour="bg-brand-400" label="Follower Growth" />
                                            <MiniBarChart data={platform.monthly_data.map((d) => ({ month: d.month, value: d.reach }))} colour="bg-lavender-400" label="Reach" />
                                            <MiniBarChart data={platform.monthly_data.map((d) => ({ month: d.month, value: d.engagement * 100 }))} colour="bg-sage-400" label="Engagement %" />
                                        </div>

                                        {/* Top Posts */}
                                        {platform.top_posts.length > 0 && (
                                            <div>
                                                <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wide mb-2">Top Posts</p>
                                                <div className="space-y-2">
                                                    {platform.top_posts.map((post, i) => {
                                                        const TypeIcon = contentTypeIcons[post.type];
                                                        return (
                                                            <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-secondary/50 hover:bg-surface-hover transition-colors">
                                                                <div className="w-7 h-7 rounded-lg bg-surface flex items-center justify-center border border-border">
                                                                    <TypeIcon className="w-3.5 h-3.5 text-text-tertiary" />
                                                                </div>
                                                                <span className="text-xs text-text-primary flex-1 truncate">{post.caption}</span>
                                                                <div className="flex items-center gap-3 text-[10px] text-text-tertiary">
                                                                    <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-rose-400" />{post.engagement.toLocaleString()}</span>
                                                                    <span className="flex items-center gap-1"><Eye className="w-3 h-3 text-blue-400" />{post.reach.toLocaleString()}</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ))}

                {/* Report CTA */}
                <Card className="bg-gradient-to-br from-brand-50 to-lavender-50 border-brand-200">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <h3 className="font-display font-semibold text-text-primary mb-1">Monthly Report</h3>
                            <p className="text-xs text-text-secondary max-w-md">Generate a branded PDF report with all analytics, top posts, and growth commentary for your clients.</p>
                        </div>
                        <Button size="sm"><FileText className="w-4 h-4" />Generate Report</Button>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
