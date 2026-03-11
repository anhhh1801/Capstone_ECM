"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Edit2Icon, Plus, Repeat2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import {
    CenterClassroom,
    CenterClassSlot,
    deleteCenterClassSlot,
    getCenterClassrooms,
    getCenterClassSlots,
} from "@/services/centerService";
import ClassSlotModal from "./ClassSlotModal";
import { Timeline, TimelineItemBase } from "react-calendar-timeline";
import "react-calendar-timeline/dist/style.css";
import dayjs from "dayjs";

/** Maps Java DayOfWeek enum values to dayjs .day() (0 = Sunday … 6 = Saturday) */
const DAY_OF_WEEK_MAP: Record<string, number> = {
    SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3,
    THURSDAY: 4, FRIDAY: 5, SATURDAY: 6,
};

const TIMELINE_KEYS = {
    groupIdKey: "id",
    groupTitleKey: "title",
    groupLabelKey: "title",
    groupRightTitleKey: "rightTitle",
    itemIdKey: "id",
    itemTitleKey: "title",
    itemDivTitleKey: "title",
    itemGroupKey: "group",
    itemTimeStartKey: "start_time",
    itemTimeEndKey: "end_time",
};

/** Returns the Monday of the week containing the given date. */
function getWeekStart(d: dayjs.Dayjs): dayjs.Dayjs {
    const dow = d.day(); // 0 = Sun … 6 = Sat
    return d.subtract(dow === 0 ? 6 : dow - 1, "day").startOf("day");
}

interface Props {
    centerId: number;
    isManager: boolean;
}

