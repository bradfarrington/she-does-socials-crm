"use client";

import React, { forwardRef } from "react";
import type { ReportSettings } from "./report-settings-modal";

// ─── Types (mirrored from analytics page) ───────────────
interface WeeklyDataPoint { label: string; reach: number; engagement: number; impressions: number }
interface TopPost { id: string; message: string; created_time: string; type: string; image_url: string | null; reactions: number; comments: number; shares: number; views: number }
interface PlatformInsights { platform: "facebook" | "instagram"; followers: number; reach: number; engagement: number; impressions: number; weekly_data: WeeklyDataPoint[]; top_posts: TopPost[]; prev_reach: number; prev_engagement: number; prev_impressions: number }
export interface ClientAnalytics { client_id: string; client_name: string; logo_url: string | null; platforms: PlatformInsights[] }

// ─── Helpers ────────────────────────────────────────────
function formatNum(value: number): string {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return value.toString();
}

function formatDate(dateStr: string): string {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function trendArrow(current: number, previous: number): string {
    if (previous === 0 && current === 0) return "";
    if (previous === 0) return " ↑100%";
    const pct = ((current - previous) / previous) * 100;
    return ` ${pct >= 0 ? "↑" : "↓"}${Math.abs(pct).toFixed(0)}%`;
}

function trendColor(trend: string): string {
    if (trend.includes("↑")) return "#10b981";
    if (trend.includes("↓")) return "#ef4444";
    return "#8b8ba0";
}

const platformLabels: Record<string, string> = {
    facebook: "Facebook",
    instagram: "Instagram",
    tiktok: "TikTok",
    linkedin: "LinkedIn",
};

const platformColors: Record<string, string> = {
    facebook: "#1877F2",
    instagram: "#E1306C",
    tiktok: "#000000",
    linkedin: "#0A66C2",
};

// ─── Stat Box ───────────────────────────────────────────
function StatBox({ label, value, trend, width }: { label: string; value: number; trend?: string; width?: string }) {
    return (
        <div style={{ width: width || "25%", padding: "14px 16px", borderRadius: "10px", border: "1px solid #e8e8f0", background: "#fafafe", boxSizing: "border-box" as const }}>
            <div style={{ fontSize: "22px", fontWeight: 700, lineHeight: "28px", color: "#1a1a2e" }}>
                {formatNum(value)}
                {trend && (
                    <span style={{ fontSize: "11px", fontWeight: 600, color: trendColor(trend), marginLeft: "6px" }}>
                        {trend}
                    </span>
                )}
            </div>
            <div style={{ fontSize: "11px", color: "#8b8ba0", lineHeight: "14px", marginTop: "4px", fontWeight: 500 }}>{label}</div>
        </div>
    );
}

function PlatformStatBox({ label, value, trend }: { label: string; value: number; trend?: string }) {
    return (
        <div style={{ width: "25%", padding: "12px 14px", borderRadius: "8px", background: "#fafafe", border: "1px solid #f0f0f5", boxSizing: "border-box" as const }}>
            <div style={{ fontSize: "18px", fontWeight: 700, lineHeight: "22px", color: "#1a1a2e" }}>
                {formatNum(value)}
                {trend && (
                    <span style={{ fontSize: "10px", fontWeight: 600, color: trendColor(trend), marginLeft: "4px" }}>
                        {trend}
                    </span>
                )}
            </div>
            <div style={{ fontSize: "10px", color: "#8b8ba0", lineHeight: "13px", marginTop: "2px" }}>{label}</div>
        </div>
    );
}

function BarChart({ data, color, label, total }: { data: number[]; color: string; label: string; total: number }) {
    const max = Math.max(...data, 1);
    return (
        <div style={{ width: "33.333%", padding: "12px 14px", borderRadius: "8px", background: "#fafafe", border: "1px solid #f0f0f5", boxSizing: "border-box" as const }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "#64648a", textTransform: "capitalize" as const, lineHeight: "13px" }}>{label}</span>
                <span style={{ fontSize: "10px", fontWeight: 600, color: "#8b8ba0", lineHeight: "13px" }}>{formatNum(total)}</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "52px" }}>
                {data.map((v, i) => (
                    <div
                        key={i}
                        style={{
                            flex: 1,
                            height: `${Math.max(4, (v / max) * 48)}px`,
                            background: color,
                            borderRadius: "3px 3px 0 0",
                            opacity: 0.7 + (i * 0.06),
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

// ─── Report Component ───────────────────────────────────
interface AnalyticsReportProps {
    clients: ClientAnalytics[];
    settings: ReportSettings;
    dateRange: number;
    selectedClient: string;
}

export const AnalyticsReport = forwardRef<HTMLDivElement, AnalyticsReportProps>(
    function AnalyticsReport({ clients, settings, dateRange, selectedClient }, ref) {
        const displayData = selectedClient === "all" ? clients : clients.filter((c) => c.client_id === selectedClient);
        const clientsWithData = displayData.filter((c) => c.platforms.length > 0);

        let totalFollowers = 0, totalReach = 0, totalEngagement = 0, totalImpressions = 0;
        let prevReach = 0, prevEngagement = 0, prevImpressions = 0;
        displayData.forEach((c) => c.platforms.forEach((p) => {
            totalFollowers += p.followers;
            totalReach += p.reach;
            totalEngagement += p.engagement;
            totalImpressions += p.impressions;
            prevReach += p.prev_reach;
            prevEngagement += p.prev_engagement;
            prevImpressions += p.prev_impressions;
        }));

        const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
        const clientName = selectedClient !== "all" && displayData.length === 1 ? displayData[0].client_name : "All Clients";

        const sectionHeading: React.CSSProperties = {
            fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.08em", color: "#8b8ba0", lineHeight: "14px", marginBottom: "14px",
        };

        return (
            <div ref={ref} style={{ width: "794px", fontFamily: "'Inter', 'Segoe UI', sans-serif", background: "#ffffff", color: "#1a1a2e" }}>

                {/* ═══ HEADER ═══ */}
                <div style={{ padding: "40px 48px 28px", borderBottom: `4px solid ${settings.accent_color}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            {settings.logo_url ? (
                                <img src={settings.logo_url} alt="" style={{ height: "42px", display: "block", marginBottom: "8px" }} crossOrigin="anonymous" />
                            ) : (
                                <div style={{ fontSize: "22px", fontWeight: 700, color: settings.accent_color, lineHeight: "28px", marginBottom: "6px" }}>
                                    {settings.company_name}
                                </div>
                            )}
                            <div style={{ fontSize: "13px", color: "#64648a", fontWeight: 500, lineHeight: "16px" }}>{clientName}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a2e", lineHeight: "26px" }}>{settings.header_text}</div>
                            <div style={{ fontSize: "12px", color: "#8b8ba0", lineHeight: "16px", marginTop: "4px" }}>
                                Last {dateRange} days • Generated {today}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══ OVERVIEW STATS ═══ */}
                {settings.show_overview && (
                    <div style={{ padding: "28px 48px" }}>
                        <div style={sectionHeading}>Performance Overview</div>
                        <div style={{ display: "flex", gap: "12px" }}>
                            <StatBox label="Total Followers" value={totalFollowers} />
                            <StatBox label="Reach" value={totalReach} trend={trendArrow(totalReach, prevReach)} />
                            <StatBox label="Engagement" value={totalEngagement} trend={trendArrow(totalEngagement, prevEngagement)} />
                            <StatBox label="Impressions" value={totalImpressions} trend={trendArrow(totalImpressions, prevImpressions)} />
                        </div>
                    </div>
                )}

                {/* ═══ PLATFORM BREAKDOWN ═══ */}
                {settings.show_platform_breakdown && clientsWithData.map((client) => (
                    <div key={client.client_id} style={{ padding: "0 48px 20px" }}>
                        {displayData.length > 1 && (
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px", paddingTop: "4px" }}>
                                {client.logo_url && <img src={client.logo_url} alt="" style={{ width: "22px", height: "22px", borderRadius: "6px", objectFit: "cover" }} crossOrigin="anonymous" />}
                                <span style={{ fontSize: "15px", fontWeight: 700, lineHeight: "20px" }}>{client.client_name}</span>
                            </div>
                        )}

                        {client.platforms.map((platform) => {
                            const pColor = platformColors[platform.platform] || "#6366f1";
                            const engRate = platform.reach > 0 ? ((platform.engagement / platform.reach) * 100).toFixed(1) : "0.0";

                            return (
                                <div key={platform.platform} style={{ border: "1px solid #e8e8f0", borderRadius: "14px", overflow: "hidden", marginBottom: "16px" }}>
                                    <div style={{ height: "5px", background: pColor }} />
                                    <div style={{ padding: "18px 22px" }}>
                                        {/* Platform header */}
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <div style={{
                                                    width: "30px", height: "30px", borderRadius: "8px",
                                                    background: pColor, display: "flex", alignItems: "center",
                                                    justifyContent: "center", color: "#fff",
                                                    fontSize: "13px", fontWeight: 700, lineHeight: "30px",
                                                    textAlign: "center",
                                                }}>
                                                    {platformLabels[platform.platform]?.[0] || "?"}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: "15px", fontWeight: 700, lineHeight: "20px" }}>{platformLabels[platform.platform]}</div>
                                                    <div style={{ fontSize: "10px", color: "#8b8ba0", lineHeight: "13px", marginTop: "1px" }}>Last {dateRange} days</div>
                                                </div>
                                            </div>
                                            {platform.engagement > 0 && platform.reach > 0 && (
                                                <div style={{ padding: "5px 12px", borderRadius: "8px", background: "#fafafe", border: "1px solid #e8e8f0", fontSize: "12px", lineHeight: "16px" }}>
                                                    <span style={{ fontWeight: 700 }}>{engRate}%</span>
                                                    <span style={{ color: "#8b8ba0", marginLeft: "5px" }}>engagement rate</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Stats row */}
                                        <div style={{ display: "flex", gap: "10px", marginBottom: settings.show_weekly_charts && platform.weekly_data?.length > 0 ? "18px" : "0" }}>
                                            <PlatformStatBox label="Followers" value={platform.followers} />
                                            <PlatformStatBox label="Reach" value={platform.reach} trend={trendArrow(platform.reach, platform.prev_reach)} />
                                            <PlatformStatBox label="Engagement" value={platform.engagement} trend={trendArrow(platform.engagement, platform.prev_engagement)} />
                                            <PlatformStatBox label="Impressions" value={platform.impressions} trend={trendArrow(platform.impressions, platform.prev_impressions)} />
                                        </div>

                                        {/* Weekly Charts */}
                                        {settings.show_weekly_charts && platform.weekly_data?.length > 0 && (
                                            <div>
                                                <div style={{ ...sectionHeading, fontSize: "10px" }}>Weekly Performance</div>
                                                <div style={{ display: "flex", gap: "12px" }}>
                                                    {(["reach", "engagement", "impressions"] as const).map((metric) => {
                                                        const values = platform.weekly_data.map((d) => d[metric]);
                                                        const colors: Record<string, string> = { reach: pColor, engagement: "#a78bfa", impressions: "#34d399" };
                                                        return (
                                                            <BarChart
                                                                key={metric}
                                                                data={values}
                                                                color={colors[metric]}
                                                                label={metric}
                                                                total={values.reduce((a, b) => a + b, 0)}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}

                {/* ═══ TOP POSTS ═══ */}
                {settings.show_top_posts && clientsWithData.map((client) => {
                    const allPosts = client.platforms.flatMap((p) =>
                        p.top_posts.map((post) => ({ ...post, platform: p.platform }))
                    );
                    allPosts.sort((a, b) => (b.reactions + b.comments + b.shares) - (a.reactions + a.comments + a.shares));
                    const topPosts = allPosts.slice(0, 5);
                    if (topPosts.length === 0) return null;

                    return (
                        <div key={`top-${client.client_id}`} style={{ padding: "8px 48px 24px" }}>
                            <div style={sectionHeading}>
                                Top Performing Posts{displayData.length > 1 ? ` — ${client.client_name}` : ""}
                            </div>
                            <div style={{ border: "1px solid #e8e8f0", borderRadius: "12px", overflow: "hidden" }}>
                                {topPosts.map((post, idx) => (
                                    <div
                                        key={post.id}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                            padding: "10px 16px",
                                            borderBottom: idx < topPosts.length - 1 ? "1px solid #f0f0f5" : "none",
                                            background: idx % 2 === 0 ? "#fafafe" : "#fff",
                                        }}
                                    >
                                        <div style={{
                                            width: "22px", height: "22px", borderRadius: "50%",
                                            background: settings.accent_color + "20", color: settings.accent_color,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: "10px", fontWeight: 700, lineHeight: "22px",
                                            flexShrink: 0,
                                        }}>
                                            {idx + 1}
                                        </div>
                                        {post.image_url && (
                                            <img src={post.image_url} alt="" style={{ width: "38px", height: "38px", borderRadius: "6px", objectFit: "cover", flexShrink: 0, border: "1px solid #e8e8f0" }} crossOrigin="anonymous" />
                                        )}
                                        <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                                            <div style={{ fontSize: "11px", color: "#1a1a2e", lineHeight: "15px", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {post.message}
                                            </div>
                                            <div style={{ display: "flex", gap: "12px", marginTop: "2px", fontSize: "10px", color: "#8b8ba0", lineHeight: "13px" }}>
                                                <span>❤ {post.reactions.toLocaleString()}</span>
                                                <span>💬 {post.comments.toLocaleString()}</span>
                                                {post.shares > 0 && <span>↗ {post.shares.toLocaleString()}</span>}
                                                <span style={{ marginLeft: "auto" }}>{formatDate(post.created_time)}</span>
                                            </div>
                                        </div>
                                        <div style={{
                                            padding: "3px 8px", borderRadius: "6px",
                                            background: platformColors[post.platform] + "15",
                                            color: platformColors[post.platform],
                                            fontSize: "9px", fontWeight: 600, lineHeight: "12px",
                                            flexShrink: 0,
                                        }}>
                                            {platformLabels[post.platform]}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {/* ═══ FOOTER ═══ */}
                {settings.footer_text && (
                    <div style={{ padding: "20px 48px", borderTop: `2px solid ${settings.accent_color}30`, textAlign: "center", marginTop: "8px" }}>
                        <div style={{ fontSize: "11px", color: "#8b8ba0", lineHeight: "14px" }}>{settings.footer_text}</div>
                    </div>
                )}
            </div>
        );
    }
);

// ─── PDF Generation via window.print() ──────────────────
// Uses the browser's native rendering engine so what you see
// on screen is EXACTLY what appears in the PDF. No html2canvas.
export async function generateAnalyticsPdf(element: HTMLElement, clientName: string): Promise<void> {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
        alert("Please allow pop-ups to export the PDF.");
        return;
    }

    // Grab the rendered HTML from the report element
    const reportHtml = element.outerHTML;

    // Build the print document with embedded styles
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <title>Analytics Report — ${clientName}</title>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    color-adjust: exact !important;
                }
                body {
                    font-family: 'Inter', 'Segoe UI', sans-serif;
                    background: #ffffff;
                    display: flex;
                    justify-content: center;
                    padding: 0;
                }
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        padding: 0;
                    }
                }
                img {
                    display: inline-block;
                }
            </style>
        </head>
        <body>
            ${reportHtml}
        </body>
        </html>
    `);
    printWindow.document.close();

    // Wait for fonts and images to load, then print
    printWindow.onload = () => {
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    // Fallback if onload doesn't fire
    setTimeout(() => {
        if (!printWindow.closed) {
            printWindow.print();
        }
    }, 2000);
}
