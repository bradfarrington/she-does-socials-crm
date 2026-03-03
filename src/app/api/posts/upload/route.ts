import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// POST /api/posts/upload — upload media to Supabase Storage
export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const clientId = formData.get("client_id") as string | null;
    const postId = formData.get("post_id") as string | null;

    if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Generate a unique path: post-media/{client_id}/{post_id or timestamp}/{filename}
    const folder = clientId || "general";
    const subfolder = postId || Date.now().toString();
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}.${ext}`;
    const filePath = `${folder}/${subfolder}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabase.storage
        .from("post-media")
        .upload(filePath, buffer, {
            contentType: file.type,
            upsert: false,
        });

    if (uploadError) {
        console.error("Upload error:", uploadError);
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
        .from("post-media")
        .getPublicUrl(filePath);

    return NextResponse.json({
        url: urlData.publicUrl,
        path: filePath,
    });
}
