import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// POST /api/posts/[id]/publish — Sync a post to Meta Business Suite
export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Get the post with client info
    const { data: post, error: postError } = await supabase
        .from("content_posts")
        .select("*, clients(id, business_name, meta_page_id)")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (postError || !post) {
        console.error("Post not found:", postError);
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    console.log("Publishing post:", { id: post.id, platform: post.platform, client_id: post.client_id });

    const client = post.clients as { id: string; business_name: string; meta_page_id: string | null } | null;

    console.log("Client info:", { business_name: client?.business_name, meta_page_id: client?.meta_page_id });

    if (!client?.meta_page_id) {
        return NextResponse.json(
            { error: "Client is not linked to a Meta page. Connect the client to a Facebook page first." },
            { status: 400 }
        );
    }

    // 2. Get the user's Meta connection
    const { data: connection, error: connError } = await supabase
        .from("meta_connections")
        .select("access_token")
        .eq("user_id", user.id)
        .single();

    if (connError || !connection) {
        return NextResponse.json(
            { error: "No Meta account connected. Connect your Meta account in Settings." },
            { status: 400 }
        );
    }

    // 3. Get the Page Access Token from /me/accounts
    let pageAccessToken: string | null = null;
    try {
        const pagesRes = await fetch(
            `https://graph.facebook.com/v21.0/me/accounts?access_token=${connection.access_token}`
        );
        const pagesData = await pagesRes.json();
        console.log("Meta /me/accounts response:", JSON.stringify(pagesData).substring(0, 500));

        if (pagesData.error) {
            console.error("Meta /me/accounts error:", JSON.stringify(pagesData.error, null, 2));
            return NextResponse.json(
                { error: `Meta API error: ${pagesData.error.message}` },
                { status: 500 }
            );
        }

        const page = pagesData.data?.find(
            (p: { id: string }) => p.id === client.meta_page_id
        );

        if (!page) {
            return NextResponse.json(
                { error: `Page ${client.meta_page_id} not found in your Meta accounts.` },
                { status: 400 }
            );
        }

        pageAccessToken = page.access_token;
        console.log("Got page access token for page:", client.meta_page_id);
    } catch (err) {
        console.error("Failed to fetch page access token:", err);
        return NextResponse.json(
            { error: "Failed to get Meta page access token" },
            { status: 500 }
        );
    }

    if (!pageAccessToken) {
        return NextResponse.json(
            { error: "Could not obtain page access token" },
            { status: 500 }
        );
    }

    // 4. Build the post message
    const messageParts: string[] = [];
    if (post.hook) messageParts.push(post.hook);
    if (post.caption) messageParts.push(post.caption);
    if (post.cta) messageParts.push(post.cta);
    const fullMessage = messageParts.join("\n\n");

    // 5. Calculate scheduled_publish_time (Unix timestamp) if in the future
    let scheduledTime: number | null = null;
    if (post.scheduled_date) {
        const timeStr = post.scheduled_time || "09:00";
        const dateTime = new Date(`${post.scheduled_date}T${timeStr}:00`);
        const now = new Date();
        // Meta requires at least 10 minutes in the future for scheduling
        const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);

        if (dateTime > tenMinutesFromNow) {
            scheduledTime = Math.floor(dateTime.getTime() / 1000);
        }
    }

    // 6. Determine platform and publish
    let metaPostId: string | null = null;

    try {
        if (post.platform === "facebook" || post.platform === "tiktok" || post.platform === "linkedin") {
            // For non-Meta platforms, we only push to Facebook
            // For Facebook specifically, publish to the page feed

            const hasMedia = post.media_urls && post.media_urls.length > 0;

            if (hasMedia) {
                // Photo post
                const photoParams = new URLSearchParams({
                    url: post.media_urls[0],
                    access_token: pageAccessToken,
                });
                if (fullMessage) photoParams.set("caption", fullMessage);
                if (scheduledTime) {
                    photoParams.set("scheduled_publish_time", String(scheduledTime));
                    photoParams.set("published", "false");
                }

                const photoRes = await fetch(
                    `https://graph.facebook.com/v21.0/${client.meta_page_id}/photos`,
                    { method: "POST", body: photoParams }
                );
                const photoData = await photoRes.json();
                console.log("Facebook photo response:", JSON.stringify(photoData));

                if (photoData.error) {
                    return NextResponse.json(
                        { error: `Facebook API error: ${photoData.error.message}` },
                        { status: 500 }
                    );
                }
                metaPostId = photoData.id || photoData.post_id;
            } else {
                // Text-only post
                const feedParams = new URLSearchParams({
                    message: fullMessage,
                    access_token: pageAccessToken,
                });
                if (scheduledTime) {
                    feedParams.set("scheduled_publish_time", String(scheduledTime));
                    feedParams.set("published", "false");
                }

                const feedRes = await fetch(
                    `https://graph.facebook.com/v21.0/${client.meta_page_id}/feed`,
                    { method: "POST", body: feedParams }
                );
                const feedData = await feedRes.json();
                console.log("Facebook feed response:", JSON.stringify(feedData));

                if (feedData.error) {
                    return NextResponse.json(
                        { error: `Facebook API error: ${feedData.error.message}` },
                        { status: 500 }
                    );
                }
                metaPostId = feedData.id;
            }
        }

        if (post.platform === "instagram") {
            // Instagram requires a media URL — text-only is not supported
            const hasMedia = post.media_urls && post.media_urls.length > 0;

            // First get the Instagram Business Account ID from the Facebook Page
            const igRes = await fetch(
                `https://graph.facebook.com/v21.0/${client.meta_page_id}?fields=instagram_business_account&access_token=${pageAccessToken}`
            );
            const igData = await igRes.json();
            const igUserId = igData.instagram_business_account?.id;

            if (!igUserId) {
                return NextResponse.json(
                    { error: "No Instagram Business Account linked to this Facebook Page." },
                    { status: 400 }
                );
            }

            if (!hasMedia) {
                return NextResponse.json(
                    { error: "Instagram requires at least one image or video. Please add media to the post." },
                    { status: 400 }
                );
            }

            // Step 1: Create media container
            const containerParams: Record<string, string> = {
                access_token: pageAccessToken,
                caption: fullMessage,
            };

            // Determine if it's video or image based on URL extension
            const mediaUrl = post.media_urls[0];
            const isVideo = /\.(mp4|mov|avi|wmv)$/i.test(mediaUrl);

            if (isVideo) {
                containerParams.media_type = "REELS";
                containerParams.video_url = mediaUrl;
            } else {
                containerParams.image_url = mediaUrl;
            }

            if (scheduledTime) {
                // Instagram scheduling: publish_time parameter (ISO 8601)
                containerParams.is_published = "false";
            }

            const containerRes = await fetch(
                `https://graph.facebook.com/v21.0/${igUserId}/media`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(containerParams),
                }
            );
            const containerData = await containerRes.json();

            if (containerData.error) {
                return NextResponse.json(
                    { error: `Instagram API error: ${containerData.error.message}` },
                    { status: 500 }
                );
            }

            // Step 2: Publish the media container
            const publishRes = await fetch(
                `https://graph.facebook.com/v21.0/${igUserId}/media_publish`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        creation_id: containerData.id,
                        access_token: pageAccessToken,
                    }),
                }
            );
            const publishData = await publishRes.json();

            if (publishData.error) {
                return NextResponse.json(
                    { error: `Instagram publish error: ${publishData.error.message}` },
                    { status: 500 }
                );
            }

            metaPostId = publishData.id;
        }
    } catch (err) {
        console.error("Meta publishing error:", err);
        return NextResponse.json(
            { error: `Publishing failed: ${err instanceof Error ? err.message : "unknown error"}` },
            { status: 500 }
        );
    }

    // 7. Update the post record with Meta info
    const { data: updatedPost, error: updateError } = await supabase
        .from("content_posts")
        .update({
            status: "scheduled",
            meta_post_id: metaPostId,
            meta_synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*, clients(id, business_name, meta_page_id, platforms, logo_url)")
        .single();

    if (updateError) {
        return NextResponse.json(
            { error: `Post published to Meta but failed to update DB: ${updateError.message}` },
            { status: 500 }
        );
    }

    return NextResponse.json({
        success: true,
        meta_post_id: metaPostId,
        scheduled: !!scheduledTime,
        post: updatedPost,
    });
}
