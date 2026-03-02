"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: "default" | "brand" | "success" | "warning" | "error" | "info" | "outline";
    size?: "sm" | "md";
}

const variantStyles = {
    default: "bg-warm-100 text-warm-700",
    brand: "bg-brand-50 text-brand-700",
    success: "bg-sage-50 text-sage-700",
    warning: "bg-brand-50 text-brand-800",
    error: "bg-rose-50 text-rose-600",
    info: "bg-lavender-50 text-lavender-600",
    outline: "bg-transparent border border-border text-text-secondary",
};

const sizeStyles = {
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2.5 py-0.5",
};

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = "default", size = "md", ...props }, ref) => (
        <span
            ref={ref}
            className={cn(
                "inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap",
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
            {...props}
        />
    )
);

Badge.displayName = "Badge";

export { Badge };