export default function ClassSlotTab({ centerId, isManager }: Props) {
    const [slots, setSlots] = useState<CenterClassSlot[]>([]);
    const [classrooms, setClassrooms] = useState<CenterClassroom[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState<CenterClassSlot | null>(null);
    const [weekStart, setWeekStart] = useState(() => getWeekStart(dayjs()));

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [slotData, roomData] = await Promise.all([
                getCenterClassSlots(centerId),
                getCenterClassrooms(centerId),
            ]);
            setSlots(slotData);
            setClassrooms(roomData);
        } catch (error) {
            console.error(error);
            toast.error("Cannot load class slots.");
        } finally {
            setLoading(false);
        }
    }, [centerId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = async (slot: CenterClassSlot) => {
        if (!confirm(`Delete this class slot for ${slot.course?.name || "course"}?`)) return;

        const userRaw = localStorage.getItem("user");
        const user = userRaw ? JSON.parse(userRaw) : null;
        const managerId = user?.id;

        if (!managerId) {
            toast.error("Cannot identify manager. Please login again.");
            return;
        }

        try {
            await deleteCenterClassSlot(centerId, slot.id, managerId);
            toast.success("Class slot deleted.");
            fetchData();
        } catch (error: any) {
            toast.error(error?.response?.data?.error || "Could not delete class slot.");
        }
    };

    // Groups: one timeline row per classroom + a "No Classroom" fallback row
    const timelineGroups = useMemo(
        () => [
            ...classrooms.map((c) => ({ id: c.id, title: c.location })),
            { id: 0, title: "No Classroom" },
        ],
        [classrooms]
    );

    // Expand each slot into individual occurrences between startDate–endDate
    const timelineItems = useMemo(() => {
        let counter = 1;
        return slots.flatMap((slot) => {
            const groupId = slot.classroom?.id ?? 0;
            const [startH, startM] = slot.startTime.split(":").map(Number);
            const [endH, endM] = slot.endTime.split(":").map(Number);
            const dateEnd = dayjs(slot.endDate);
            const items: TimelineItemBase<number>[] = [];
            let current = dayjs(slot.startDate);
            while (!current.isAfter(dateEnd)) {
                if (slot.daysOfWeek.some((d) => DAY_OF_WEEK_MAP[d] === current.day())) {
                    items.push({
                        id: counter++,
                        group: groupId,
                        title: slot.course?.name || "Class",
                        start_time: current.hour(startH).minute(startM).second(0).valueOf(),
                        end_time: current.hour(endH).minute(endM).second(0).valueOf(),
                        canMove: false,
                        canResize: false,
                    });
                }
                current = current.add(1, "day");
            }
            return items;
        });
    }, [slots]);

    // Controlled visible time window: Monday 7 am → Sunday 10 pm
    const visibleStart = weekStart.hour(7).minute(0).second(0).valueOf();
    const visibleEnd = weekStart.add(6, "day").hour(22).minute(0).second(0).valueOf();

    // Lock the timeline — prevent any user-initiated scroll or zoom
    const handleTimeChange = useCallback(
        (_vs: number, _ve: number, updateScrollCanvas: (...args: any[]) => void) => {
            updateScrollCanvas(visibleStart, visibleEnd);
        },
        [visibleStart, visibleEnd]
    );

    // Week navigation
    const prevWeek = () => setWeekStart((w) => w.subtract(7, "day"));
    const nextWeek = () => setWeekStart((w) => w.add(7, "day"));
    const onDatePick = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value) setWeekStart(getWeekStart(dayjs(e.target.value)));
    };
    const weekLabel = `${weekStart.format("MMM D")} – ${weekStart.add(6, "day").format("MMM D, YYYY")}`;

    if (loading) {
        return <div className="p-10 text-center text-[var(--color-text)]">Loading class slots...</div>;
    }

    return (
        <div className="space-y-4">
            <ClassSlotModal
                centerId={centerId}
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={fetchData}
                slot={editingSlot}
                classrooms={classrooms}
            />

            <div className="flex items-center justify-between">
                <h3 className="font-bold text-[var(--color-text)] flex items-center gap-2">
                    <CalendarDays size={18} /> Class Slots
                </h3>

                {isManager && (
                    <button
                        onClick={() => {
                            setEditingSlot(null);
                            setModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-[var(--color-main)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-secondary)] transition"
                    >
                        <Plus size={16} /> Add Slot
                    </button>
                )}
            </div>

            {slots.length === 0 ? (
                <div className="p-10 text-center text-gray-500 border rounded-lg bg-white">
                    No class slots created yet.
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {slots.map((slot) => (
                            <div
                                key={slot.id}
                                className="bg-[var(--color-soft-white)] border border-[var(--color-main)] shadow-sm hover:shadow-md transition rounded-lg"
                            >
                                {isManager && (
                                    <div className="flex justify-end items-center gap-2 bg-[var(--color-main)] p-2 border-b border-[var(--color-main)] rounded-t-lg">
                                        <button
                                            onClick={() => {
                                                setEditingSlot(slot);
                                                setModalOpen(true);
                                            }}
                                            className="p-2 border-2 bg-[var(--color-secondary)] text-white border-[var(--color-secondary)] rounded hover:bg-white hover:text-[var(--color-secondary)] transition"
                                        >
                                            <Edit2Icon size={18} />
                                        </button>

                                        <button
                                            onClick={() => handleDelete(slot)}
                                            className="p-2 border-2 border-[var(--color-alert)] bg-[var(--color-alert)] text-white rounded hover:bg-[var(--color-soft-white)] hover:text-[var(--color-alert)] transition"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                )}

                                <div className="p-4 space-y-2 text-sm text-[var(--color-text)]">
                                    <div className="font-bold text-base">{slot.course?.name || "Unknown course"}</div>

                                    <div className="flex items-center gap-2">
                                        <Clock3 size={14} className="text-[var(--color-main)]" />
                                        {slot.startTime?.slice(0, 5)} - {slot.endTime?.slice(0, 5)}
                                    </div>

                                    <div>
                                        Days: {(slot.daysOfWeek || []).join(", ") || "-"}
                                    </div>

                                    <div>
                                        Date Range: {slot.startDate} {"→"} {slot.endDate}
                                    </div>

                                    <div>
                                        Classroom: {slot.classroom?.location || "Not assigned"}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Repeat2 size={14} className="text-[var(--color-main)]" />
                                        {slot.isRecurring ? "Recurring" : "One-time"}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Schedule Timeline */}
                    <div className="rounded-lg overflow-hidden border border-[var(--color-main)]">

                        {/* Week navigation controller */}
                        <div className="bg-[var(--color-main)] text-white text-sm font-medium px-4 py-2 flex items-center gap-2 flex-wrap">
                            <CalendarDays size={16} />
                            <span>Schedule Timeline</span>
                            <div className="ml-auto flex items-center gap-2">
                                <button
                                    onClick={prevWeek}
                                    className="p-1 rounded hover:bg-white/20 transition"
                                    title="Previous week"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <span className="min-w-[170px] text-center font-semibold">
                                    {weekLabel}
                                </span>
                                <button
                                    onClick={nextWeek}
                                    className="p-1 rounded hover:bg-white/20 transition"
                                    title="Next week"
                                >
                                    <ChevronRight size={18} />
                                </button>
                                <input
                                    type="date"
                                    onChange={onDatePick}
                                    className="ml-2 text-xs text-[var(--color-text)] bg-white rounded px-2 py-1 outline-none cursor-pointer"
                                    title="Jump to week containing this date"
                                />
                            </div>
                        </div>

                        <Timeline
                            groups={timelineGroups}
                            items={timelineItems}
                            keys={TIMELINE_KEYS}
                            defaultTimeStart={visibleStart}
                            defaultTimeEnd={visibleEnd}
                            visibleTimeStart={visibleStart}
                            visibleTimeEnd={visibleEnd}
                            onTimeChange={handleTimeChange}
                            sidebarWidth={150}
                            lineHeight={40}
                            itemHeightRatio={0.65}
                            stackItems
                            canMove={false}
                            canResize={false}
                            canSelect={false}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
