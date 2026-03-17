"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Edit2Icon, Plus, Repeat2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
    CenterClassroom,
    CenterClassSlot,
    deleteCenterClassSlot,
    deleteCenterClassSlotOccurrence,
    getCenterClassrooms,
    getCenterClassSlots,
} from "@/services/centerService";
import { getStudentsInCourse } from "@/services/courseService";
import ClassSlotModal from "./ClassSlotModal";
import ConfirmModal from "@/components/ConfirmModal";
import { DateHeader, Timeline, TimelineHeaders, TimelineItemBase } from "react-calendar-timeline";
import "react-calendar-timeline/dist/style.css";
import dayjs from "dayjs";
import { formatDateValue } from "../../../../../utils/dateFormat";

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

const FILTER_DAY_OPTIONS = [
    "ALL",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
] as const;

const FILTER_TIME_OPTIONS = Array.from({ length: (22 - 7) * 2 + 1 }, (_, i) => {
    const halfHourIndex = 14 + i;
    const hour24 = Math.floor(halfHourIndex / 2);
    const minute = halfHourIndex % 2 === 0 ? "00" : "30";
    const value = `${String(hour24).padStart(2, "0")}:${minute}`;
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    const amPm = hour24 < 12 ? "AM" : "PM";
    return { value, label: `${hour12}:${minute} ${amPm}` };
});

/** Returns the Monday of the week containing the given date. */
function getWeekStart(d: dayjs.Dayjs): dayjs.Dayjs {
    const dow = d.day(); // 0 = Sun … 6 = Sat
    return d.subtract(dow === 0 ? 6 : dow - 1, "day").startOf("day");
}

type TimelineViewMode = "week" | "day";

type TimelineDisplayItem = TimelineItemBase<number> & {
    slotId: number;
    occurrenceDate: string;
    courseId?: number;
    courseName: string;
    teacherText: string;
    studentText: string;
    timeText: string;
    daysText: string;
    rangeText: string;
    classroomText: string;
};

interface Props {
    centerId: number;
    isManager: boolean;
}

