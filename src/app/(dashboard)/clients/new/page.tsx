"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    CalendarRange,
    Palette,
    Share2,
    Target,
    Check,
    CheckCircle2,
    X,
    Plus,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ColourPicker } from "@/components/ui/colour-picker";
import type {
    BrandVoice,
    Platform,
    ContentComfort,
    PreferredContentType,
    IndustryRecord,
} from "@/lib/types";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface PackageRecord {
    id: string;
    name: string;
    type: string;
    price: number;
    active: boolean;
}

const steps = [
    { id: 1, label: "Business Info", icon: Building2 },
    { id: 2, label: "Branding", icon: Palette },
    { id: 3, label: "Content", icon: Share2 },
    { id: 4, label: "Goals", icon: Target },
    { id: 5, label: "Strategy", icon: CalendarRange },
];

const brandVoices: { value: BrandVoice; label: string; emoji: string }[] = [
    { value: "friendly", label: "Friendly", emoji: "😊" },
    { value: "luxury", label: "Luxury", emoji: "✨" },
    { value: "bold", label: "Bold", emoji: "💪" },
    { value: "educational", label: "Educational", emoji: "📚" },
    { value: "soulful", label: "Soulful", emoji: "🌿" },
    { value: "playful", label: "Playful", emoji: "🎉" },
    { value: "professional", label: "Professional", emoji: "💼" },
    { value: "warm", label: "Warm", emoji: "☀️" },
];

const platforms: { value: Platform; label: string; colour: string }[] = [
    { value: "instagram", label: "Instagram", colour: "bg-gradient-to-br from-purple-500 to-pink-500" },
    { value: "facebook", label: "Facebook", colour: "bg-blue-600" },
    { value: "tiktok", label: "TikTok", colour: "bg-black" },
    { value: "linkedin", label: "LinkedIn", colour: "bg-blue-700" },
];

const contentTypes: { value: PreferredContentType; label: string }[] = [
    { value: "b_roll", label: "B-Roll" },
    { value: "talking_head", label: "Talking Head" },
    { value: "carousels", label: "Carousels" },
    { value: "static", label: "Static Posts" },
];

interface FormData {
    // Step 1
    business_name: string;
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    website: string;
    industry_id: string;
    location: string;
    location_type: "local" | "national" | "online" | "";
    package_id: string;
    // Social handles
    instagram_handle: string;
    facebook_url: string;
    tiktok_handle: string;
    linkedin_url: string;
    // Business expanded
    business_description: string;
    target_audience: string;
    usp: string;
    // Step 2
    brand_colours: string[];
    brand_voice: BrandVoice[];
    words_love: string;
    words_avoid: string;
    // Step 3
    platforms: Platform[];
    posting_frequency: string;
    content_looking_for: string;
    content_not_working: string;
    content_themes: string;
    comfortable_on_camera: ContentComfort | "";
    preferred_content_types: PreferredContentType[];
    content_boundaries: string;
    // Step 4
    success_definition: string;
    focus: ("sales" | "awareness" | "community")[];
    short_term_campaigns: string;
    long_term_vision: string;
    // Step 5 — Strategy
    strategy_month_1_goal: string;
    strategy_month_1_actions: string[];
    strategy_month_2_goal: string;
    strategy_month_2_actions: string[];
    strategy_month_3_goal: string;
    strategy_month_3_actions: string[];
}

