import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/auth/meta/callback — handle Facebook OAuth callback
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectUri = `${appUrl}/api/auth/meta/callback`;

    // User denied permission
    if (error) {
        return NextResponse.redirect(
            `${appUrl}/settings?meta=error&reason=${encodeURIComponent(error)}`
        );
    }

    if (!code) {
        return NextResponse.redirect(
            `${appUrl}/settings?meta=error&reason=no_code`
        );
    }

    const appId = process.env.FACEBOOK_APP_ID!;
    const appSecret = process.env.FACEBOOK_APP_SECRET!;

    try {
        // 1. Exchange code for short-lived token
        const tokenUrl = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
        tokenUrl.searchParams.set("client_id", appId);
        tokenUrl.searchParams.set("client_secret", appSecret);
        tokenUrl.searchParams.set("redirect_uri", redirectUri);
        tokenUrl.searchParams.set("code", code);

        const tokenRes = await fetch(tokenUrl.toString());
        const tokenData = await tokenRes.json();

        if (tokenData.error) {
            console.error("Token exchange error:", tokenData.error);
            return NextResponse.redirect(
                `${appUrl}/settings?meta=error&reason=token_exchange`
            );
        }

        const shortLivedToken = tokenData.access_token;

        // 2. Exchange for long-lived token (~60 days)
        const longLivedUrl = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
        longLivedUrl.searchParams.set("grant_type", "fb_exchange_token");
        longLivedUrl.searchParams.set("client_id", appId);
        longLivedUrl.searchParams.set("client_secret", appSecret);
        longLivedUrl.searchParams.set("fb_exchange_token", shortLivedToken);

        const longLivedRes = await fetch(longLivedUrl.toString());
        const longLivedData = await longLivedRes.json();

        if (longLivedData.error) {
            console.error("Long-lived token error:", longLivedData.error);
            return NextResponse.redirect(
                `${appUrl}/settings?meta=error&reason=long_lived_token`
            );
        }

        const accessToken = longLivedData.access_token;
        const expiresIn = longLivedData.expires_in; // seconds

        // 3. Get user info from Meta
        const meRes = await fetch(
            `https://graph.facebook.com/v21.0/me?fields=id,name&access_token=${accessToken}`
        );
        const meData = await meRes.json();

        if (meData.error) {
            console.error("Me endpoint error:", meData.error);
            return NextResponse.redirect(
                `${appUrl}/settings?meta=error&reason=user_info`
            );
        }

        // 4. Store in Supabase
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.redirect(
                `${appUrl}/settings?meta=error&reason=not_authenticated`
            );
        }

        const tokenExpiresAt = expiresIn
            ? new Date(Date.now() + expiresIn * 1000).toISOString()
            : null;

        // Upsert — replace existing connection if any
        const { error: dbError } = await supabase
            .from("meta_connections")
            .upsert(
                {
                    user_id: user.id,
                    meta_user_id: meData.id,
                    meta_user_name: meData.name,
                    access_token: accessToken,
                    token_expires_at: tokenExpiresAt,
                    connected_at: new Date().toISOString(),
                },
                { onConflict: "user_id" }
            );

        if (dbError) {
            console.error("DB upsert error:", dbError);
            return NextResponse.redirect(
                `${appUrl}/settings?meta=error&reason=db_save`
            );
        }

        return NextResponse.redirect(`${appUrl}/settings?meta=connected`);
    } catch (err) {
        console.error("Meta OAuth callback error:", err);
        return NextResponse.redirect(
            `${appUrl}/settings?meta=error&reason=unknown`
        );
    }
}
