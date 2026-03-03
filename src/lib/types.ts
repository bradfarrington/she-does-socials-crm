// ============================================
// Database Types for She Does Socials CRM
// ============================================

// ---------- Core ----------

export interface User {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
    openai_api_key?: string;
    created_at: string;
    updated_at: string;
}

// ---------- Meta Business Suite ----------

export interface MetaConnection {
    id: string;
    user_id: string;
    meta_user_id: string;
    meta_user_name?: string;
    access_token: string;
    token_expires_at?: string;
    connected_at: string;
}

export interface MetaPage {
    id: string;
    name: string;
    category?: string;
    picture_url?: string;
    followers_count: number;
    instagram?: {
        id: string;
        username: string;
        name: string;
        profile_picture_url?: string;
        followers_count?: number;
    } | null;
    already_synced: boolean;
    existing_status?: string | null;
}

// ---------- Industries ----------

export interface IndustryRecord {
    id: string;
    name: string;
    slug: string;
    colour: string;
    bg: string;
    sort_order: number;
    created_at: string;
}

// Keep as string for backwards compatibility — now dynamic from DB
export type Industry = string;

// ---------- Clients ----------

export type BrandVoice =
    | "friendly"
    | "luxury"
    | "bold"
    | "educational"
    | "soulful"
    | "playful"
    | "professional"
    | "warm";

export type Platform =
    | "instagram"
    | "facebook"
    | "tiktok"
    | "linkedin";

export type ContentComfort =
    | "yes"
    | "no"
    | "sometimes";

export type PreferredContentType =
    | "b_roll"
    | "talking_head"
    | "carousels"
    | "static";

export interface Client {
    id: string;
    user_id: string;
    business_name: string;
    contact_name: string;
    contact_email: string;
    contact_phone?: string;
    website?: string;
    industry_id?: string;
    location?: string;
    location_type?: "local" | "national" | "online";
    is_priority: boolean;
    is_archived: boolean;
    notes?: string;
    meta_page_id?: string;
    created_at: string;
    updated_at: string;
}

export interface ClientBranding {
    id: string;
    client_id: string;
    brand_colours: string[]; // hex values
    fonts?: string[];
    logo_url?: string;
    brand_voice: BrandVoice[];
    words_love?: string[];
    words_avoid?: string[];
    created_at: string;
    updated_at: string;
}

export interface ClientSocialAccount {
    id: string;
    client_id: string;
    platform: Platform;
    handle?: string;
    access_notes?: string;
    posting_frequency?: string;
    follower_count?: number;
    created_at: string;
}

export interface ClientGoals {
    id: string;
    client_id: string;
    success_definition?: string;
    focus: ("sales" | "awareness" | "community")[];
    short_term_campaigns?: string;
    long_term_vision?: string;
    comfortable_on_camera: ContentComfort;
    preferred_content_types: PreferredContentType[];
    content_boundaries?: string;
    created_at: string;
    updated_at: string;
}

// ---------- Packages & Invoicing ----------

export type PackageType =
    | "monthly"
    | "one_off"
    | "coaching"
    | "digital_product";

export interface Package {
    id: string;
    user_id: string;
    name: string;
    type: PackageType;
    price: number;
    currency: string;
    deliverables: string[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export type InvoiceStatus =
    | "draft"
    | "sent"
    | "paid"
    | "overdue"
    | "cancelled";

export interface Invoice {
    id: string;
    user_id: string;
    client_id: string;
    package_id?: string;
    invoice_number: string;
    amount: number;
    currency: string;
    status: InvoiceStatus;
    due_date: string;
    paid_date?: string;
    items: InvoiceItem[];
    notes?: string;
    is_recurring: boolean;
    recurring_interval?: "monthly" | "quarterly" | "yearly";
    created_at: string;
    updated_at: string;
}

export interface InvoiceItem {
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
}

// ---------- Content ----------

export type ContentType =
    | "reel"
    | "carousel"
    | "static_post"
    | "story"
    | "live"
    | "email"
    | "blog";

export type ContentStatus =
    | "idea"
    | "planned"
    | "drafted"
    | "scheduled"
    | "live";

export type ContentPurpose =
    | "educational"
    | "sales"
    | "community"
    | "authority";

export interface ContentPost {
    id: string;
    user_id: string;
    client_id: string;
    platform: Platform;
    content_type: ContentType;
    status: ContentStatus;
    purpose?: ContentPurpose;
    scheduled_date?: string;
    scheduled_time?: string;
    caption?: string;
    hook?: string;
    cta?: string;
    notes?: string;
    media_urls: string[];
    meta_post_id?: string;
    meta_synced_at?: string;
    created_at: string;
    updated_at: string;
}

export interface Campaign {
    id: string;
    client_id: string;
    user_id: string;
    name: string;
    description?: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    created_at: string;
}

// ---------- Leads & Pipeline ----------

export type LeadSource =
    | "landing_page"
    | "contact_form"
    | "manual"
    | "social_media"
    | "referral";

export interface Lead {
    id: string;
    user_id: string;
    name: string;
    email?: string;
    phone?: string;
    source: LeadSource;
    source_detail?: string;
    service_interested?: string;
    value?: number;
    pipeline_stage_id: string;
    notes?: string;
    next_follow_up?: string;
    created_at: string;
    updated_at: string;
}

export interface PipelineStage {
    id: string;
    user_id: string;
    name: string;
    order: number;
    colour: string;
    created_at: string;
}

// ---------- Analytics ----------

export interface AnalyticsEntry {
    id: string;
    client_id: string;
    platform: Platform;
    period_start: string;
    period_end: string;
    followers: number;
    reach: number;
    engagement: number;
    impressions?: number;
    top_post_url?: string;
    top_post_type?: ContentType;
    notes?: string;
    created_at: string;
}

// ---------- Landing Pages ----------

export interface LandingPage {
    id: string;
    user_id: string;
    client_id?: string;
    title: string;
    slug: string;
    type: "lead_magnet" | "workshop" | "challenge" | "offer" | "event";
    content_json: Record<string, unknown>;
    is_published: boolean;
    brand_colours: string[];
    created_at: string;
    updated_at: string;
}

// ---------- Workshops ----------

export interface Workshop {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    event_date: string;
    location?: string;
    is_online: boolean;
    max_attendees?: number;
    price?: number;
    landing_page_id?: string;
    created_at: string;
}

export interface Attendee {
    id: string;
    workshop_id: string;
    name: string;
    email: string;
    has_attended: boolean;
    feedback_submitted: boolean;
    created_at: string;
}

// ---------- Digital Products ----------

export interface DigitalProduct {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    price: number;
    file_url: string;
    thumbnail_url?: string;
    is_active: boolean;
    download_count: number;
    created_at: string;
}

// ---------- Automations ----------

export type AutomationTrigger =
    | "client_created"
    | "invoice_sent"
    | "invoice_overdue"
    | "lead_created"
    | "workshop_registered"
    | "product_purchased"
    | "content_due";

export type AutomationAction =
    | "send_email"
    | "create_task"
    | "update_status"
    | "send_reminder";

export interface Automation {
    id: string;
    user_id: string;
    name: string;
    trigger: AutomationTrigger;
    action: AutomationAction;
    config: Record<string, unknown>;
    is_active: boolean;
    created_at: string;
}
