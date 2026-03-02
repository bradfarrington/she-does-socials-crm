"use client";

import React, { useState } from "react";
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
    Palette,
    Share2,
    Target,
    Check,
    X,
    Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
    Industry,
    BrandVoice,
    Platform,
    ContentComfort,
    PreferredContentType,
} from "@/lib/types";
import Link from "next/link";

const steps = [
    { id: 1, label: "Business Info", icon: Building2 },
    { id: 2, label: "Branding", icon: Palette },
    { id: 3, label: "Social Media", icon: Share2 },
    { id: 4, label: "Goals", icon: Target },
];

const industries: { value: Industry; label: string }[] = [
    { value: "beauty", label: "Beauty" },
    { value: "hospitality", label: "Hospitality" },
    { value: "fitness", label: "Fitness" },
    { value: "therapy", label: "Therapy" },
    { value: "education", label: "Education" },
    { value: "travel", label: "Travel" },
    { value: "events", label: "Events" },
    { value: "retail", label: "Retail" },
    { value: "food_drink", label: "Food & Drink" },
    { value: "health", label: "Health" },
    { value: "other", label: "Other" },
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
    industry: Industry | "";
    location: string;
    location_type: "local" | "national" | "online" | "";
    // Step 2
    brand_colours: string[];
    brand_voice: BrandVoice[];
    words_love: string;
    words_avoid: string;
    // Step 3
    platforms: Platform[];
    posting_frequency: string;
    // Step 4
    success_definition: string;
    focus: ("sales" | "awareness" | "community")[];
    short_term_campaigns: string;
    long_term_vision: string;
    comfortable_on_camera: ContentComfort | "";
    preferred_content_types: PreferredContentType[];
    content_boundaries: string;
}

export default function NewClientPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [newColour, setNewColour] = useState("#f29a5e");
    const [formData, setFormData] = useState<FormData>({
        business_name: "",
        contact_name: "",
        contact_email: "",
        contact_phone: "",
        website: "",
        industry: "",
        location: "",
        location_type: "",
        brand_colours: [],
        brand_voice: [],
        words_love: "",
        words_avoid: "",
        platforms: [],
        posting_frequency: "",
        success_definition: "",
        focus: [],
        short_term_campaigns: "",
        long_term_vision: "",
        comfortable_on_camera: "",
        preferred_content_types: [],
        content_boundaries: "",
    });

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
        // TODO: Save to Supabase
        console.log("Form data:", formData);
        router.push("/clients");
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
                                            key={ind.value}
                                            type="button"
                                            onClick={() => updateField("industry", ind.value)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                                                formData.industry === ind.value
                                                    ? "bg-brand-50 text-brand-700 border-brand-300"
                                                    : "bg-surface border-border text-text-secondary hover:bg-surface-hover"
                                            )}
                                        >
                                            {ind.label}
                                        </button>
                                    ))}
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
                                    <input
                                        type="color"
                                        value={newColour}
                                        onChange={(e) => setNewColour(e.target.value)}
                                        className="w-10 h-10 rounded-lg cursor-pointer border border-border"
                                    />
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

                {/* Step 3: Social Media */}
                {currentStep === 3 && (
                    <Card className="animate-fade-in">
                        <CardHeader>
                            <CardTitle>Social Media Accounts</CardTitle>
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
                        </CardContent>
                    </Card>
                )}

                {/* Step 4: Goals */}
                {currentStep === 4 && (
                    <Card className="animate-fade-in">
                        <CardHeader>
                            <CardTitle>Goals & Preferences</CardTitle>
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

                            {/* Preferred Content */}
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

                    {currentStep < 4 ? (
                        <Button onClick={() => setCurrentStep(currentStep + 1)}>
                            Next
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} variant="success">
                            <Check className="w-4 h-4" />
                            Create Client
                        </Button>
                    )}
                </div>
            </div>
        </>
    );
}
