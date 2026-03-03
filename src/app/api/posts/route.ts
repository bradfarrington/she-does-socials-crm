import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/posts — list all posts for the authenticated user
export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clientId = request.nextUrl.searchParams.get("client_id");

    let query = supabase
        .from("content_posts")
        .select("*, clients(id, business_name, meta_page_id, platforms, logo_url)")
        .eq("user_id", user.id)
        .order("scheduled_date", { ascending: true, nullsFirst: false });

    if (clientId) {
        query = query.eq("client_id", clientId);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

// POST /api/posts — create a new content post
export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const { data, error } = await supabase
        .from("content_posts")
        .insert({
            user_id: user.id,
            client_id: body.client_id,
            platform: body.platform,
            content_type: body.content_type,
            status: body.status || "drafted",
            purpose: body.purpose || null,
            scheduled_date: body.scheduled_date || null,
            scheduled_time: body.scheduled_time || "09:00",
            caption: body.caption || null,
            hook: body.hook || null,
            cta: body.cta || null,
            notes: body.notes || null,
            media_urls: body.media_urls || [],
        })
        .select("*, clients(id, business_name, meta_page_id, platforms, logo_url)")
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
}
