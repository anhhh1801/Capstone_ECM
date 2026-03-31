"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDownAZ, ArrowUpZA, Building2, Edit2Icon, Plus, Search, Trash2, Users, Wrench } from "lucide-react";
import toast from "react-hot-toast";
import {
	CenterClassroom,
	deleteCenterClassroom,
	getCenterClassrooms,
} from "@/services/centerService";
import ClassroomModal from "./ClassroomModal";
import ConfirmModal from "@/components/ConfirmModal";
import { formatDateValue } from "@/utils/dateFormat";

interface Props {
	centerId: number;
	isManager: boolean;
}

export default function ClassroomTab({ centerId, isManager }: Props) {
	const rowsPerPage = 8;
	const [classrooms, setClassrooms] = useState<CenterClassroom[]>([]);
	const [loading, setLoading] = useState(true);
	const [isModalOpen, setModalOpen] = useState(false);
	const [editingClassroom, setEditingClassroom] = useState<CenterClassroom | null>(null);
	const [deletingClassroom, setDeletingClassroom] = useState<CenterClassroom | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [lastModifiedDateFilter, setLastModifiedDateFilter] = useState("");
	const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");
	const [currentPage, setCurrentPage] = useState(1);

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
			setDeletingClassroom(null);
			fetchClassrooms();
		} catch (error: any) {
				const responseData = error?.response?.data;
				const message =
					responseData?.error ||
					responseData?.message ||
					(typeof responseData === "string" ? responseData : null) ||
					"Could not delete classroom.";
				toast.error(message);
		}
	};

	const filteredClassrooms = useMemo(() => {
		const normalizedSearch = searchTerm.trim().toLowerCase();

		return classrooms
			.filter((room) => {
				const nameMatch = !normalizedSearch || room.location.toLowerCase().includes(normalizedSearch);
				const dateMatch = !lastModifiedDateFilter || room.lastMaintainDate === lastModifiedDateFilter;
				return nameMatch && dateMatch;
			})
			.sort((left, right) => {
				const leftTime = new Date(left.lastMaintainDate).getTime();
				const rightTime = new Date(right.lastMaintainDate).getTime();
				return sortDirection === "desc" ? rightTime - leftTime : leftTime - rightTime;
			});
	}, [classrooms, searchTerm, lastModifiedDateFilter, sortDirection]);

	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, lastModifiedDateFilter, sortDirection, classrooms]);

	const totalPages = Math.max(1, Math.ceil(filteredClassrooms.length / rowsPerPage));

	useEffect(() => {
		if (currentPage > totalPages) {
			setCurrentPage(totalPages);
		}
	}, [currentPage, totalPages]);

	const paginatedClassrooms = useMemo(() => {
		const startIndex = (currentPage - 1) * rowsPerPage;
		return filteredClassrooms.slice(startIndex, startIndex + rowsPerPage);
	}, [filteredClassrooms, currentPage]);

	if (loading) {
		return <div className="p-10 text-center text-[var(--color-text)]">Loading classrooms...</div>;
	}

	return (
		<div className="space-y-4">
			<ConfirmModal
				isOpen={!!deletingClassroom}
				title="Delete Classroom"
				message={`Delete classroom at "${deletingClassroom?.location || ""}"?`}
				confirmText="Delete"
				onClose={() => setDeletingClassroom(null)}
				onConfirm={() => (deletingClassroom ? handleDelete(deletingClassroom) : undefined)}
			/>

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

			<div className="grid grid-cols-1 gap-3 rounded-lg border border-[var(--color-main)] bg-white p-3 md:grid-cols-4">
				<div className="relative md:col-span-2">
					<Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-main)]" />
					<input
						value={searchTerm}
						onChange={(event) => setSearchTerm(event.target.value)}
						placeholder="Search by classroom name"
						className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-[var(--color-main)]"
					/>
				</div>

				<input
					type="date"
					value={lastModifiedDateFilter}
					onChange={(event) => setLastModifiedDateFilter(event.target.value)}
					className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[var(--color-main)]"
					title="Filter by last modified date"
				/>

				<button
					type="button"
					onClick={() => setSortDirection((value) => (value === "desc" ? "asc" : "desc"))}
					className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--color-main)] px-3 py-2 text-sm font-medium text-[var(--color-main)] transition hover:bg-[var(--color-main)] hover:text-white"
				>
					{sortDirection === "desc" ? <ArrowDownAZ size={16} /> : <ArrowUpZA size={16} />}
					{sortDirection === "desc" ? "Newest First" : "Oldest First"}
				</button>
			</div>

			{classrooms.length === 0 ? (
				<div className="p-10 text-center text-gray-500 border rounded-lg bg-white">
					No classrooms created yet.
				</div>
			) : filteredClassrooms.length === 0 ? (
				<div className="p-10 text-center text-gray-500 border rounded-lg bg-white">
					No classrooms match your search or date filter.
				</div>
			) : (
				<>
					<div className="overflow-x-auto rounded-lg border border-[var(--color-main)] bg-white">
						<table className="w-full text-left text-sm text-[var(--color-text)]">
							<thead className="bg-[var(--color-main)] text-white uppercase text-xs">
								<tr>
									<th className="px-6 py-4">Classroom Name</th>
									<th className="px-6 py-4">Seats</th>
									<th className="px-6 py-4">Last Modified Date</th>
									{isManager && <th className="px-6 py-4 text-right">Actions</th>}
								</tr>
							</thead>

							<tbody className="divide-y divide-[var(--color-main)]/15">
								{paginatedClassrooms.map((room) => (
									<tr key={room.id} className="hover:bg-[var(--color-main)]/5 transition">
										<td className="px-6 py-4 font-semibold">
											<div className="flex items-center gap-2">
												<Building2 size={16} className="text-[var(--color-main)]" />
												{room.location}
											</div>
										</td>
										<td className="px-6 py-4">
											<div className="flex items-center gap-2">
												<Users size={14} className="text-[var(--color-main)]" />
												{room.seat}
											</div>
										</td>
										<td className="px-6 py-4">
											<div className="flex items-center gap-2">
												<Wrench size={14} className="text-[var(--color-main)]" />
												{formatDateValue(room.lastMaintainDate)}
											</div>
										</td>
										{isManager && (
											<td className="px-6 py-4">
												<div className="flex justify-end items-center gap-2">
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
														onClick={() => setDeletingClassroom(room)}
														className="p-2 border-2 border-[var(--color-alert)] bg-[var(--color-alert)] text-white rounded hover:bg-[var(--color-soft-white)] hover:text-[var(--color-alert)] transition"
													>
														<Trash2 size={18} />
													</button>
												</div>
											</td>
										)}
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{filteredClassrooms.length > rowsPerPage && (
						<div className="flex flex-col gap-3 rounded-lg border border-[var(--color-main)] bg-white p-4 md:flex-row md:items-center md:justify-between">
							<p className="text-sm text-[var(--color-text)]">
								Showing {(currentPage - 1) * rowsPerPage + 1}
								{" - "}
								{Math.min(currentPage * rowsPerPage, filteredClassrooms.length)} of {filteredClassrooms.length} classrooms
							</p>

							<div className="flex items-center gap-2">
								<button
									onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
									disabled={currentPage === 1}
									className="rounded-lg border border-[var(--color-main)] px-3 py-2 text-sm font-medium text-[var(--color-main)] transition hover:bg-[var(--color-main)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[var(--color-main)]"
								>
									Previous
								</button>

								<span className="min-w-[90px] text-center text-sm font-semibold text-[var(--color-text)]">
									Page {currentPage} / {totalPages}
								</span>

								<button
									onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
									disabled={currentPage === totalPages}
									className="rounded-lg border border-[var(--color-main)] px-3 py-2 text-sm font-medium text-[var(--color-main)] transition hover:bg-[var(--color-main)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[var(--color-main)]"
								>
									Next
								</button>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
}
