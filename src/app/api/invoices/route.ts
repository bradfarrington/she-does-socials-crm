import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/invoices — list invoices, optional ?client_id= filter
export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clientId = request.nextUrl.searchParams.get("client_id");

    let query = supabase
        .from("invoices")
        .select("*, clients(id, business_name)")
        .eq("user_id", user.id)
        .order("issued_date", { ascending: false });

    if (clientId) {
        query = query.eq("client_id", clientId);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Flatten client name for convenience
    const invoices = (data || []).map((inv) => ({
        ...inv,
        client_name: inv.clients?.business_name || "Unknown",
        clients: undefined,
    }));

    return NextResponse.json(invoices);
}

// POST /api/invoices — create a new invoice
export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Generate invoice number if not provided
    if (!body.invoice_number) {
        const { count } = await supabase
            .from("invoices")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id);

        body.invoice_number = `SDS-${1001 + (count || 0)}`;
    }

    const { data, error } = await supabase
        .from("invoices")
        .insert({
            user_id: user.id,
            client_id: body.client_id,
            invoice_number: body.invoice_number,
            description: body.description || "",
            status: body.status || "draft",
            amount: body.amount || 0,
            due_date: body.due_date,
            issued_date: body.issued_date,
            paid_date: body.paid_date || null,
            recurring: body.recurring || "none",
            line_items: body.line_items || [],
        })
        .select("*, clients(id, business_name)")
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        ...data,
        client_name: data.clients?.business_name || "Unknown",
        clients: undefined,
    }, { status: 201 });
}
