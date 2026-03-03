import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface SyncPage {
    page_id: string;
    name: string;
    category?: string;
    picture_url?: string;
    status: "active" | "past";
    instagram_username?: string;
    facebook_url?: string;
}

// POST /api/meta/sync — import selected Meta pages as CRM clients
export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const pages: SyncPage[] = body.pages;

    if (!pages || !Array.isArray(pages) || pages.length === 0) {
        return NextResponse.json(
            { error: "No pages provided" },
            { status: 400 }
        );
    }

    const results = {
        created: 0,
        updated: 0,
        errors: [] as string[],
    };

    for (const page of pages) {
        try {
            // Check if a client with this meta_page_id already exists
            const { data: existing } = await supabase
                .from("clients")
                .select("id")
                .eq("user_id", user.id)
                .eq("meta_page_id", page.page_id)
                .single();

            if (existing) {
                // Update status
                const { error } = await supabase
                    .from("clients")
                    .update({
                        status: page.status,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", existing.id);

                if (error) {
                    results.errors.push(`Failed to update ${page.name}: ${error.message}`);
                } else {
                    results.updated++;
                }
            } else {
                // Create new client from Meta page
                const facebookUrl = `https://facebook.com/${page.page_id}`;
                const platforms: string[] = ["facebook"];
                if (page.instagram_username) {
                    platforms.push("instagram");
                }

                const { error } = await supabase.from("clients").insert({
                    user_id: user.id,
                    business_name: page.name,
                    contact_name: page.name,
                    contact_email: "",
                    meta_page_id: page.page_id,
                    status: page.status,
                    logo_url: page.picture_url || null,
                    facebook_url: facebookUrl,
                    instagram_handle: page.instagram_username
                        ? `@${page.instagram_username}`
                        : null,
                    platforms,
                    brand_colours: [],
                    brand_voice: [],
                    focus: [],
                    preferred_content_types: [],
                    strategy_month_1_actions: [],
                    strategy_month_2_actions: [],
                    strategy_month_3_actions: [],
                });

                if (error) {
                    results.errors.push(`Failed to create ${page.name}: ${error.message}`);
                } else {
                    results.created++;
                }
            }
        } catch (err) {
            results.errors.push(
                `Unexpected error for ${page.name}: ${err instanceof Error ? err.message : "unknown"}`
            );
        }
    }

    return NextResponse.json(results);
}

// PATCH /api/meta/sync — toggle a page on/off or change status
export async function PATCH(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { page_id, action, status, name, picture_url, instagram_username } = body;

    if (!page_id) {
        return NextResponse.json({ error: "page_id required" }, { status: 400 });
    }

    // action: "connect" | "disconnect" | "update_status"
    if (action === "disconnect") {
        // Remove meta_page_id from the client (unlink but keep the client)
        const { error } = await supabase
            .from("clients")
            .update({ meta_page_id: null, updated_at: new Date().toISOString() })
            .eq("user_id", user.id)
            .eq("meta_page_id", page_id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true, action: "disconnected" });
    }

    if (action === "connect") {
        // Check if already exists
        const { data: existing } = await supabase
            .from("clients")
            .select("id")
            .eq("user_id", user.id)
            .eq("meta_page_id", page_id)
            .single();

        if (existing) {
            // Re-link and update status
            const { error } = await supabase
                .from("clients")
                .update({ status: status || "active", updated_at: new Date().toISOString() })
                .eq("id", existing.id);

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
            return NextResponse.json({ success: true, action: "reconnected" });
        }

        // Create new
        const facebookUrl = `https://facebook.com/${page_id}`;
        const platforms: string[] = ["facebook"];
        if (instagram_username) platforms.push("instagram");

        const { error } = await supabase.from("clients").insert({
            user_id: user.id,
            business_name: name || "Unnamed Page",
            contact_name: name || "Unnamed Page",
            contact_email: "",
            meta_page_id: page_id,
            status: status || "active",
            logo_url: picture_url || null,
            facebook_url: facebookUrl,
            instagram_handle: instagram_username ? `@${instagram_username}` : null,
            platforms,
            brand_colours: [],
            brand_voice: [],
            focus: [],
            preferred_content_types: [],
            strategy_month_1_actions: [],
            strategy_month_2_actions: [],
            strategy_month_3_actions: [],
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true, action: "connected" });
    }

    if (action === "update_status") {
        const { error } = await supabase
            .from("clients")
            .update({ status: status || "active", updated_at: new Date().toISOString() })
            .eq("user_id", user.id)
            .eq("meta_page_id", page_id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true, action: "status_updated" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
