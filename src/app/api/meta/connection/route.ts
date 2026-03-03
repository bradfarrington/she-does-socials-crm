import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/meta/connection — check if user has a Meta connection
export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: connection } = await supabase
        .from("meta_connections")
        .select("meta_user_name, meta_user_id, connected_at, token_expires_at")
        .eq("user_id", user.id)
        .single();

    if (!connection) {
        return NextResponse.json({ connected: false });
    }

    return NextResponse.json({
        connected: true,
        ...connection,
    });
}

// DELETE /api/meta/connection — disconnect meta account
export async function DELETE() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
        .from("meta_connections")
        .delete()
        .eq("user_id", user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
