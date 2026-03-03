import { NextResponse } from "next/server";

// GET /api/auth/meta — redirect user to Facebook OAuth dialog
export async function GET() {
    const appId = process.env.FACEBOOK_APP_ID;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectUri = `${appUrl}/api/auth/meta/callback`;

    if (!appId) {
        return NextResponse.json(
            { error: "FACEBOOK_APP_ID not configured" },
            { status: 500 }
        );
    }

    const scopes = [
        "pages_show_list",
        "pages_read_engagement",
        "pages_manage_posts",
        "business_management",
    ].join(",");

    const authUrl = new URL("https://www.facebook.com/v21.0/dialog/oauth");
    authUrl.searchParams.set("client_id", appId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("scope", scopes);
    authUrl.searchParams.set("response_type", "code");

    return NextResponse.redirect(authUrl.toString());
}
