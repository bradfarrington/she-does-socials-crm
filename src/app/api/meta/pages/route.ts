import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/meta/pages — fetch all pages the connected user has access to
export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the stored Meta connection
    const { data: connection, error: connError } = await supabase
        .from("meta_connections")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (connError || !connection) {
        return NextResponse.json(
            { error: "No Meta account connected" },
            { status: 400 }
        );
    }

    try {
        const fields = "id,name,category,picture{url},followers_count,fan_count,instagram_business_account{id,name,username,profile_picture_url,followers_count}";
        const pageMap = new Map<string, Record<string, unknown>>();

        // 1. Fetch pages via /me/accounts (direct page roles)
        let nextUrl: string | null =
            `https://graph.facebook.com/v25.0/me/accounts?fields=${encodeURIComponent(fields)}&limit=100&access_token=${connection.access_token}`;

        while (nextUrl) {
            const res: Response = await fetch(nextUrl);
            const data: { error?: { message?: string }; data?: Record<string, unknown>[]; paging?: { next?: string } } = await res.json();

            if (data.error) {
                console.error("Graph API error (me/accounts):", data.error);
                break; // Don't fail entirely, try other sources
            }

            if (data.data) {
                for (const page of data.data) {
                    pageMap.set(page.id as string, page);
                }
            }

            nextUrl = data.paging?.next || null;
        }

        // 2. Fetch pages via Business accounts (Business Manager access)
        try {
            const bizRes: Response = await fetch(
                `https://graph.facebook.com/v25.0/me/businesses?fields=id,name&access_token=${connection.access_token}`
            );
            const bizData: { data?: { id: string; name: string }[]; error?: { message?: string } } = await bizRes.json();

            if (bizData.data && bizData.data.length > 0) {
                for (const biz of bizData.data) {
                    // Fetch owned pages
                    const ownedRes: Response = await fetch(
                        `https://graph.facebook.com/v25.0/${biz.id}/owned_pages?fields=${encodeURIComponent(fields)}&limit=100&access_token=${connection.access_token}`
                    );
                    const ownedData: { data?: Record<string, unknown>[]; error?: { message?: string } } = await ownedRes.json();

                    if (ownedData.data) {
                        for (const page of ownedData.data) {
                            if (!pageMap.has(page.id as string)) {
                                pageMap.set(page.id as string, page);
                            }
                        }
                    }

                    // Fetch client pages (pages managed for other businesses)
                    const clientRes: Response = await fetch(
                        `https://graph.facebook.com/v25.0/${biz.id}/client_pages?fields=${encodeURIComponent(fields)}&limit=100&access_token=${connection.access_token}`
                    );
                    const clientData: { data?: Record<string, unknown>[]; error?: { message?: string } } = await clientRes.json();

                    if (clientData.data) {
                        for (const page of clientData.data) {
                            if (!pageMap.has(page.id as string)) {
                                pageMap.set(page.id as string, page);
                            }
                        }
                    }
                }
            }
        } catch (bizErr) {
            // Business API access may not be available — that's OK, continue with direct pages
            console.log("[Meta Pages] Business API not available, skipping:", bizErr);
        }

        const allPages = Array.from(pageMap.values());
        console.log(`[Meta Pages] Total unique pages found: ${allPages.length}`, allPages.map((p) => ({ id: p.id, name: p.name })));

        // Also get existing clients with meta_page_id to show sync status
        const { data: existingClients } = await supabase
            .from("clients")
            .select("meta_page_id, status, business_name")
            .eq("user_id", user.id)
            .not("meta_page_id", "is", null);

        const syncedPageIds = new Set(
            (existingClients || []).map((c: { meta_page_id: string }) => c.meta_page_id)
        );

        // Format the response
        const pages = allPages.map((page: Record<string, unknown>) => {
            const picture = page.picture as { data?: { url?: string } } | undefined;
            const igAccount = page.instagram_business_account as Record<string, unknown> | undefined;
            const existingClient = (existingClients || []).find(
                (c: { meta_page_id: string }) => c.meta_page_id === page.id
            );

            return {
                id: page.id,
                name: page.name,
                category: page.category,
                picture_url: picture?.data?.url || null,
                followers_count: page.followers_count || page.fan_count || 0,
                instagram: igAccount
                    ? {
                        id: igAccount.id,
                        username: igAccount.username,
                        name: igAccount.name,
                        profile_picture_url: igAccount.profile_picture_url,
                        followers_count: igAccount.followers_count,
                    }
                    : null,
                already_synced: syncedPageIds.has(page.id as string),
                existing_status: existingClient
                    ? (existingClient as { status: string }).status
                    : null,
            };
        });

        return NextResponse.json({
            pages,
            connection: {
                meta_user_name: connection.meta_user_name,
                connected_at: connection.connected_at,
                token_expires_at: connection.token_expires_at,
            },
        });
    } catch (err) {
        console.error("Failed to fetch Meta pages:", err);
        return NextResponse.json(
            { error: "Failed to fetch pages from Meta" },
            { status: 500 }
        );
    }
}
