import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/clients — list all clients for the authenticated user
export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
        .from("clients")
        .select("*, industries(id, name, slug, colour, bg), packages(id, name, type, price)")
        .eq("user_id", user.id)
        .eq("is_archived", false)
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
}

// POST /api/clients — create a new client
export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const { data, error } = await supabase
        .from("clients")
        .insert({
            user_id: user.id,
            business_name: body.business_name,
            contact_name: body.contact_name,
            contact_email: body.contact_email,
            contact_phone: body.contact_phone || null,
            website: body.website || null,
            industry_id: body.industry_id || null,
            package_id: body.package_id || null,
            location: body.location || null,
            location_type: body.location_type || null,
            is_priority: body.is_priority || false,
            // Branding
            brand_colours: body.brand_colours || [],
            brand_voice: body.brand_voice || [],
            words_love: body.words_love || null,
            words_avoid: body.words_avoid || null,
            // Social
            platforms: body.platforms || [],
            posting_frequency: body.posting_frequency || null,
            // Goals
            success_definition: body.success_definition || null,
            focus: body.focus || [],
            short_term_campaigns: body.short_term_campaigns || null,
            long_term_vision: body.long_term_vision || null,
            comfortable_on_camera: body.comfortable_on_camera || null,
            preferred_content_types: body.preferred_content_types || [],
            content_boundaries: body.content_boundaries || null,
            // Contact: social handles
            instagram_handle: body.instagram_handle || null,
            facebook_url: body.facebook_url || null,
            tiktok_handle: body.tiktok_handle || null,
            linkedin_url: body.linkedin_url || null,
            // Business Info: expanded
            business_description: body.business_description || null,
            target_audience: body.target_audience || null,
            usp: body.usp || null,
            // Content wants & needs
            content_looking_for: body.content_looking_for || null,
            content_not_working: body.content_not_working || null,
            content_themes: body.content_themes || null,
            // 3 Month Strategy
            strategy_month_1_goal: body.strategy_month_1_goal || null,
            strategy_month_1_actions: body.strategy_month_1_actions || [],
            strategy_month_2_goal: body.strategy_month_2_goal || null,
            strategy_month_2_actions: body.strategy_month_2_actions || [],
            strategy_month_3_goal: body.strategy_month_3_goal || null,
            strategy_month_3_actions: body.strategy_month_3_actions || [],
        })
        .select("*, industries(id, name, slug, colour, bg), packages(id, name, type, price)")
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 201 });
}