export default function NewClientPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [newColour, setNewColour] = useState("#f29a5e");
    const [industries, setIndustries] = useState<IndustryRecord[]>([]);
    const [packages, setPackages] = useState<PackageRecord[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        business_name: "",
        contact_name: "",
        contact_email: "",
        contact_phone: "",
        website: "",
        industry_id: "",
        location: "",
        location_type: "",
        package_id: "",
        instagram_handle: "",
        facebook_url: "",
        tiktok_handle: "",
        linkedin_url: "",
        business_description: "",
        target_audience: "",
        usp: "",
        brand_colours: [],
        brand_voice: [],
        words_love: "",
        words_avoid: "",
        platforms: [],
        posting_frequency: "",
        content_looking_for: "",
        content_not_working: "",
        content_themes: "",
        comfortable_on_camera: "",
        preferred_content_types: [],
        content_boundaries: "",
        success_definition: "",
        focus: [],
        short_term_campaigns: "",
        long_term_vision: "",
        strategy_month_1_goal: "",
        strategy_month_1_actions: [""],
        strategy_month_2_goal: "",
        strategy_month_2_actions: [""],
        strategy_month_3_goal: "",
        strategy_month_3_actions: [""],
    });

    const fetchIndustries = useCallback(async () => {
        try {
            const [indRes, pkgRes] = await Promise.all([
                fetch("/api/industries"),
                fetch("/api/packages"),
            ]);
            if (indRes.ok) {
                const data = await indRes.json();
                setIndustries(data);
            }
            if (pkgRes.ok) {
                const data = await pkgRes.json();
                setPackages(data);
            }
        } catch (err) {
            console.error("Failed to fetch data:", err);
        }
    }, []);

    useEffect(() => {
        fetchIndustries();
    }, [fetchIndustries]);

    const updateField = (field: keyof FormData, value: unknown) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const toggleArrayItem = <T extends string>(field: keyof FormData, value: T) => {
        const arr = formData[field] as T[];
        if (arr.includes(value)) {
            updateField(field, arr.filter((v) => v !== value));
        } else {
            updateField(field, [...arr, value]);
        }
    };

    const addColour = () => {
        if (!formData.brand_colours.includes(newColour)) {
            updateField("brand_colours", [...formData.brand_colours, newColour]);
        }
    };

    const removeColour = (colour: string) => {
        updateField(
            "brand_colours",
            formData.brand_colours.filter((c) => c !== colour)
        );
    };

    const handleSubmit = async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const res = await fetch("/api/clients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    business_name: formData.business_name,
                    contact_name: formData.contact_name,
                    contact_email: formData.contact_email,
                    contact_phone: formData.contact_phone || null,
                    website: formData.website || null,
                    industry_id: formData.industry_id || null,
                    package_id: formData.package_id || null,
                    location: formData.location || null,
                    location_type: formData.location_type || null,
                    brand_colours: formData.brand_colours,
                    brand_voice: formData.brand_voice,
                    words_love: formData.words_love || null,
                    words_avoid: formData.words_avoid || null,
                    platforms: formData.platforms,
                    posting_frequency: formData.posting_frequency || null,
                    success_definition: formData.success_definition || null,
                    focus: formData.focus,
                    short_term_campaigns: formData.short_term_campaigns || null,
                    long_term_vision: formData.long_term_vision || null,
                    comfortable_on_camera: formData.comfortable_on_camera || null,
                    preferred_content_types: formData.preferred_content_types,
                    content_boundaries: formData.content_boundaries || null,
                    instagram_handle: formData.instagram_handle || null,
                    facebook_url: formData.facebook_url || null,
                    tiktok_handle: formData.tiktok_handle || null,
                    linkedin_url: formData.linkedin_url || null,
                    business_description: formData.business_description || null,
                    target_audience: formData.target_audience || null,
                    usp: formData.usp || null,
                    content_looking_for: formData.content_looking_for || null,
                    content_not_working: formData.content_not_working || null,
                    content_themes: formData.content_themes || null,
                    strategy_month_1_goal: formData.strategy_month_1_goal || null,
                    strategy_month_1_actions: formData.strategy_month_1_actions.filter(Boolean),
                    strategy_month_2_goal: formData.strategy_month_2_goal || null,
                    strategy_month_2_actions: formData.strategy_month_2_actions.filter(Boolean),
                    strategy_month_3_goal: formData.strategy_month_3_goal || null,
                    strategy_month_3_actions: formData.strategy_month_3_actions.filter(Boolean),
                }),
            });
            if (res.ok) {
                router.push("/clients");
            } else {
                const err = await res.json();
                console.error("Failed to create client:", err);
            }
        } catch (err) {
            console.error("Failed to create client:", err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Header
                title="Add New Client"
                subtitle="Set up their profile step by step"
                actions={
                    <Link href="/clients" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                        <ArrowLeft className="w-4 h-4" />
                        Back to Clients
                    </Link>
                }
            />

            <div className="p-6 max-w-3xl mx-auto animate-fade-in">
                {/* Step Indicator */}
                <div className="flex items-center gap-2 mb-8">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = currentStep === step.id;
                        const isComplete = currentStep > step.id;
                        return (
                            <React.Fragment key={step.id}>
                                <button
                                    onClick={() => isComplete && setCurrentStep(step.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                                        isActive && "bg-brand-50 text-brand-700",
                                        isComplete && "text-sage-600 cursor-pointer hover:bg-sage-50",
                                        !isActive && !isComplete && "text-text-tertiary"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "w-7 h-7 rounded-full flex items-center justify-center text-xs",
                                            isActive && "bg-brand-500 text-white",
                                            isComplete && "bg-sage-500 text-white",
                                            !isActive && !isComplete && "bg-warm-200 text-warm-500"
                                        )}
                                    >
                                        {isComplete ? <Check className="w-3.5 h-3.5" /> : step.id}
                                    </div>
                                    <span className="hidden sm:inline">{step.label}</span>
                                </button>
                                {index < steps.length - 1 && (
                                    <div
                                        className={cn(
                                            "flex-1 h-px",
                                            currentStep > step.id ? "bg-sage-300" : "bg-border"
                                        )}
                                    />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Step 1: Business Info */}
                {currentStep === 1 && (
                    <Card className="animate-fade-in">
                        <CardHeader>
                            <CardTitle>Business Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Business Name *"
                                    placeholder="e.g. Glow Studio"
                                    value={formData.business_name}
                                    onChange={(e) => updateField("business_name", e.target.value)}
                                />
                                <Input
                                    label="Contact Name *"
                                    placeholder="e.g. Sarah Mitchell"
                                    value={formData.contact_name}
                                    onChange={(e) => updateField("contact_name", e.target.value)}
                                />
                                <Input
                                    label="Email *"
                                    type="email"
                                    placeholder="sarah@glowstudio.com"
                                    value={formData.contact_email}
                                    onChange={(e) => updateField("contact_email", e.target.value)}
                                />
                                <Input
                                    label="Phone"
                                    type="tel"
                                    placeholder="07XXX XXXXXX"
                                    value={formData.contact_phone}
                                    onChange={(e) => updateField("contact_phone", e.target.value)}
                                />
                                <Input
                                    label="Website"
                                    placeholder="https://glowstudio.com"
                                    value={formData.website}
                                    onChange={(e) => updateField("website", e.target.value)}
                                />
                                <Input
                                    label="Location"
                                    placeholder="e.g. Manchester"
                                    value={formData.location}
                                    onChange={(e) => updateField("location", e.target.value)}
                                />
                            </div>

                            {/* Industry */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-text-secondary">
                                    Industry *
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {industries.map((ind) => (
                                        <button
                                            key={ind.id}
                                            type="button"
                                            onClick={() => updateField("industry_id", ind.id)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                                                formData.industry_id === ind.id
                                                    ? "bg-brand-50 text-brand-700 border-brand-300"
                                                    : "bg-surface border-border text-text-secondary hover:bg-surface-hover"
                                            )}
                                        >
                                            {ind.name}
                                        </button>
                                    ))}
                                    {industries.length === 0 && (
                                        <p className="text-xs text-text-tertiary">
                                            No industries configured.{" "}
                                            <Link href="/settings" className="text-brand-500 hover:underline">
                                                Add some in Settings
                                            </Link>
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Location Type */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-text-secondary">
                                    Business Reach
                                </label>
                                <div className="flex gap-2">
                                    {(["local", "national", "online"] as const).map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => updateField("location_type", type)}
                                            className={cn(
                                                "px-4 py-2 rounded-lg text-sm font-medium transition-all border capitalize",
                                                formData.location_type === type
                                                    ? "bg-brand-50 text-brand-700 border-brand-300"
                                                    : "bg-surface border-border text-text-secondary hover:bg-surface-hover"
                                            )}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Package */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-text-secondary">
                                    Package
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {packages.filter((p) => p.active).map((pkg) => (
                                        <button
                                            key={pkg.id}
                                            type="button"
                                            onClick={() => updateField("package_id", formData.package_id === pkg.id ? "" : pkg.id)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                                                formData.package_id === pkg.id
                                                    ? "bg-brand-50 text-brand-700 border-brand-300"
                                                    : "bg-surface border-border text-text-secondary hover:bg-surface-hover"
                                            )}
                                        >
                                            {pkg.name} · {formatCurrency(pkg.price)}
                                        </button>
                                    ))}
                                    {packages.filter((p) => p.active).length === 0 && (
                                        <p className="text-xs text-text-tertiary">
                                            No packages created yet.{" "}
                                            <Link href="/packages" className="text-brand-500 hover:underline">
                                                Add some in Packages
                                            </Link>
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Social Handles */}
                            <div className="space-y-2 pt-2">
                                <label className="block text-sm font-medium text-text-secondary">
                                    Social Handles
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Instagram"
                                        placeholder="@glowstudio"
                                        value={formData.instagram_handle}
                                        onChange={(e) => updateField("instagram_handle", e.target.value)}
                                    />
                                    <Input
                                        label="TikTok"
                                        placeholder="@glowstudio"
                                        value={formData.tiktok_handle}
                                        onChange={(e) => updateField("tiktok_handle", e.target.value)}
                                    />
                                    <Input
                                        label="Facebook"
                                        placeholder="https://facebook.com/glowstudio"
                                        value={formData.facebook_url}
                                        onChange={(e) => updateField("facebook_url", e.target.value)}
                                    />
                                    <Input
                                        label="LinkedIn"
                                        placeholder="https://linkedin.com/in/..."
                                        value={formData.linkedin_url}
                                        onChange={(e) => updateField("linkedin_url", e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Business Expanded */}
                            <div className="space-y-4 pt-2 border-t border-border-light">
                                <h3 className="text-sm font-semibold text-text-primary pt-2">About the Business</h3>
                                <Textarea
                                    label="Description"
                                    placeholder="Tell us about this business..."
                                    value={formData.business_description}
                                    onChange={(e) => updateField("business_description", e.target.value)}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Textarea
                                        label="Target Audience"
                                        placeholder="e.g. Women 25-40, interested in wellness and self-care..."
                                        value={formData.target_audience}
                                        onChange={(e) => updateField("target_audience", e.target.value)}
                                    />
                                    <Textarea
                                        label="Unique Selling Point (USP)"
                                        placeholder="What makes them different from competitors?"
                                        value={formData.usp}
                                        onChange={(e) => updateField("usp", e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 2: Branding */}
                {currentStep === 2 && (
                    <Card className="animate-fade-in">
                        <CardHeader>
                            <CardTitle>Brand Identity</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Brand Colours */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-text-secondary">
                                    Brand Colours
                                </label>
                                <div className="flex items-center gap-3">
                                    <ColourPicker value={newColour} onChange={setNewColour} />
                                    <Input
                                        value={newColour}
                                        onChange={(e) => setNewColour(e.target.value)}
                                        className="w-32"
                                        placeholder="#000000"
                                    />
                                    <Button variant="secondary" size="sm" onClick={addColour}>
                                        <Plus className="w-4 h-4" />
                                        Add
                                    </Button>
                                </div>
                                {formData.brand_colours.length > 0 && (
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {formData.brand_colours.map((colour) => (
                                            <div
                                                key={colour}
                                                className="flex items-center gap-1.5 bg-surface-secondary rounded-full px-2 py-1 border border-border"
                                            >
                                                <div
                                                    className="w-5 h-5 rounded-full border border-border"
                                                    style={{ backgroundColor: colour }}
                                                />
                                                <span className="text-xs text-text-secondary">{colour}</span>
                                                <button
                                                    onClick={() => removeColour(colour)}
                                                    className="text-text-tertiary hover:text-error transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Brand Voice */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-text-secondary">
                                    Brand Voice (select all that apply)
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {brandVoices.map((voice) => (
                                        <button
                                            key={voice.value}
                                            type="button"
                                            onClick={() => toggleArrayItem("brand_voice", voice.value)}
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border text-left",
                                                formData.brand_voice.includes(voice.value)
                                                    ? "bg-brand-50 text-brand-700 border-brand-300"
                                                    : "bg-surface border-border text-text-secondary hover:bg-surface-hover"
                                            )}
                                        >
                                            <span>{voice.emoji}</span>
                                            <span>{voice.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Words */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Textarea
                                    label="Words they love"
                                    placeholder="e.g. glow, radiance, confidence, treat yourself..."
                                    value={formData.words_love}
                                    onChange={(e) => updateField("words_love", e.target.value)}
                                />
                                <Textarea
                                    label="Words to avoid"
                                    placeholder="e.g. cheap, basic, discount..."
                                    value={formData.words_avoid}
                                    onChange={(e) => updateField("words_avoid", e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 3: Content & Social */}
                {currentStep === 3 && (
                    <Card className="animate-fade-in">
                        <CardHeader>
                            <CardTitle>Content & Social Media</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-text-secondary">
                                    Active Platforms
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {platforms.map((platform) => (
                                        <button
                                            key={platform.value}
                                            type="button"
                                            onClick={() => toggleArrayItem("platforms", platform.value)}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all border",
                                                formData.platforms.includes(platform.value)
                                                    ? "bg-brand-50 text-brand-700 border-brand-300 shadow-sm"
                                                    : "bg-surface border-border text-text-secondary hover:bg-surface-hover"
                                            )}
                                        >
                                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold", platform.colour)}>
                                                {platform.label[0]}
                                            </div>
                                            <span>{platform.label}</span>
                                            {formData.platforms.includes(platform.value) && (
                                                <Check className="w-4 h-4 ml-auto text-sage-500" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Input
                                label="Posting Frequency Expectations"
                                placeholder="e.g. 3-4 posts per week, 2 stories daily"
                                value={formData.posting_frequency}
                                onChange={(e) => updateField("posting_frequency", e.target.value)}
                            />

                            {/* Content Wants & Needs */}
                            <div className="space-y-4 pt-2 border-t border-border-light">
                                <h3 className="text-sm font-semibold text-text-primary pt-2">Wants & Needs for Content</h3>
                                <Textarea
                                    label="What content are they looking for?"
                                    placeholder="e.g. Engaging reels, educational carousels, brand story content..."
                                    value={formData.content_looking_for}
                                    onChange={(e) => updateField("content_looking_for", e.target.value)}
                                />
                                <Textarea
                                    label="What's not currently working?"
                                    placeholder="e.g. Low engagement on static posts, inconsistent posting..."
                                    value={formData.content_not_working}
                                    onChange={(e) => updateField("content_not_working", e.target.value)}
                                />
                                <Textarea
                                    label="Content themes / topics"
                                    placeholder="e.g. Behind the scenes, client transformations, tips & education..."
                                    value={formData.content_themes}
                                    onChange={(e) => updateField("content_themes", e.target.value)}
                                />
                            </div>

                            {/* Camera Comfort */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-text-secondary">
                                    Comfortable on camera?
                                </label>
                                <div className="flex gap-2">
                                    {(["yes", "no", "sometimes"] as const).map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => updateField("comfortable_on_camera", option)}
                                            className={cn(
                                                "px-4 py-2 rounded-lg text-sm font-medium transition-all border capitalize",
                                                formData.comfortable_on_camera === option
                                                    ? "bg-brand-50 text-brand-700 border-brand-300"
                                                    : "bg-surface border-border text-text-secondary hover:bg-surface-hover"
                                            )}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Preferred Content Types */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-text-secondary">
                                    Preferred Content Types
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {contentTypes.map((type) => (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => toggleArrayItem("preferred_content_types", type.value)}
                                            className={cn(
                                                "px-3 py-2 rounded-lg text-sm font-medium transition-all border",
                                                formData.preferred_content_types.includes(type.value)
                                                    ? "bg-brand-50 text-brand-700 border-brand-300"
                                                    : "bg-surface border-border text-text-secondary hover:bg-surface-hover"
                                            )}
                                        >
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Textarea
                                label="Content Boundaries"
                                placeholder="e.g. Therapy clients - avoid direct CTAs, no before/after images..."
                                value={formData.content_boundaries}
                                onChange={(e) => updateField("content_boundaries", e.target.value)}
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Step 4: Goals */}
                {currentStep === 4 && (
                    <Card className="animate-fade-in">
                        <CardHeader>
                            <CardTitle>Goals & End Goal</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Textarea
                                label="What does success look like for them?"
                                placeholder="e.g. More bookings, building a community, being seen as a go-to expert..."
                                value={formData.success_definition}
                                onChange={(e) => updateField("success_definition", e.target.value)}
                            />

                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-text-secondary">
                                    Primary Focus
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {(["sales", "awareness", "community"] as const).map((focus) => (
                                        <button
                                            key={focus}
                                            type="button"
                                            onClick={() => toggleArrayItem("focus", focus)}
                                            className={cn(
                                                "px-4 py-2 rounded-lg text-sm font-medium transition-all border capitalize",
                                                formData.focus.includes(focus)
                                                    ? "bg-brand-50 text-brand-700 border-brand-300"
                                                    : "bg-surface border-border text-text-secondary hover:bg-surface-hover"
                                            )}
                                        >
                                            {focus}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Textarea
                                    label="Short-term campaigns or events"
                                    placeholder="e.g. Summer promotion, Christmas menu launch..."
                                    value={formData.short_term_campaigns}
                                    onChange={(e) => updateField("short_term_campaigns", e.target.value)}
                                />
                                <Textarea
                                    label="Long-term vision"
                                    placeholder="e.g. Become the go-to beauty brand in Manchester..."
                                    value={formData.long_term_vision}
                                    onChange={(e) => updateField("long_term_vision", e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 5: Strategy */}
                {currentStep === 5 && (
                    <Card className="animate-fade-in">
                        <CardHeader>
                            <CardTitle>3 Month Strategy Plan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {([1, 2, 3] as const).map((month) => {
                                const goalField = `strategy_month_${month}_goal` as keyof FormData;
                                const actionsField = `strategy_month_${month}_actions` as keyof FormData;
                                const actions = (formData[actionsField] as string[]) || [""];
                                const colours = [
                                    { border: "border-l-brand-400", badge: "bg-brand-50 text-brand-700" },
                                    { border: "border-l-lavender-400", badge: "bg-lavender-50 text-lavender-600" },
                                    { border: "border-l-sage-400", badge: "bg-sage-50 text-sage-700" },
                                ];
                                const monthColour = colours[month - 1];

                                return (
                                    <div key={month} className={cn("pl-4 border-l-4 space-y-4", monthColour.border)}>
                                        <div className="flex items-center gap-2">
                                            <Badge size="sm" className={monthColour.badge}>Month {month}</Badge>
                                        </div>
                                        <Textarea
                                            label="Goal"
                                            placeholder={`What is the main goal for month ${month}?`}
                                            value={formData[goalField] as string}
                                            onChange={(e) => updateField(goalField, e.target.value)}
                                        />
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-text-secondary">Actions / Tasks</label>
                                            {actions.map((action, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-sage-400 flex-shrink-0" />
                                                    <input
                                                        type="text"
                                                        value={action}
                                                        onChange={(e) => {
                                                            const updated = [...actions];
                                                            updated[i] = e.target.value;
                                                            updateField(actionsField, updated);
                                                        }}
                                                        placeholder={`Action item ${i + 1}`}
                                                        className="flex h-9 flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all"
                                                    />
                                                    {actions.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                updateField(actionsField, actions.filter((_, idx) => idx !== i));
                                                            }}
                                                            className="p-1.5 rounded-lg hover:bg-rose-50 text-text-tertiary hover:text-rose-500 transition-all"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => updateField(actionsField, [...actions, ""])}
                                                className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1"
                                            >
                                                <Plus className="w-3 h-3" />Add action
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-6">
                    <Button
                        variant="ghost"
                        onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                        disabled={currentStep === 1}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Previous
                    </Button>

                    {currentStep < 5 ? (
                        <Button onClick={() => setCurrentStep(currentStep + 1)}>
                            Next
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} variant="success" disabled={submitting}>
                            {submitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4" />
                            )}
                            Create Client
                        </Button>
                    )}
                </div>
            </div>
        </>
    );
}
