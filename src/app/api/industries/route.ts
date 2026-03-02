import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/industries — list all industries
export async function GET() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("industries")
        .select("*")
        .order("sort_order", { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
}

// POST /api/industries — create a new industry
export async function POST(request: Request) {
    const supabase = await createClient();
    const body = await request.json();

    const slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");

    // Get the next sort_order
    const { data: maxRow } = await supabase
        .from("industries")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1)
        .single();

    const nextOrder = (maxRow?.sort_order ?? 0) + 1;

    const { data, error } = await supabase
        .from("industries")
        .insert({
            name: body.name,
            slug,
            colour: body.colour || "text-warm-600",
            bg: body.bg || "bg-warm-100",
            sort_order: nextOrder,
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 201 });
}
