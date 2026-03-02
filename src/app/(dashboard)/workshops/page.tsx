import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

export default function WorkshopsPage() {
    return (
        <>
            <Header title="Workshops" subtitle="Manage training events and attendees" />
            <div className="p-6">
                <Card>
                    <CardContent className="py-16 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sage-50 mb-4">
                            <GraduationCap className="w-7 h-7 text-sage-500" />
                        </div>
                        <h3 className="font-display font-semibold text-text-primary mb-1">Workshops</h3>
                        <p className="text-sm text-text-tertiary max-w-sm mx-auto">
                            Coming in Phase 6 — Event pages, bookings, attendee management, and feedback collection.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