export default function ClassSlotTab({ centerId, isManager }: Props) {
    const router = useRouter();
    const [slots, setSlots] = useState<CenterClassSlot[]>([]);
    const [classrooms, setClassrooms] = useState<CenterClassroom[]>([]);
    const [courseStudentCounts, setCourseStudentCounts] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState<CenterClassSlot | null>(null);
    const [deletingSlot, setDeletingSlot] = useState<CenterClassSlot | null>(null);
    const [viewMode, setViewMode] = useState<TimelineViewMode>("week");
    const [focusDate, setFocusDate] = useState(() => dayjs().startOf("day"));
    const [searchTerm, setSearchTerm] = useState("");
    const [dayFilter, setDayFilter] = useState<(typeof FILTER_DAY_OPTIONS)[number]>("ALL");
    const [timeFrom, setTimeFrom] = useState("07:00");
    const [timeTo, setTimeTo] = useState("22:00");
    const [selectedOccurrence, setSelectedOccurrence] = useState<{
        slotId: number;
        occurrenceDate: string;
        startTime: string;
        endTime: string;
    } | null>(null);
    const [isOccurrenceActionModalOpen, setOccurrenceActionModalOpen] = useState(false);
    const [isOccurrenceEditModalOpen, setOccurrenceEditModalOpen] = useState(false);
    const [occurrenceEditSlot, setOccurrenceEditSlot] = useState<CenterClassSlot | null>(null);
    const [isDeleteOccurrenceConfirmOpen, setDeleteOccurrenceConfirmOpen] = useState(false);
    const isAnyOverlayOpen =
        isModalOpen ||
        isOccurrenceEditModalOpen ||
        isOccurrenceActionModalOpen ||
        isDeleteOccurrenceConfirmOpen ||
        !!deletingSlot;

    const parseUserManagerId = () => {
        const userRaw = localStorage.getItem("user");
        const user = userRaw ? JSON.parse(userRaw) : null;
        return user?.id as number | undefined;
    };

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [slotData, roomData] = await Promise.all([
                getCenterClassSlots(centerId),
                getCenterClassrooms(centerId),
            ]);
            setSlots(slotData);
            setClassrooms(roomData);

            const uniqueCourseIds = Array.from(
                new Set(slotData.map((slot) => slot.course?.id).filter((id): id is number => typeof id === "number"))
            );

            if (uniqueCourseIds.length > 0) {
                const counts = await Promise.all(
                    uniqueCourseIds.map(async (courseId) => {
                        try {
                            const students = await getStudentsInCourse(courseId);
                            return [courseId, Array.isArray(students) ? students.length : 0] as const;
                        } catch {
                            return [courseId, 0] as const;
                        }
                    })
                );

                setCourseStudentCounts(Object.fromEntries(counts));
            } else {
                setCourseStudentCounts({});
            }
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

    useEffect(() => {
        if (timeFrom >= timeTo) {
            setTimeTo("22:00");
        }
    }, [timeFrom, timeTo]);

    const handleDelete = async (slot: CenterClassSlot) => {
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
            setDeletingSlot(null);
            fetchData();
        } catch (error: any) {
            toast.error(error?.response?.data?.error || "Could not delete class slot.");
        }
    };

    const filteredSlots = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return slots.filter((slot) => {
            const courseName = slot.course?.name?.toLowerCase() || "";
            const roomName = slot.classroom?.location?.toLowerCase() || "";
            const searchMatch = !normalizedSearch || courseName.includes(normalizedSearch) || roomName.includes(normalizedSearch);

            const dayMatch = dayFilter === "ALL" || (slot.daysOfWeek || []).includes(dayFilter);

            const slotStart = slot.startTime?.slice(0, 5) || "00:00";
            const slotEnd = slot.endTime?.slice(0, 5) || "00:00";
            const timeMatch = slotStart < timeTo && timeFrom < slotEnd;

            return searchMatch && dayMatch && timeMatch;
        });
    }, [slots, searchTerm, dayFilter, timeFrom, timeTo]);

    const hasUnassignedClassroomSlots = useMemo(
        () => filteredSlots.some((slot) => !slot.classroom?.id),
        [filteredSlots]
    );

    // Groups: one timeline row per classroom, with fallback row only when needed
    const timelineGroups = useMemo(
        () => [
            ...classrooms.map((c) => ({ id: c.id, title: c.location })),
            ...(hasUnassignedClassroomSlots ? [{ id: 0, title: "No Classroom" }] : []),
        ],
        [classrooms, hasUnassignedClassroomSlots]
    );

    // Expand each slot into individual occurrences between startDate–endDate
    const timelineItems = useMemo(() => {
        let counter = 1;
        return filteredSlots.flatMap((slot) => {
            const groupId = slot.classroom?.id ?? 0;
            const [startH, startM] = slot.startTime.split(":").map(Number);
            const [endH, endM] = slot.endTime.split(":").map(Number);
            const dateEnd = dayjs(slot.endDate);
            const items: TimelineDisplayItem[] = [];
            let current = dayjs(slot.startDate);
            while (!current.isAfter(dateEnd)) {
                if (slot.daysOfWeek.some((d) => DAY_OF_WEEK_MAP[d] === current.day())) {
                    const occurrenceDate = current.format("YYYY-MM-DD");
                    if (slot.excludedDates?.includes(occurrenceDate)) {
                        current = current.add(1, "day");
                        continue;
                    }

                    const courseName = slot.course?.name || "Class";
                    const teacherName =
                        slot.course?.teacherName ||
                        slot.course?.teacher?.fullName ||
                        slot.course?.teacher?.name ||
                        [slot.course?.teacher?.firstName, slot.course?.teacher?.lastName].filter(Boolean).join(" ") ||
                        "Not assigned";
                    const studentCount =
                        slot.course?.studentCount ??
                        slot.course?.totalStudents ??
                        slot.course?.totalStudent ??
                        slot.course?.numberOfStudents ??
                        slot.course?.students?.length ??
                        (slot.course?.id ? courseStudentCounts[slot.course.id] : undefined);
                    const timeText = `${slot.startTime?.slice(0, 5)} - ${slot.endTime?.slice(0, 5)}`;
                    const daysText = `Days: ${(slot.daysOfWeek || []).join(", ") || "-"}`;
                    const rangeText = `Date Range: ${formatDateValue(slot.startDate)} -> ${formatDateValue(slot.endDate)}`;
                    const classroomText = `Classroom: ${slot.classroom?.location || "Not assigned"}`;

                    items.push({
                        id: counter++,
                        slotId: slot.id,
                        occurrenceDate,
                        group: groupId,
                        title: courseName,
                        start_time: current.hour(startH).minute(startM).second(0).valueOf(),
                        end_time: current.hour(endH).minute(endM).second(0).valueOf(),
                        canMove: false,
                        canResize: false,
                        courseId: slot.course?.id,
                        courseName,
                        teacherText: `Teacher: ${teacherName}`,
                        studentText: `Students: ${studentCount ?? "N/A"}`,
                        timeText,
                        daysText,
                        rangeText,
                        classroomText,
                    });
                }
                current = current.add(1, "day");
            }
            return items;
        });
    }, [filteredSlots, courseStudentCounts]);

    const courseIdByItemId = useMemo(() => {
        const map = new Map<string, number>();
        timelineItems.forEach((item) => {
            if (item.courseId) {
                map.set(String(item.id), item.courseId);
            }
        });
        return map;
    }, [timelineItems]);

    const occurrenceByItemId = useMemo(() => {
        const map = new Map<string, { slotId: number; occurrenceDate: string; startTime: string; endTime: string }>();
        timelineItems.forEach((item) => {
            map.set(String(item.id), {
                slotId: item.slotId,
                occurrenceDate: item.occurrenceDate,
                startTime: dayjs(item.start_time).format("HH:mm"),
                endTime: dayjs(item.end_time).format("HH:mm"),
            });
        });
        return map;
    }, [timelineItems]);

    const weekStart = useMemo(() => getWeekStart(focusDate), [focusDate]);

    // Controlled visible time window: day/week with fixed 7am-10pm daily bounds
    const visibleStart = useMemo(() => {
        if (viewMode === "day") {
            return focusDate.hour(7).minute(0).second(0).millisecond(0).valueOf();
        }
        return weekStart.startOf("day").valueOf();
    }, [viewMode, focusDate, weekStart]);

    const visibleEnd = useMemo(() => {
        if (viewMode === "day") {
            return focusDate.hour(22).minute(0).second(0).millisecond(0).valueOf();
        }
        return weekStart.add(6, "day").endOf("day").valueOf();
    }, [viewMode, focusDate, weekStart]);

    // Lock the timeline — prevent any user-initiated scroll or zoom
    const handleTimeChange = useCallback(
        (_vs: number, _ve: number, updateScrollCanvas: (...args: any[]) => void) => {
            updateScrollCanvas(visibleStart, visibleEnd);
        },
        [visibleStart, visibleEnd]
    );

    // Day/week navigation
    const prevPeriod = () => {
        if (viewMode === "day") {
            setFocusDate((d) => d.subtract(1, "day"));
            return;
        }
        setFocusDate((d) => d.subtract(7, "day"));
    };

    const nextPeriod = () => {
        if (viewMode === "day") {
            setFocusDate((d) => d.add(1, "day"));
            return;
        }
        setFocusDate((d) => d.add(7, "day"));
    };

    const onDatePick = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value) {
            setFocusDate(dayjs(e.target.value).startOf("day"));
        }
    };

    const periodLabel =
        viewMode === "day"
            ? focusDate.format("MMM D, YYYY")
            : `${weekStart.format("MMM D")} - ${weekStart.add(6, "day").format("MMM D, YYYY")}`;

    const handleItemDoubleClick = useCallback(
        (itemId: number | string) => {
            const courseId = courseIdByItemId.get(String(itemId));
            if (!courseId) {
                toast.error("Course is not available for this slot.");
                return;
            }
            router.push(`/teacher/courses/${courseId}`);
        },
        [courseIdByItemId, router]
    );

    const handleItemClick = useCallback(
        async (itemId: number | string) => {
            if (isAnyOverlayOpen) return;
            if (!isManager) return;

            const occurrence = occurrenceByItemId.get(String(itemId));
            if (!occurrence) return;

            setSelectedOccurrence(occurrence);
            setOccurrenceActionModalOpen(true);
        },
        [isAnyOverlayOpen, isManager, occurrenceByItemId]
    );

    const handleEditWholeSeries = useCallback(() => {
        if (!selectedOccurrence) return;
        const slot = slots.find((s) => s.id === selectedOccurrence.slotId);
        if (!slot) {
            toast.error("Cannot find slot to edit.");
            return;
        }
        setOccurrenceActionModalOpen(false);
        setEditingSlot(slot);
        setModalOpen(true);
    }, [selectedOccurrence, slots]);

    const handleOpenOverrideModal = useCallback(() => {
        if (!selectedOccurrence) return;

        const slot = slots.find((s) => s.id === selectedOccurrence.slotId);
        if (!slot) {
            toast.error("Cannot find slot to edit.");
            return;
        }

        setOccurrenceActionModalOpen(false);
        setOccurrenceEditSlot(slot);
        setOccurrenceEditModalOpen(true);
    }, [selectedOccurrence, slots]);

    const handleDeleteSelectedOccurrence = useCallback(() => {
        if (!selectedOccurrence) return;
        setOccurrenceActionModalOpen(false);
        setDeleteOccurrenceConfirmOpen(true);
    }, [selectedOccurrence]);

    const confirmDeleteSelectedOccurrence = useCallback(async () => {
        if (!selectedOccurrence) return;

        const managerId = parseUserManagerId();
        if (!managerId) {
            toast.error("Cannot identify manager. Please login again.");
            return;
        }

        try {
            await deleteCenterClassSlotOccurrence(centerId, selectedOccurrence.slotId, selectedOccurrence.occurrenceDate, managerId);
            toast.success("Selected occurrence deleted.");
            setDeleteOccurrenceConfirmOpen(false);
            setSelectedOccurrence(null);
            fetchData();
        } catch (error: any) {
            toast.error(error?.response?.data?.error || "Could not delete selected occurrence.");
        }
    }, [centerId, fetchData, selectedOccurrence]);

    const dayPrimaryHeaderLabel = useCallback((timeRange: [dayjs.Dayjs, dayjs.Dayjs]) => {
        return timeRange[0].format("dddd, MMM D, YYYY");
    }, []);

    const dayTimeHeaderLabel = useCallback((timeRange: [dayjs.Dayjs, dayjs.Dayjs]) => {
        return timeRange[0].format("hh:mm A");
    }, []);

    const renderTimelineItem = useCallback(
        ({ item, getItemProps, itemContext }: any) => {
            const displayItem = item as TimelineDisplayItem;
            const itemProps = getItemProps({
                className:
                    "group !bg-transparent !border-0 !shadow-none !text-inherit cursor-pointer overflow-visible",
            });
            const { key, ...restItemProps } = itemProps;

            return (
                <div key={key} {...restItemProps} onClick={() => handleItemClick(displayItem.id)}>
                    <div
                        className={`h-full w-full rounded-md border-2 border-[var(--color-main)] bg-[var(--color-secondary)]/80 p-2 leading-tight text-[var(--color-text)] shadow-sm transition-all group-hover:border-[var(--color-secondary)] group-hover:shadow-md ${itemContext.dragging ? "opacity-70" : "opacity-100"
                            }`}
                    >
                        <div className="truncate font-semibold text-[var(--color-main)]">{displayItem.courseName}</div>
                        <div className="truncate">{displayItem.teacherText}</div>
                        <div className="truncate">{displayItem.studentText}</div>
                        <div className="truncate">{displayItem.timeText}</div>
                        <div className="truncate">{displayItem.classroomText}</div>
                    </div>
                </div>
            );
        },
        [handleItemClick]
    );

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

            <ClassSlotModal
                centerId={centerId}
                isOpen={isOccurrenceEditModalOpen}
                onClose={() => {
                    setOccurrenceEditModalOpen(false);
                    setOccurrenceEditSlot(null);
                }}
                onSuccess={() => {
                    setOccurrenceEditModalOpen(false);
                    setOccurrenceEditSlot(null);
                    setSelectedOccurrence(null);
                    fetchData();
                }}
                slot={occurrenceEditSlot}
                classrooms={classrooms}
                mode="occurrence"
                occurrenceDate={selectedOccurrence?.occurrenceDate}
                occurrenceSlotId={selectedOccurrence?.slotId}
                occurrenceStartTime={selectedOccurrence?.startTime}
                occurrenceEndTime={selectedOccurrence?.endTime}
                lockCourse
            />

            <ConfirmModal
                isOpen={!!deletingSlot}
                title="Delete Class Slot"
                message={`Delete class slot for "${deletingSlot?.course?.name || "course"}"?`}
                confirmText="Delete"
                onClose={() => setDeletingSlot(null)}
                onConfirm={() => (deletingSlot ? handleDelete(deletingSlot) : undefined)}
            />

            <ConfirmModal
                isOpen={isDeleteOccurrenceConfirmOpen}
                title="Delete Selected Occurrence"
                message={`Delete only ${selectedOccurrence ? formatDateValue(selectedOccurrence.occurrenceDate) : "this occurrence"}?`}
                confirmText="Delete"
                onClose={() => setDeleteOccurrenceConfirmOpen(false)}
                onConfirm={confirmDeleteSelectedOccurrence}
            />

            {isOccurrenceActionModalOpen && selectedOccurrence && (
                <div className="fixed inset-0 z-[2000] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-4 ">
                        <h3 className="text-lg font-bold text-[var(--color-text)]">Selected Slot:</h3>
                        <p className="text-sm text-[var(--color-text)] font-bold pb-2">
                            Date: {formatDateValue(selectedOccurrence.occurrenceDate)} | {selectedOccurrence.startTime} - {selectedOccurrence.endTime}
                        </p>

                        <div className="flex gap-2">
                            <button
                                onClick={handleOpenOverrideModal}
                                className="flex-1 whitespace-nowrap px-4 py-3 rounded-lg border-2 border-[var(--color-main)] font-bold hover:bg-[var(--color-main)]/30 transition"
                            >
                                Edit selected
                            </button>

                            <button
                                onClick={handleEditWholeSeries}
                                className="flex-1 whitespace-nowrap px-4 py-3 rounded-lg border-2 border-[var(--color-secondary)] font-bold hover:bg-[var(--color-secondary)]/30 transition"
                            >
                                Edit all
                            </button>

                            <button
                                onClick={handleDeleteSelectedOccurrence}
                                className="flex-1 whitespace-nowrap px-4 py-3 rounded-lg border-2 border-[var(--color-alert)] bg-[var(--color-alert)] text-white font-bold hover:bg-white hover:text-[var(--color-alert)] transition"
                            >
                                Delete selected
                            </button>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={() => setOccurrenceActionModalOpen(false)}
                                className=" text-left px-4 py-3 rounded-lg border-2 border-[var(--color-main)] font-bold hover:bg-[var(--color-main)]/30 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <h3 className="font-bold text-[var(--color-text)] flex items-center gap-2">
                    <CalendarDays size={18} /> Active Classes
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-lg border border-[var(--color-main)] bg-white p-3">
                <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by course or room"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[var(--color-main)]"
                />

                <select
                    value={dayFilter}
                    onChange={(e) => setDayFilter(e.target.value as (typeof FILTER_DAY_OPTIONS)[number])}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[var(--color-main)]"
                >
                    {FILTER_DAY_OPTIONS.map((day) => (
                        <option key={day} value={day}>
                            {day === "ALL" ? "All Days" : day}
                        </option>
                    ))}
                </select>

                <select
                    value={timeFrom}
                    onChange={(e) => setTimeFrom(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[var(--color-main)]"
                >
                    {FILTER_TIME_OPTIONS.filter((opt) => opt.value < "22:00").map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            From {opt.label}
                        </option>
                    ))}
                </select>

                <select
                    value={timeTo}
                    onChange={(e) => setTimeTo(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[var(--color-main)]"
                >
                    {FILTER_TIME_OPTIONS.filter((opt) => opt.value > timeFrom).map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            To {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            {slots.length === 0 ? (
                <div className="p-10 text-center text-gray-500 border rounded-lg bg-white">
                    No class slots created yet.
                </div>
            ) : filteredSlots.length === 0 ? (
                <div className="p-10 text-center text-gray-500 border rounded-lg bg-white">
                    No class slots match your search/filter.
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
                        {filteredSlots.map((slot) => (
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
                                            onClick={() => setDeletingSlot(slot)}
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
                                        Date Range: {formatDateValue(slot.startDate)} {"→"} {formatDateValue(slot.endDate)}
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
                    <div className={`schedule-timeline rounded-lg overflow-hidden border border-[var(--color-main)] relative z-0 ${isAnyOverlayOpen ? "pointer-events-none select-none" : ""}`}>

                        {/* Day/week navigation controller */}
                        <div className="bg-[var(--color-main)] text-white text-sm font-medium px-4 py-2 flex items-center gap-2 flex-wrap">
                            <CalendarDays size={16} />
                            <span>Schedule Timeline</span>
                            <div className="flex items-center gap-1 rounded bg-white/15 p-1 ml-2">
                                <button
                                    onClick={() => setViewMode("day")}
                                    className={`px-2 py-1 rounded text-xs transition ${viewMode === "day"
                                        ? "bg-white text-[var(--color-main)]"
                                        : "text-white hover:bg-white/20"
                                        }`}
                                >
                                    Day
                                </button>
                                <button
                                    onClick={() => setViewMode("week")}
                                    className={`px-2 py-1 rounded text-xs transition ${viewMode === "week"
                                        ? "bg-white text-[var(--color-main)]"
                                        : "text-white hover:bg-white/20"
                                        }`}
                                >
                                    Week
                                </button>
                            </div>
                            <div className="ml-auto flex items-center gap-2">
                                <button
                                    onClick={prevPeriod}
                                    className="p-1 rounded hover:bg-white/20 transition"
                                    title={viewMode === "day" ? "Previous day" : "Previous week"}
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <span className="min-w-[170px] text-center font-semibold">
                                    {periodLabel}
                                </span>
                                <button
                                    onClick={nextPeriod}
                                    className="p-1 rounded hover:bg-white/20 transition"
                                    title={viewMode === "day" ? "Next day" : "Next week"}
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

                        <div className="w-full overflow-x-auto bg-white">
                            <div className={viewMode === "day" ? "min-w-[1400px]" : "min-w-[2600px]"}>
                                <Timeline
                                    groups={timelineGroups}
                                    items={timelineItems}
                                    selected={[]}
                                    keys={TIMELINE_KEYS}
                                    defaultTimeStart={visibleStart}
                                    defaultTimeEnd={visibleEnd}
                                    visibleTimeStart={visibleStart}
                                    visibleTimeEnd={visibleEnd}
                                    onTimeChange={handleTimeChange}
                                    onItemClick={handleItemClick}
                                    onItemDoubleClick={handleItemDoubleClick}
                                    itemRenderer={renderTimelineItem}
                                    sidebarWidth={190}
                                    lineHeight={104}
                                    itemHeightRatio={0.95}
                                    stackItems
                                    canMove={false}
                                    canResize={false}
                                    canSelect={false}
                                    dragSnap={15 * 60 * 1000}
                                >
                                    {viewMode === "day" && (
                                        <TimelineHeaders>
                                            <DateHeader unit="primaryHeader" labelFormat={dayPrimaryHeaderLabel} />
                                            <DateHeader unit="hour" labelFormat={dayTimeHeaderLabel} />
                                        </TimelineHeaders>
                                    )}
                                </Timeline>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
