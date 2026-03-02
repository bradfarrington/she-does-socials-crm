"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";

/* ───────────────────── helpers ───────────────────── */

function hsvToHex(h: number, s: number, v: number): string {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    const toHex = (n: number) =>
        Math.round((n + m) * 255)
            .toString(16)
            .padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToHsv(hex: string): [number, number, number] {
    const m = hex.replace("#", "").match(/.{2}/g);
    if (!m) return [0, 0, 0];
    const r = parseInt(m[0], 16) / 255;
    const g = parseInt(m[1], 16) / 255;
    const b = parseInt(m[2], 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    if (d !== 0) {
        if (max === r) h = 60 * (((g - b) / d) % 6);
        else if (max === g) h = 60 * ((b - r) / d + 2);
        else h = 60 * ((r - g) / d + 4);
    }
    if (h < 0) h += 360;
    const s = max === 0 ? 0 : d / max;
    return [h, s, max];
}

function isValidHex(hex: string): boolean {
    return /^#[0-9a-fA-F]{6}$/.test(hex);
}

/* ───────────────────── component ───────────────────── */

interface ColourPickerProps {
    value: string;
    onChange: (hex: string) => void;
}

export function ColourPicker({ value, onChange }: ColourPickerProps) {
    const [open, setOpen] = useState(false);
    const [hsv, setHsv] = useState<[number, number, number]>(() => hexToHsv(value));
    const [hexInput, setHexInput] = useState(value);

    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const hueRef = useRef<HTMLDivElement>(null);

    // Sync from parent value if it changes externally
    useEffect(() => {
        if (isValidHex(value)) {
            setHsv(hexToHsv(value));
            setHexInput(value);
        }
    }, [value]);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    /* ── saturation / brightness canvas drag ── */
    const handleCanvasInteraction = useCallback(
        (clientX: number, clientY: number) => {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return;
            const s = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
            const v = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height));
            const newHsv: [number, number, number] = [hsv[0], s, v];
            setHsv(newHsv);
            const hex = hsvToHex(...newHsv);
            setHexInput(hex);
            onChange(hex);
        },
        [hsv, onChange]
    );

    const onCanvasPointerDown = useCallback(
        (e: React.PointerEvent) => {
            e.preventDefault();
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            handleCanvasInteraction(e.clientX, e.clientY);
        },
        [handleCanvasInteraction]
    );

    const onCanvasPointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (e.buttons === 0) return;
            handleCanvasInteraction(e.clientX, e.clientY);
        },
        [handleCanvasInteraction]
    );

    /* ── hue slider drag ── */
    const handleHueInteraction = useCallback(
        (clientX: number) => {
            const rect = hueRef.current?.getBoundingClientRect();
            if (!rect) return;
            const h = Math.max(0, Math.min(359.999, ((clientX - rect.left) / rect.width) * 360));
            const newHsv: [number, number, number] = [h, hsv[1], hsv[2]];
            setHsv(newHsv);
            const hex = hsvToHex(...newHsv);
            setHexInput(hex);
            onChange(hex);
        },
        [hsv, onChange]
    );

    const onHuePointerDown = useCallback(
        (e: React.PointerEvent) => {
            e.preventDefault();
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            handleHueInteraction(e.clientX);
        },
        [handleHueInteraction]
    );

    const onHuePointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (e.buttons === 0) return;
            handleHueInteraction(e.clientX);
        },
        [handleHueInteraction]
    );

    /* ── hex field ── */
    const onHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value;
        if (!val.startsWith("#")) val = "#" + val;
        setHexInput(val);
        if (isValidHex(val)) {
            setHsv(hexToHsv(val));
            onChange(val.toLowerCase());
        }
    };

    const hueColour = hsvToHex(hsv[0], 1, 1);

    return (
        <div ref={containerRef} className="relative" style={{ transition: "none" }}>
            {/* Colour swatch trigger */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-10 h-10 rounded-lg cursor-pointer border-2 border-border hover:border-brand-400 transition-colors shadow-sm"
                style={{ backgroundColor: value }}
                aria-label="Open colour picker"
            />

            {/* Popover */}
            {open && (
                <div
                    className="absolute top-12 left-0 z-50 bg-surface rounded-xl border border-border shadow-xl p-3 animate-scale-in"
                    style={{ width: 240, transition: "none" }}
                >
                    {/* Saturation / Brightness canvas */}
                    <div
                        ref={canvasRef}
                        className="relative w-full rounded-lg cursor-crosshair overflow-hidden"
                        style={{
                            height: 160,
                            background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hueColour})`,
                            transition: "none",
                        }}
                        onPointerDown={onCanvasPointerDown}
                        onPointerMove={onCanvasPointerMove}
                    >
                        {/* Picker thumb */}
                        <div
                            className="absolute w-4 h-4 rounded-full border-2 border-white pointer-events-none"
                            style={{
                                left: `${hsv[1] * 100}%`,
                                top: `${(1 - hsv[2]) * 100}%`,
                                transform: "translate(-50%, -50%)",
                                boxShadow: "0 0 0 1px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)",
                                transition: "none",
                            }}
                        />
                    </div>

                    {/* Hue slider */}
                    <div
                        ref={hueRef}
                        className="relative w-full h-3 rounded-full cursor-pointer mt-3"
                        style={{
                            background:
                                "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
                            transition: "none",
                        }}
                        onPointerDown={onHuePointerDown}
                        onPointerMove={onHuePointerMove}
                    >
                        <div
                            className="absolute top-1/2 w-4 h-4 rounded-full border-2 border-white pointer-events-none"
                            style={{
                                left: `${(hsv[0] / 360) * 100}%`,
                                transform: "translate(-50%, -50%)",
                                background: hueColour,
                                boxShadow: "0 0 0 1px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.2)",
                                transition: "none",
                            }}
                        />
                    </div>

                    {/* Hex input + preview */}
                    <div className="flex items-center gap-2 mt-3">
                        <div
                            className="w-8 h-8 rounded-lg border border-border shrink-0"
                            style={{ backgroundColor: value, transition: "none" }}
                        />
                        <input
                            type="text"
                            value={hexInput}
                            onChange={onHexChange}
                            maxLength={7}
                            spellCheck={false}
                            className="flex-1 h-8 px-2 rounded-lg border border-border bg-surface-secondary text-sm font-mono text-text-primary focus:outline-none focus:border-brand-400"
                            style={{ transition: "none" }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
