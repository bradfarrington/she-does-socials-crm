import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function ContentPage() {
    return (
        <>
            <Header title="Content Calendar" subtitle="Plan and schedule your content" />
            <div className="p-6">
                <Card>
                    <CardContent className="py-16 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-lavender-50 mb-4">
                            <Calendar className="w-7 h-7 text-lavender-500" />
                        </div>
                        <h3 className="font-display font-semibold text-text-primary mb-1">Content Calendar</h3>
                        <p className="text-sm text-text-tertiary max-w-sm mx-auto">
                            Coming in Phase 2 — Plan, schedule, and track content across all platforms.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
