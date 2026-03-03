import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/packages — list all packages for the authenticated user
export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
        .from("packages")
        .select("*")
        .eq("user_id", user.id)
        .order("sort_order", { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
}

// POST /api/packages — create a new package
export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const { data, error } = await supabase
        .from("packages")
        .insert({
            user_id: user.id,
            name: body.name,
            type: body.type,
            price: body.price || 0,
            description: body.description || null,
            deliverables: body.deliverables || [],
            popular: body.popular || false,
            active: body.active ?? true,
            sort_order: body.sort_order ?? 0,
        })
        .select()
        .single();

    if (error) {
        console.error("POST /api/packages error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 201 });
}
