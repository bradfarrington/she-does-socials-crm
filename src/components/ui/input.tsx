import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, hint, id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
        return (
            <div className="space-y-1.5">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-text-secondary"
                    >
                        {label}
                    </label>
                )}
                <input
                    id={inputId}
                    ref={ref}
                    className={cn(
                        "flex h-10 w-full rounded-lg border bg-surface px-3.5 py-2 text-sm text-text-primary",
                        "placeholder:text-text-tertiary",
                        "focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400",
                        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-secondary",
                        "transition-all duration-200",
                        error
                            ? "border-error focus:ring-error/40 focus:border-error"
                            : "border-border hover:border-border-strong",
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="text-xs text-error mt-1">{error}</p>
                )}
                {hint && !error && (
                    <p className="text-xs text-text-tertiary mt-1">{hint}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, error, id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
        return (
            <div className="space-y-1.5">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-text-secondary"
                    >
                        {label}
                    </label>
                )}
                <textarea
                    id={inputId}
                    ref={ref}
                    className={cn(
                        "flex min-h-[80px] w-full rounded-lg border bg-surface px-3.5 py-2.5 text-sm text-text-primary",
                        "placeholder:text-text-tertiary resize-y",
                        "focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        "transition-all duration-200",
                        error
                            ? "border-error focus:ring-error/40"
                            : "border-border hover:border-border-strong",
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="text-xs text-error mt-1">{error}</p>
                )}
            </div>
        );
    }
);

Textarea.displayName = "Textarea";

export { Input, Textarea };
