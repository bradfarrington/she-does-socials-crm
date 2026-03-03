import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const API_VERSION = "v25.0";

// Debug log collector
const debugLogs: string[] = [];

interface WeeklyDataPoint {
    label: string;
    reach: number;
    engagement: number;
    impressions: number;
}

interface TopPost {
    id: string;
    message: string;
    created_time: string;
    type: string;
    image_url: string | null;
    reactions: number;
    comments: number;
    shares: number;
    views: number;
}

interface PlatformInsights {
    platform: "facebook" | "instagram";
    followers: number;
    reach: number;
    engagement: number;
    impressions: number;
    weekly_data: WeeklyDataPoint[];
    top_posts: TopPost[];
    prev_reach: number;
    prev_engagement: number;
    prev_impressions: number;
}

interface ClientAnalyticsResponse {
    client_id: string;
    client_name: string;
    logo_url: string | null;
    platforms: PlatformInsights[];
}

// Helper: safely fetch Graph API with logging
async function graphFetch<T>(url: string, label?: string): Promise<T | null> {
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.error) {
            const msg = `ERROR ${label || ""}: ${data.error.message || JSON.stringify(data.error)}`;
            console.error("[Analytics]", msg);
            debugLogs.push(msg);
            return null;
        }
        if (label) {
            const preview = JSON.stringify(data).slice(0, 200);
            console.log("[Analytics]", label + ":", preview);
            debugLogs.push(`OK ${label}: ${preview}`);
        }
        return data as T;
    } catch (err) {
        const msg = `FETCH_ERR ${label || ""}: ${err}`;
        console.error("[Analytics]", msg);
        debugLogs.push(msg);
        return null;
    }
}

// Helper: sum values from an insights metric
function sumInsightValues(
    insights: { data?: { name: string; values?: { value: number; end_time?: string }[] }[] } | null,
    metricName: string
): number {
    if (!insights?.data) return 0;
    const metric = insights.data.find((m) => m.name === metricName);
    if (!metric?.values) return 0;
    return metric.values.reduce((sum, v) => sum + (v.value || 0), 0);
}

// Helper: get daily values from an insights metric
function getDailyValues(
    insights: { data?: { name: string; values?: { value: number; end_time?: string }[] }[] } | null,
    metricName: string
): { value: number; end_time: string }[] {
    if (!insights?.data) return [];
    const metric = insights.data.find((m) => m.name === metricName);
    if (!metric?.values) return [];
    return metric.values.map((v) => ({
        value: v.value || 0,
        end_time: v.end_time || "",
    }));
}

// Helper: bucket daily values into weekly totals
function bucketIntoWeeks(dailyValues: { value: number; end_time: string }[]): { label: string; total: number }[] {
    if (dailyValues.length === 0) return [];
    const weeks: { label: string; total: number }[] = [];
    const chunkSize = 7;
    for (let i = 0; i < dailyValues.length; i += chunkSize) {
        const chunk = dailyValues.slice(i, i + chunkSize);
        const total = chunk.reduce((sum, d) => sum + d.value, 0);
        weeks.push({ label: "W" + (Math.floor(i / chunkSize) + 1), total });
    }
    return weeks;
}

// Helper: distribute engagement evenly across N weeks
function distributeEngagement(total: number, weeks: number): number[] {
    const perWeek = Math.floor(total / weeks);
    const remainder = total - perWeek * weeks;
    return Array.from({ length: weeks }, (_, i) => perWeek + (i < remainder ? 1 : 0));
}

