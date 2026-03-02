"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setIsLoading(false);
        } else {
            window.location.href = "/dashboard";
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-brand-50 via-rose-50 to-lavender-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-scale-in">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 mb-4 shadow-lg">
                        <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="font-display text-2xl font-bold text-text-primary">
                        She Does Socials
                    </h1>
                    <p className="text-sm text-text-tertiary mt-1">
                        Sign in to your CRM
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-surface rounded-2xl border border-border shadow-xl p-8">
                    <form onSubmit={handleLogin} className="space-y-5">
                        <Input
                            label="Email"
                            type="email"
                            placeholder="hello@shedoessocials.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        {error && (
                            <p className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">
                                {error}
                            </p>
                        )}
                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            Sign In
                        </Button>
                    </form>
                </div>

                <p className="text-center text-xs text-text-tertiary mt-6">
                    Built with ♡ for She Does Socials
                </p>
            </div>
        </div>
    );
}
