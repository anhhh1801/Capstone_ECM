"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, Edit2Icon, Plus, Trash2, Users, Wrench } from "lucide-react";
import toast from "react-hot-toast";
import {
	CenterClassroom,
	deleteCenterClassroom,
	getCenterClassrooms,
} from "@/services/centerService";
import ClassroomModal from "./ClassroomModal";

interface Props {
	centerId: number;
	isManager: boolean;
}

export default function ClassroomTab({ centerId, isManager }: Props) {
	const [classrooms, setClassrooms] = useState<CenterClassroom[]>([]);
	const [loading, setLoading] = useState(true);
	const [isModalOpen, setModalOpen] = useState(false);
	const [editingClassroom, setEditingClassroom] = useState<CenterClassroom | null>(null);

	const fetchClassrooms = useCallback(async () => {
		try {
			setLoading(true);
			const data = await getCenterClassrooms(centerId);
			setClassrooms(data);
		} catch (error) {
			console.error(error);
			toast.error("Cannot load classrooms.");
		} finally {
			setLoading(false);
		}
	}, [centerId]);

	useEffect(() => {
		fetchClassrooms();
	}, [fetchClassrooms]);

	const handleDelete = async (room: CenterClassroom) => {
		if (!confirm(`Delete classroom at "${room.location}"?`)) return;

		const userRaw = localStorage.getItem("user");
		const user = userRaw ? JSON.parse(userRaw) : null;
		const managerId = user?.id;

		if (!managerId) {
			toast.error("Cannot identify manager. Please login again.");
			return;
		}

		try {
			await deleteCenterClassroom(centerId, room.id, managerId);
			toast.success("Classroom deleted.");
			fetchClassrooms();
		} catch (error: any) {
			toast.error(error?.response?.data?.error || "Could not delete classroom.");
		}
	};

	if (loading) {
		return <div className="p-10 text-center text-[var(--color-text)]">Loading classrooms...</div>;
	}

	return (
		<div className="space-y-4">
			<ClassroomModal
				centerId={centerId}
				isOpen={isModalOpen}
				onClose={() => setModalOpen(false)}
				onSuccess={fetchClassrooms}
				classroom={editingClassroom}
			/>

			<div className="flex items-center justify-between">
				<h3 className="font-bold text-[var(--color-text)] flex items-center gap-2">
					<Building2 size={18} /> Classrooms
				</h3>

				{isManager && (
					<button
						onClick={() => {
							setEditingClassroom(null);
							setModalOpen(true);
						}}
						className="flex items-center gap-2 bg-[var(--color-main)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-secondary)] transition"
					>
						<Plus size={16} /> Add Classroom
					</button>
				)}
			</div>

			{classrooms.length === 0 ? (
				<div className="p-10 text-center text-gray-500 border rounded-lg bg-white">
					No classrooms created yet.
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
					{classrooms.map((room) => (
						<div
							key={room.id}
							className="bg-[var(--color-soft-white)] border border-[var(--color-main)] shadow-sm hover:shadow-md transition rounded-lg"
						>
							{isManager && (
								<div className="flex justify-end items-center gap-2 bg-[var(--color-main)] p-2 border-b border-[var(--color-main)] rounded-t-lg">
									<button
										onClick={() => {
											setEditingClassroom(room);
											setModalOpen(true);
										}}
										className="p-2 border-2 bg-[var(--color-secondary)] text-white border-[var(--color-secondary)] rounded hover:bg-white hover:text-[var(--color-secondary)] transition"
									>
										<Edit2Icon size={18} />
									</button>

									<button
										onClick={() => handleDelete(room)}
										className="p-2 border-2 border-[var(--color-alert)] bg-[var(--color-alert)] text-white rounded hover:bg-[var(--color-soft-white)] hover:text-[var(--color-alert)] transition"
									>
										<Trash2 size={18} />
									</button>
								</div>
							)}

							<div className="p-4 space-y-3">
								<div className="font-bold text-[var(--color-text)]">{room.location}</div>

								<div className="text-sm text-[var(--color-text)] flex items-center gap-2">
									<Users size={14} className="text-[var(--color-main)]" />
									Seat: {room.seat}
								</div>

								<div className="text-sm text-[var(--color-text)] flex items-center gap-2">
									<Wrench size={14} className="text-[var(--color-main)]" />
									Last Maintain: {room.lastMaintainDate}
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
