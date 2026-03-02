"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Settings as SettingsIcon,
    Key,
    User,
    Palette,
    Layers,
    Plus,
    Pencil,
    Trash2,
    Check,
    X,
    GripVertical,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { IndustryRecord } from "@/lib/types";

// ─── Colour Presets ─────────────────────────────────────
const colourPresets = [
    { colour: "text-rose-600", bg: "bg-rose-50", label: "Rose" },
    { colour: "text-brand-700", bg: "bg-brand-50", label: "Brand" },
    { colour: "text-sage-600", bg: "bg-sage-50", label: "Sage" },
    { colour: "text-lavender-500", bg: "bg-lavender-50", label: "Lavender" },
    { colour: "text-blue-600", bg: "bg-blue-50", label: "Blue" },
    { colour: "text-cyan-600", bg: "bg-cyan-50", label: "Cyan" },
    { colour: "text-pink-600", bg: "bg-pink-50", label: "Pink" },
    { colour: "text-amber-600", bg: "bg-amber-50", label: "Amber" },
    { colour: "text-orange-600", bg: "bg-orange-50", label: "Orange" },
    { colour: "text-emerald-600", bg: "bg-emerald-50", label: "Emerald" },
    { colour: "text-warm-600", bg: "bg-warm-100", label: "Warm" },
];

export default function SettingsPage() {
    // ─── Industry State ─────────────────────────────────
    const [industries, setIndustries] = useState<IndustryRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState("");
    const [newColour, setNewColour] = useState(colourPresets[0]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [saving, setSaving] = useState(false);

    const fetchIndustries = useCallback(async () => {
        try {
            const res = await fetch("/api/industries");
            if (res.ok) {
                const data = await res.json();
                setIndustries(data);
            }
        } catch (err) {
            console.error("Failed to fetch industries:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchIndustries();
    }, [fetchIndustries]);

    const handleAddIndustry = async () => {
        if (!newName.trim() || saving) return;
        setSaving(true);
        try {
            const res = await fetch("/api/industries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newName.trim(),
                    colour: newColour.colour,
                    bg: newColour.bg,
                }),
            });
            if (res.ok) {
                setNewName("");
                await fetchIndustries();
            }
        } catch (err) {
            console.error("Failed to add industry:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateIndustry = async (id: string) => {
        if (!editName.trim() || saving) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/industries/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editName.trim() }),
            });
            if (res.ok) {
                setEditingId(null);
                await fetchIndustries();
            }
        } catch (err) {
            console.error("Failed to update industry:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteIndustry = async (id: string) => {
        if (saving) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/industries/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                await fetchIndustries();
            }
        } catch (err) {
            console.error("Failed to delete industry:", err);
        } finally {
            setSaving(false);
        }
    };

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

                {/* Industry Types */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-text-tertiary" />
                            <CardTitle className="text-base">Industry Types</CardTitle>
                        </div>
                        <p className="text-sm text-text-tertiary mt-1">
                            Manage the industries you can assign to clients.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="w-5 h-5 text-text-tertiary animate-spin" />
                            </div>
                        ) : (
                            <>
                                {/* Industry List */}
                                <div className="space-y-1">
                                    {industries.map((industry) => (
                                        <div
                                            key={industry.id}
                                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors group"
                                        >
                                            <GripVertical className="w-3.5 h-3.5 text-text-tertiary/40 flex-shrink-0" />

                                            {editingId === industry.id ? (
                                                <>
                                                    <input
                                                        type="text"
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") handleUpdateIndustry(industry.id);
                                                            if (e.key === "Escape") setEditingId(null);
                                                        }}
                                                        className="flex-1 h-7 px-2 rounded border border-brand-300 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-brand-400/40"
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => handleUpdateIndustry(industry.id)}
                                                        className="p-1 rounded hover:bg-sage-50 text-sage-600 transition-colors"
                                                    >
                                                        <Check className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="p-1 rounded hover:bg-rose-50 text-text-tertiary transition-colors"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <Badge
                                                        variant="default"
                                                        size="sm"
                                                        className={`${industry.bg} ${industry.colour}`}
                                                    >
                                                        {industry.name}
                                                    </Badge>
                                                    <div className="flex-1" />
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(industry.id);
                                                            setEditName(industry.name);
                                                        }}
                                                        className="p-1 rounded hover:bg-surface-hover text-text-tertiary opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteIndustry(industry.id)}
                                                        className="p-1 rounded hover:bg-rose-50 text-text-tertiary hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                    {industries.length === 0 && (
                                        <p className="text-sm text-text-tertiary py-4 text-center">
                                            No industries yet. Add one below.
                                        </p>
                                    )}
                                </div>

                                {/* Add New Industry */}
                                <div className="border-t border-border pt-4 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            placeholder="New industry name..."
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleAddIndustry()}
                                            className="flex-1 h-9 px-3 rounded-lg border border-border bg-surface text-sm placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={handleAddIndustry}
                                            disabled={!newName.trim() || saving}
                                        >
                                            {saving ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Plus className="w-4 h-4" />
                                            )}
                                            Add
                                        </Button>
                                    </div>

                                    {/* Colour Preset Picker */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-text-tertiary">
                                            Badge Colour
                                        </label>
                                        <div className="flex flex-wrap gap-1.5">
                                            {colourPresets.map((preset) => (
                                                <button
                                                    key={preset.label}
                                                    onClick={() => setNewColour(preset)}
                                                    className={cn(
                                                        "px-2.5 py-1 rounded-full text-xs font-medium transition-all border",
                                                        newColour.label === preset.label
                                                            ? `${preset.bg} ${preset.colour} border-current ring-2 ring-current/20`
                                                            : "bg-surface border-border text-text-secondary hover:bg-surface-hover"
                                                    )}
                                                >
                                                    {preset.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
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
