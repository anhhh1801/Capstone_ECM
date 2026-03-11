"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Clock3, Edit2Icon, Plus, Repeat2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import {
	CenterClassroom,
	CenterClassSlot,
	deleteCenterClassSlot,
	getCenterClassrooms,
	getCenterClassSlots,
} from "@/services/centerService";
import ClassSlotModal from "./ClassSlotModal";

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
									Date Range: {slot.startDate} {"->"} {slot.endDate}
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
			)}
		</div>
	);
}
