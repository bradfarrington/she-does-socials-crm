import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// PUT /api/industries/:id — update an industry
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) {
        updates.name = body.name;
        updates.slug = body.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_|_$/g, "");
    }
    if (body.colour !== undefined) updates.colour = body.colour;
    if (body.bg !== undefined) updates.bg = body.bg;

    const { data, error } = await supabase
        .from("industries")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
}

// DELETE /api/industries/:id — delete an industry
export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase
        .from("industries")
        .delete()
        .eq("id", id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
}
