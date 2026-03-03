import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const DEFAULTS = {
    company_name: "She Does Socials",
    logo_url: "",
    accent_color: "#f472b6",
    header_text: "Monthly Performance Report",
    footer_text: "Prepared by She Does Socials",
    show_overview: true,
    show_platform_breakdown: true,
    show_weekly_charts: true,
    show_top_posts: true,
};

// GET — fetch report settings for the authenticated user
export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data } = await supabase
        .from("report_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

    return NextResponse.json({ settings: data || { ...DEFAULTS, user_id: user.id } });
}

// PUT — upsert report settings
export async function PUT(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const settings = {
        user_id: user.id,
        company_name: body.company_name ?? DEFAULTS.company_name,
        logo_url: body.logo_url ?? DEFAULTS.logo_url,
        accent_color: body.accent_color ?? DEFAULTS.accent_color,
        header_text: body.header_text ?? DEFAULTS.header_text,
        footer_text: body.footer_text ?? DEFAULTS.footer_text,
        show_overview: body.show_overview ?? DEFAULTS.show_overview,
        show_platform_breakdown: body.show_platform_breakdown ?? DEFAULTS.show_platform_breakdown,
        show_weekly_charts: body.show_weekly_charts ?? DEFAULTS.show_weekly_charts,
        show_top_posts: body.show_top_posts ?? DEFAULTS.show_top_posts,
        updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
        .from("report_settings")
        .upsert(settings, { onConflict: "user_id" })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ settings: data });
}
