"use client";

import { useMemo, useState } from "react";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { enUS } from "date-fns/locale/en-US";
import type { View } from "react-big-calendar";

interface ScheduleEvent {
    id: number;
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
}

export default function SchedulePage() {
    const locales = useMemo(
        () => ({
            "en-US": enUS,
        }),
        []
    );

    const localizer = useMemo(
        () =>
            dateFnsLocalizer({
                format,
                parse,
                startOfWeek,
                getDay,
                locales,
            }),
        [locales]
    );

    const [date, setDate] = useState(new Date());
    const [view, setView] = useState<View>(Views.WEEK);

    const [events] = useState<ScheduleEvent[]>([
        {
            id: 1,
            title: "Orientation Session",
            start: new Date(),
            end: new Date(new Date().getTime()),
        },
    ]);

    return (
        <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)] mb-4">
                Schedule
            </h1>

            <div className="rounded-xl border border-[var(--color-main)] bg-[var(--color-soft-white)] shadow-sm p-4">
                <div className="h-[calc(100vh-200px)]">
                    <Calendar
                        localizer={localizer}
                        events={events}
                        date={date}
                        view={view}
                        onNavigate={(newDate) => setDate(newDate)}
                        onView={(newView) => setView(newView)}
                        startAccessor="start"
                        endAccessor="end"
                        views={[Views.MONTH, Views.WEEK, Views.DAY]}
                        min={new Date(0, 0, 0, 7, 0, 0)}
                        max={new Date(0, 0, 0, 22, 0, 0)}
                        popup
                    />
                </div>
            </div>
        </div>
    );
}