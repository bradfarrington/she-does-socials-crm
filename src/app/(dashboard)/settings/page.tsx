"use client";

import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Key, User, Palette } from "lucide-react";

export default function SettingsPage() {
    return (
        <>
            <Header title="Settings" subtitle="Manage your account and preferences" />
            <div className="p-6 max-w-2xl space-y-6 animate-fade-in">
                {/* Profile */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-text-tertiary" />
                            <CardTitle className="text-base">Profile</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input label="Full Name" placeholder="Your name" />
                        <Input label="Email" type="email" placeholder="hello@shedoessocials.com" />
                        <Button size="sm">Save Changes</Button>
                    </CardContent>
                </Card>

                {/* API Keys */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Key className="w-4 h-4 text-text-tertiary" />
                            <CardTitle className="text-base">AI Integration</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            label="OpenAI API Key"
                            type="password"
                            placeholder="sk-..."
                            hint="Connect your ChatGPT/OpenAI account to unlock AI features. Your key is stored securely."
                        />
                        <Button size="sm">Connect API Key</Button>
                    </CardContent>
                </Card>

                {/* Branding */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Palette className="w-4 h-4 text-text-tertiary" />
                            <CardTitle className="text-base">Branding</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-text-tertiary">
                            Customise your CRM&apos;s look and feel. Upload your logo and set your brand colours.
                        </p>
                        <Input label="Business Name" placeholder="She Does Socials" />
                        <Button size="sm" variant="secondary">Upload Logo</Button>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
