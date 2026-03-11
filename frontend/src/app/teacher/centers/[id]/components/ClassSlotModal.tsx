"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import {
	CenterClassroom,
	CenterClassSlot,
	ClassSlotPayload,
	createCenterClassSlot,
	updateCenterClassSlot,
} from "@/services/centerService";
import { Course, getCoursesByCenter } from "@/services/courseService";

interface Props {
	centerId: number;
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
	slot?: CenterClassSlot | null;
	classrooms: CenterClassroom[];
}

const WEEK_DAYS = [
	"MONDAY",
	"TUESDAY",
	"WEDNESDAY",
	"THURSDAY",
	"FRIDAY",
	"SATURDAY",
	"SUNDAY",
] as const;

export default function ClassSlotModal({ centerId, isOpen, onClose, onSuccess, slot, classrooms }: Props) {
	const [courses, setCourses] = useState<Course[]>([]);
	const [loading, setLoading] = useState(false);
	const [courseId, setCourseId] = useState<number | "">("");
	const [classroomId, setClassroomId] = useState<number | "">("");
	const [startTime, setStartTime] = useState("");
	const [endTime, setEndTime] = useState("");
	const [daysOfWeek, setDaysOfWeek] = useState<string[]>([]);
	const [recurring, setRecurring] = useState(true);

	useEffect(() => {
		if (!isOpen) return;
		const fetchCourses = async () => {
			try {
				const data = await getCoursesByCenter(centerId);
				setCourses(data);
			} catch (error) {
				console.error(error);
				toast.error("Cannot load courses.");
			}
		};
		fetchCourses();
	}, [isOpen, centerId]);

	useEffect(() => {
		if (!isOpen) return;

		if (slot) {
			setCourseId(slot.course?.id ?? "");
			setClassroomId(slot.classroom?.id ?? "");
			setStartTime(slot.startTime?.slice(0, 5) ?? "");
			setEndTime(slot.endTime?.slice(0, 5) ?? "");
			setDaysOfWeek(slot.daysOfWeek ?? []);
			setRecurring(Boolean(slot.isRecurring));
		} else {
			setCourseId("");
			setClassroomId("");
			setStartTime("");
			setEndTime("");
			setDaysOfWeek([]);
			setRecurring(true);
		}
	}, [isOpen, slot]);

	if (!isOpen) return null;

	const toggleDay = (day: string) => {
		setDaysOfWeek((prev) =>
			prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
		);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const userRaw = localStorage.getItem("user");
		const user = userRaw ? JSON.parse(userRaw) : null;
		const managerId = user?.id;

		if (!managerId) {
			toast.error("Cannot identify manager. Please login again.");
			return;
		}

		if (!courseId) {
			toast.error("Please select a course.");
			return;
		}

		if (!startTime || !endTime) {
			toast.error("Please select start and end time.");
			return;
		}

		if (daysOfWeek.length === 0) {
			toast.error("Please select at least one day.");
			return;
		}

		const payload: ClassSlotPayload = {
			managerId,
			courseId: Number(courseId),
			classroomId: classroomId ? Number(classroomId) : undefined,
			startTime,
			endTime,
			daysOfWeek,
			recurring,
		};

		try {
			setLoading(true);
			if (slot) {
				await updateCenterClassSlot(centerId, slot.id, payload);
				toast.success("Class slot updated.");
			} else {
				await createCenterClassSlot(centerId, payload);
				toast.success("Class slot created.");
			}
			onSuccess();
			onClose();
		} catch (error: any) {
			toast.error(error?.response?.data?.error || "Failed to save class slot.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
			<div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl p-6 space-y-5">
				<div className="flex items-center justify-between border-b pb-3">
					<h3 className="text-lg font-bold text-[var(--color-text)]">
						{slot ? "Edit Class Slot" : "Add Class Slot"}
					</h3>
					<button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition">
						<X size={20} />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-[var(--color-text)] mb-1">Course</label>
						<select
							value={courseId}
							onChange={(e) => setCourseId(e.target.value ? Number(e.target.value) : "")}
							className="w-full p-3 border-2 border-[var(--color-main)] rounded-lg outline-none bg-white"
							required
						>
							<option value="">Select course</option>
							{courses.map((course) => (
								<option key={course.id} value={course.id}>{course.name}</option>
							))}
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-[var(--color-text)] mb-1">Classroom (optional)</label>
						<select
							value={classroomId}
							onChange={(e) => setClassroomId(e.target.value ? Number(e.target.value) : "")}
							className="w-full p-3 border-2 border-[var(--color-main)] rounded-lg outline-none bg-white"
						>
							<option value="">No classroom</option>
							{classrooms.map((room) => (
								<option key={room.id} value={room.id}>
									{room.location} (seat {room.seat})
								</option>
							))}
						</select>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-[var(--color-text)] mb-1">Start Time</label>
							<input
								type="time"
								value={startTime}
								onChange={(e) => setStartTime(e.target.value)}
								className="w-full p-3 border-2 border-[var(--color-main)] rounded-lg outline-none"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-[var(--color-text)] mb-1">End Time</label>
							<input
								type="time"
								value={endTime}
								onChange={(e) => setEndTime(e.target.value)}
								className="w-full p-3 border-2 border-[var(--color-main)] rounded-lg outline-none"
								required
							/>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-[var(--color-text)] mb-2">Days of week</label>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
							{WEEK_DAYS.map((day) => (
								<label key={day} className="flex items-center gap-2 text-sm text-[var(--color-text)]">
									<input
										type="checkbox"
										checked={daysOfWeek.includes(day)}
										onChange={() => toggleDay(day)}
									/>
									{day.slice(0, 3)}
								</label>
							))}
						</div>
					</div>

					<label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
						<input
							type="checkbox"
							checked={recurring}
							onChange={(e) => setRecurring(e.target.checked)}
						/>
						Recurring
					</label>

					<div className="flex justify-end gap-3 pt-4 border-t">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={loading}
							className="bg-[var(--color-main)] border-2 border-[var(--color-main)] text-white px-4 py-2 rounded-lg font-bold hover:bg-[var(--color-soft-white)] hover:text-[var(--color-main)] transition disabled:opacity-50"
						>
							{loading ? "Saving..." : "Save"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
