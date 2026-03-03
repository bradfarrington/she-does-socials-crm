import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// PATCH /api/invoices/[id] — update an invoice
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const { data, error } = await supabase
        .from("invoices")
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id)
        .select("*, clients(id, business_name)")
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        ...data,
        client_name: data.clients?.business_name || "Unknown",
        clients: undefined,
    });
}

// DELETE /api/invoices/[id] — delete an invoice
export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
        .from("invoices")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