// Helper: build date ranges (current N days + previous N days for trends)
function getDateRanges(days = 28) {
    const now = new Date();
    const until = now.toISOString().split("T")[0];
    const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const prevUntil = since;
    const prevSince = new Date(now.getTime() - days * 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    return { since, until, prevSince, prevUntil, days };
}

// GET /api/analytics/clients?days=28
export async function GET(request: Request) {
    debugLogs.length = 0; // Reset for each request
    const { searchParams } = new URL(request.url);
    const days = Math.min(Math.max(parseInt(searchParams.get("days") || "28", 10) || 28, 7), 90);
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: connection } = await supabase
        .from("meta_connections")
        .select("access_token, meta_user_name, token_expires_at")
        .eq("user_id", user.id)
        .single();

    if (!connection) {
        return NextResponse.json({ clients: [], meta_connected: false });
    }

    const { data: allClients } = await supabase
        .from("clients")
        .select("id, business_name, logo_url, meta_page_id, platforms, status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("business_name");

    if (!allClients || allClients.length === 0) {
        return NextResponse.json({ clients: [], meta_connected: true });
    }

    // Get page access tokens
    const pagesRes = await graphFetch<{
        data?: { id: string; access_token: string }[];
    }>(
        `https://graph.facebook.com/${API_VERSION}/me/accounts?fields=id,access_token&limit=100&access_token=${connection.access_token}`,
        "me/accounts"
    );

    const pageTokenMap = new Map<string, string>();
    if (pagesRes?.data) {
        for (const page of pagesRes.data) {
            pageTokenMap.set(page.id, page.access_token);
        }
    }

    // Business manager pages
    try {
        const bizRes = await graphFetch<{ data?: { id: string }[] }>(
            `https://graph.facebook.com/${API_VERSION}/me/businesses?fields=id&access_token=${connection.access_token}`
        );
        if (bizRes?.data) {
            for (const biz of bizRes.data) {
                for (const endpoint of ["owned_pages", "client_pages"]) {
                    const r = await graphFetch<{ data?: { id: string; access_token: string }[] }>(
                        `https://graph.facebook.com/${API_VERSION}/${biz.id}/${endpoint}?fields=id,access_token&limit=100&access_token=${connection.access_token}`
                    );
                    if (r?.data) {
                        for (const p of r.data) {
                            if (!pageTokenMap.has(p.id)) pageTokenMap.set(p.id, p.access_token);
                        }
                    }
                }
            }
        }
    } catch { /* Business API may not be available */ }

    console.log("[Analytics] Page tokens found:", pageTokenMap.size);

    const { since, until, prevSince, prevUntil } = getDateRanges(days);
    const results: ClientAnalyticsResponse[] = await Promise.all(
        allClients.map(async (client): Promise<ClientAnalyticsResponse> => {
            const clientResult: ClientAnalyticsResponse = {
                client_id: client.id,
                client_name: client.business_name,
                logo_url: client.logo_url,
                platforms: [],
            };

            if (!client.meta_page_id || !pageTokenMap.has(client.meta_page_id)) {
                return clientResult;
            }

            const pageToken = pageTokenMap.get(client.meta_page_id)!;
            const pageId = client.meta_page_id;
            console.log("[Analytics] Fetching for:", client.business_name, "page:", pageId);

            // --- Facebook ---
            const pageInfo = await graphFetch<{ followers_count?: number; fan_count?: number }>(
                `https://graph.facebook.com/${API_VERSION}/${pageId}?fields=followers_count,fan_count&access_token=${pageToken}`,
                client.business_name + " page info"
            );

            // Current period insights
            const insightMetrics = "page_media_view,page_total_media_view_unique";
            const pageInsights = await graphFetch<{
                data?: { name: string; values?: { value: number; end_time?: string }[] }[];
            }>(
                `https://graph.facebook.com/${API_VERSION}/${pageId}/insights?metric=${insightMetrics}&period=day&since=${since}&until=${until}&access_token=${pageToken}`,
                client.business_name + " insights current"
            );

            let fbReach = sumInsightValues(pageInsights, "page_total_media_view_unique");
            let fbImpressions = sumInsightValues(pageInsights, "page_media_view");

            // Fallback to legacy metrics
            if (fbReach === 0 && fbImpressions === 0) {
                const legacy = await graphFetch<{
                    data?: { name: string; values?: { value: number; end_time?: string }[] }[];
                }>(
                    `https://graph.facebook.com/${API_VERSION}/${pageId}/insights?metric=page_impressions_unique,page_post_engagements,page_impressions&period=day&since=${since}&until=${until}&access_token=${pageToken}`,
                    client.business_name + " insights legacy"
                );
                fbReach = sumInsightValues(legacy, "page_impressions_unique");
                fbImpressions = sumInsightValues(legacy, "page_impressions");
            }

            // Previous period insights (for trends)
            const prevInsights = await graphFetch<{
                data?: { name: string; values?: { value: number; end_time?: string }[] }[];
            }>(
                `https://graph.facebook.com/${API_VERSION}/${pageId}/insights?metric=${insightMetrics}&period=day&since=${prevSince}&until=${prevUntil}&access_token=${pageToken}`,
                client.business_name + " insights prev"
            );

            let prevFbReach = sumInsightValues(prevInsights, "page_total_media_view_unique");
            let prevFbImpressions = sumInsightValues(prevInsights, "page_media_view");

            if (prevFbReach === 0 && prevFbImpressions === 0) {
                const prevLegacy = await graphFetch<{
                    data?: { name: string; values?: { value: number; end_time?: string }[] }[];
                }>(
                    `https://graph.facebook.com/${API_VERSION}/${pageId}/insights?metric=page_impressions_unique,page_impressions&period=day&since=${prevSince}&until=${prevUntil}&access_token=${pageToken}`
                );
                prevFbReach = sumInsightValues(prevLegacy, "page_impressions_unique");
                prevFbImpressions = sumInsightValues(prevLegacy, "page_impressions");
            }

            const fbFollowers = pageInfo?.followers_count || pageInfo?.fan_count || 0;

            // Posts — engagement + top posts (only 2 attempts to conserve rate limit)
            let fbEngagement = 0;
            let prevFbEngagement = 0;
            const topPosts: TopPost[] = [];

            type FBPost = {
                id: string;
                from?: { id?: string };
                message?: string;
                created_time?: string;
                full_picture?: string;
                reactions?: { summary?: { total_count?: number } };
                comments?: { summary?: { total_count?: number } };
                shares?: { count?: number };
            };

            // Note: `type` field is deprecated in v25.0 — omitted to avoid API error
            const postFields = "id,from,message,created_time,full_picture,reactions.summary(true),comments.summary(true),shares";
            let postsData: FBPost[] = [];

            // Attempt 1: /posts (page-owned posts)
            const postsRes = await graphFetch<{ data?: FBPost[] }>(
                `https://graph.facebook.com/${API_VERSION}/${pageId}/posts?fields=${postFields}&limit=25&access_token=${pageToken}`,
                `${client.business_name} /posts`
            );
            if (postsRes?.data && postsRes.data.length > 0) {
                postsData = postsRes.data;
            } else {
                // Attempt 2: /feed filtered to page-owned
                const feedRes = await graphFetch<{ data?: FBPost[] }>(
                    `https://graph.facebook.com/${API_VERSION}/${pageId}/feed?fields=${postFields}&limit=25&access_token=${pageToken}`,
                    `${client.business_name} /feed`
                );
                if (feedRes?.data && feedRes.data.length > 0) {
                    postsData = feedRes.data.filter(p => !p.from || p.from.id === pageId);
                }
            }

            debugLogs.push(`${client.business_name} FB posts found: ${postsData.length}`);

            for (const post of postsData) {
                const reactions = post.reactions?.summary?.total_count || 0;
                const comments = post.comments?.summary?.total_count || 0;
                const shares = post.shares?.count || 0;
                const total = reactions + comments + shares;
                const postDate = post.created_time || "";

                if (postDate >= since) {
                    fbEngagement += total;
                } else {
                    prevFbEngagement += total;
                }

                topPosts.push({
                    id: post.id,
                    message: post.message || "(No caption)",
                    created_time: postDate,
                    type: "status",
                    image_url: post.full_picture || null,
                    reactions,
                    comments,
                    shares,
                    views: 0,
                });
            }
            topPosts.sort((a, b) => (b.reactions + b.comments + b.shares) - (a.reactions + a.comments + a.shares));

            // Weekly breakdown
            const reachDaily = getDailyValues(pageInsights, "page_total_media_view_unique");
            const impressionsDaily = getDailyValues(pageInsights, "page_media_view");
            const reachWeeks = bucketIntoWeeks(reachDaily);
            const impressionsWeeks = bucketIntoWeeks(impressionsDaily);
            const weekCount = Math.max(reachWeeks.length, 4);
            const engPerWeek = Math.round(fbEngagement / weekCount);

            const weeklyData: WeeklyDataPoint[] = [];
            for (let i = 0; i < Math.max(reachWeeks.length, 1); i++) {
                weeklyData.push({
                    label: reachWeeks[i]?.label || "W" + (i + 1),
                    reach: reachWeeks[i]?.total || 0,
                    engagement: engPerWeek,
                    impressions: impressionsWeeks[i]?.total || 0,
                });
            }

            clientResult.platforms.push({
                platform: "facebook",
                followers: fbFollowers,
                reach: fbReach,
                engagement: fbEngagement,
                impressions: fbImpressions,
                weekly_data: weeklyData,
                top_posts: topPosts.slice(0, 5),
                prev_reach: prevFbReach,
                prev_engagement: prevFbEngagement,
                prev_impressions: prevFbImpressions,
            });

            // --- Instagram ---
            const igAccountRes = await graphFetch<{
                instagram_business_account?: { id: string; followers_count?: number };
            }>(
                `https://graph.facebook.com/${API_VERSION}/${pageId}?fields=instagram_business_account{id,followers_count}&access_token=${pageToken}`,
                client.business_name + " IG account"
            );

            if (igAccountRes?.instagram_business_account) {
                const igId = igAccountRes.instagram_business_account.id;
                const igFollowers = igAccountRes.instagram_business_account.followers_count || 0;

                // IG totals (total_value mode — gives overall number)
                const igInsights = await graphFetch<{
                    data?: { name: string; total_value?: { value: number }; values?: { value: number; end_time?: string }[] }[];
                }>(
                    `https://graph.facebook.com/${API_VERSION}/${igId}/insights?metric=reach,views&period=day&metric_type=total_value&timeframe=last_28_days&access_token=${pageToken}`,
                    client.business_name + " IG insights"
                );

                let igReach = 0, igImpressions = 0;
                if (igInsights?.data) {
                    for (const m of igInsights.data) {
                        const val = m.total_value?.value || 0;
                        if (m.name === "reach") igReach = val;
                        if (m.name === "views") igImpressions = val;
                    }
                }

                // IG daily breakdown (separate call with period=day and date range for weekly charts)
                const igDailyInsights = await graphFetch<{
                    data?: { name: string; values?: { value: number; end_time?: string }[] }[];
                }>(
                    `https://graph.facebook.com/${API_VERSION}/${igId}/insights?metric=reach,views&period=day&since=${since}&until=${until}&access_token=${pageToken}`,
                    client.business_name + " IG daily"
                );

                // IG media for top posts + engagement
                const igMedia = await graphFetch<{
                    data?: {
                        id: string; caption?: string; timestamp?: string; media_type?: string;
                        like_count?: number; comments_count?: number; media_url?: string;
                        thumbnail_url?: string;
                    }[];
                }>(
                    `https://graph.facebook.com/${API_VERSION}/${igId}/media?fields=id,caption,timestamp,media_type,like_count,comments_count,media_url,thumbnail_url&limit=25&access_token=${pageToken}`,
                    client.business_name + " IG media"
                );

                let igEngagement = 0, prevIgEngagement = 0;
                const igTopPosts: TopPost[] = [];

                if (igMedia?.data) {
                    for (const post of igMedia.data) {
                        const likes = post.like_count || 0;
                        const comments = post.comments_count || 0;
                        const total = likes + comments;

                        if (post.timestamp && post.timestamp >= since) {
                            igEngagement += total;
                        } else {
                            prevIgEngagement += total;
                        }

                        igTopPosts.push({
                            id: post.id,
                            message: post.caption || "(No caption)",
                            created_time: post.timestamp || "",
                            type: post.media_type || "IMAGE",
                            image_url: post.media_type === "VIDEO" ? (post.thumbnail_url || null) : (post.media_url || null),
                            reactions: likes,
                            comments,
                            shares: 0,
                            views: 0,
                        });
                    }
                    igTopPosts.sort((a, b) => (b.reactions + b.comments) - (a.reactions + a.comments));
                }

                // IG weekly breakdown — use daily insights if available, fallback to splitting totals
                const igReachDaily = getDailyValues(igDailyInsights, "reach");
                const igImprDaily = getDailyValues(igDailyInsights, "views");
                const igReachWeeks = bucketIntoWeeks(igReachDaily);
                const igImprWeeks = bucketIntoWeeks(igImprDaily);

                const igWeeklyData: WeeklyDataPoint[] = [];
                const engPerWeekArr = distributeEngagement(igEngagement, Math.max(igReachWeeks.length, 4));

                if (igReachWeeks.length > 0) {
                    for (let i = 0; i < igReachWeeks.length; i++) {
                        igWeeklyData.push({
                            label: igReachWeeks[i]?.label || "W" + (i + 1),
                            reach: igReachWeeks[i]?.total || 0,
                            engagement: engPerWeekArr[i] || 0,
                            impressions: igImprWeeks[i]?.total || 0,
                        });
                    }
                } else {
                    // Fallback: split totals into 4 weeks
                    for (let i = 0; i < 4; i++) {
                        igWeeklyData.push({
                            label: "W" + (i + 1),
                            reach: Math.round(igReach / 4),
                            engagement: engPerWeekArr[i] || 0,
                            impressions: Math.round(igImpressions / 4),
                        });
                    }
                }

                clientResult.platforms.push({
                    platform: "instagram",
                    followers: igFollowers,
                    reach: igReach,
                    engagement: igEngagement,
                    impressions: igImpressions,
                    weekly_data: igWeeklyData,
                    top_posts: igTopPosts.slice(0, 5),
                    prev_reach: 0,
                    prev_engagement: prevIgEngagement,
                    prev_impressions: 0,
                });
            }

            return clientResult;
        })
    );

    return NextResponse.json({ clients: results, meta_connected: true, _debug: debugLogs });
}
