"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { createStudentAuto } from "@/services/userService";

interface Props {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
	centerId: number;
}

export default function StudentModal({ isOpen, onClose, onSuccess, centerId }: Props) {
	const [loading, setLoading] = useState(false);
	const [form, setForm] = useState({
		firstName: "",
		lastName: "",
		phoneNumber: "",
		dateOfBirth: "",
	});

	useEffect(() => {
		if (!isOpen) return;
		setForm({
			firstName: "",
			lastName: "",
			phoneNumber: "",
			dateOfBirth: "",
		});
	}, [isOpen]);

	if (!isOpen) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			setLoading(true);
			await createStudentAuto({
				...form,
				centerId,
			});
			toast.success("Student created successfully.");
			onSuccess();
			onClose();
		} catch (error) {
			toast.error("Failed to create student.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-[2000] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
			<div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-5">
				<div className="flex justify-between items-center border-b pb-3">
					<h3 className="text-lg font-bold text-[var(--color-text)]">Create New Student</h3>
					<button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition">
						<X size={20} />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-[var(--color-text)] mb-1">Last Name</label>
							<input
								required
								value={form.lastName}
								onChange={(e) => setForm({ ...form, lastName: e.target.value })}
								className="w-full p-3 border-2 border-[var(--color-main)] rounded-lg outline-none"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-[var(--color-text)] mb-1">First Name</label>
							<input
								required
								value={form.firstName}
								onChange={(e) => setForm({ ...form, firstName: e.target.value })}
								className="w-full p-3 border-2 border-[var(--color-main)] rounded-lg outline-none"
							/>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-[var(--color-text)] mb-1">Phone Number</label>
						<input
							value={form.phoneNumber}
							onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
							className="w-full p-3 border-2 border-[var(--color-main)] rounded-lg outline-none"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-[var(--color-text)] mb-1">Date of Birth</label>
						<input
							type="date"
							required
							value={form.dateOfBirth}
							onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
							className="w-full p-3 border-2 border-[var(--color-main)] rounded-lg outline-none"
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
