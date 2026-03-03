import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// PATCH /api/clients/[id]/meta-link — link or unlink a client to a Meta page
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { meta_page_id } = body; // null to unlink

    // If linking, verify no other client is already linked to this page
    if (meta_page_id) {
        const { data: existing } = await supabase
            .from("clients")
            .select("id, business_name")
            .eq("user_id", user.id)
            .eq("meta_page_id", meta_page_id)
            .neq("id", id)
            .single();

        if (existing) {
            return NextResponse.json(
                { error: `This page is already linked to "${existing.business_name}"` },
                { status: 409 }
            );
        }
    }

    const { error } = await supabase
        .from("clients")
        .update({
            meta_page_id: meta_page_id || null,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
