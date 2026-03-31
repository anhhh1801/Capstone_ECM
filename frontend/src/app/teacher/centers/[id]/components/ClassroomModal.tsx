"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
	CenterClassroom,
	ClassroomPayload,
	createCenterClassroom,
	updateCenterClassroom,
} from "@/services/centerService";
import toast from "react-hot-toast";

interface Props {
	centerId: number;
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
	classroom?: CenterClassroom | null;
}

export default function ClassroomModal({
	centerId,
	isOpen,
	onClose,
	onSuccess,
	classroom,
}: Props) {
	const [loading, setLoading] = useState(false);
	const [seat, setSeat] = useState<number | "">("");
	const [location, setLocation] = useState("");
	const [lastMaintainDate, setLastMaintainDate] = useState("");

	useEffect(() => {
		if (!isOpen) return;

		if (classroom) {
			setSeat(classroom.seat);
			setLocation(classroom.location);
			setLastMaintainDate(classroom.lastMaintainDate);
		} else {
			setSeat("");
			setLocation("");
			setLastMaintainDate("");
		}
	}, [isOpen, classroom]);

	if (!isOpen) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const userRaw = localStorage.getItem("user");
		const user = userRaw ? JSON.parse(userRaw) : null;
		const managerId = user?.id;

		if (!managerId) {
			toast.error("Cannot identify manager. Please login again.");
			return;
		}

		if (!seat || seat <= 0) {
			toast.error("Seat must be at least 1.");
			return;
		}

		if (!location.trim()) {
			toast.error("Location is required.");
			return;
		}

		if (!lastMaintainDate) {
			toast.error("Last maintain date is required.");
			return;
		}

		const payload: ClassroomPayload = {
			seat: Number(seat),
			location: location.trim(),
			lastMaintainDate,
			managerId,
		};

		try {
			setLoading(true);
			if (classroom) {
				await updateCenterClassroom(centerId, classroom.id, payload);
				toast.success("Classroom updated.");
			} else {
				await createCenterClassroom(centerId, payload);
				toast.success("Classroom created.");
			}

			onSuccess();
			onClose();
		} catch (error: any) {
			toast.error(error?.response?.data?.error || "Failed to save classroom.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
			<div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-5">
				<div className="flex items-center justify-between border-b pb-3">
					<h3 className="text-lg font-bold text-[var(--color-text)]">
						{classroom ? "Edit Classroom" : "Add Classroom"}
					</h3>
					<button
						onClick={onClose}
						className="p-2 rounded-lg hover:bg-gray-100 transition"
					>
						<X size={20} />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-[var(--color-text)] mb-1">Seat <span className="text-[var(--color-negative)]">*</span></label>
						<input
							type="number"
							min={1}
							value={seat}
							onChange={(e) => setSeat(e.target.value ? Number(e.target.value) : "")}
							className="w-full p-3 border-2 border-[var(--color-main)] rounded-lg outline-none"
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-[var(--color-text)] mb-1">Location <span className="text-[var(--color-negative)]">*</span></label>
						<input
							value={location}
							onChange={(e) => setLocation(e.target.value)}
							className="w-full p-3 border-2 border-[var(--color-main)] rounded-lg outline-none"
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-[var(--color-text)] mb-1">Last Maintain Date <span className="text-[var(--color-negative)]">*</span></label>
						<input
							type="date"
							value={lastMaintainDate}
							onChange={(e) => setLastMaintainDate(e.target.value)}
							className="w-full p-3 border-2 border-[var(--color-main)] rounded-lg outline-none"
							required
						/>
					</div>

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
