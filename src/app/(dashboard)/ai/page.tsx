import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function AIPage() {
    return (
        <>
            <Header title="AI Assistant" subtitle="Generate captions, ideas, and landing pages" />
            <div className="p-6">
                <Card>
                    <CardContent className="py-16 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-50 mb-4">
                            <Sparkles className="w-7 h-7 text-rose-500" />
                        </div>
                        <h3 className="font-display font-semibold text-text-primary mb-1">AI Assistant</h3>
                        <p className="text-sm text-text-tertiary max-w-sm mx-auto">
                            Coming in Phase 4 — Brand-aware caption generation, content ideas, and AI-built landing pages.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
