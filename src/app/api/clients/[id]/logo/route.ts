import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Increase body size limit for logo uploads
export const runtime = "nodejs";

// POST /api/clients/[id]/logo — upload a client logo
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify client belongs to user
        const { data: client } = await supabase
            .from("clients")
            .select("id")
            .eq("id", id)
            .eq("user_id", user.id)
            .single();

        if (!client) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }

        let formData: FormData;
        try {
            formData = await request.formData();
        } catch (e) {
            console.error("FormData parse error:", e);
            return NextResponse.json({ error: "Failed to parse upload" }, { status: 400 });
        }

        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: "Invalid file type. Use JPEG, PNG, WebP, or SVG." }, { status: 400 });
        }

        // Create a unique file path
        const ext = file.name.split(".").pop() || "png";
        const filePath = `${user.id}/${id}/logo.${ext}`;

        // Read file into Uint8Array
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from("client-logos")
            .upload(filePath, uint8Array, {
                contentType: file.type,
                cacheControl: "3600",
                upsert: true,
            });

        if (uploadError) {
            console.error("Supabase upload error:", uploadError);
            return NextResponse.json({ error: uploadError.message }, { status: 500 });
        }

        // Get the public URL
        const { data: urlData } = supabase.storage
            .from("client-logos")
            .getPublicUrl(filePath);

        const logoUrl = urlData.publicUrl;

        // Update the client record
        const { data: updated, error: updateError } = await supabase
            .from("clients")
            .update({ logo_url: logoUrl, updated_at: new Date().toISOString() })
            .eq("id", id)
            .eq("user_id", user.id)
            .select("*, industries(id, name, slug, colour, bg), packages(id, name, type, price)")
            .single();

        if (updateError) {
            console.error("Client update error:", updateError);
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Logo upload unexpected error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/clients/[id]/logo — remove a client logo
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current client to find logo path
    const { data: client } = await supabase
        .from("clients")
        .select("logo_url")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (!client) {
        return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Delete from storage if exists
    if (client.logo_url) {
        const path = `${user.id}/${id}`;
        const { data: files } = await supabase.storage
            .from("client-logos")
            .list(path);

        if (files && files.length > 0) {
            await supabase.storage
                .from("client-logos")
                .remove(files.map((f) => `${path}/${f.name}`));
        }
    }

    // Nullify the logo URL
    const { data: updated, error } = await supabase
        .from("clients")
        .update({ logo_url: null, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id)
        .select("*, industries(id, name, slug, colour, bg), packages(id, name, type, price)")
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(updated);
}
