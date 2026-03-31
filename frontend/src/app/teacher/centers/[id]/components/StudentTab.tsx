"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Mail, Phone, Unlink, UserPlus, Users, Search, Filter, Plus } from "lucide-react";
import { User } from "@/services/authService";
import { removeStudentFromCenter } from "@/services/userService";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ConfirmModal";
import AssignStudentModal from "./AssignStudentModal";
import StudentModal from "./StudentModal";

type StudentCenterCard = User & {
	courses: { id: number; name: string }[];
};

interface Props {
	centerId: number;
	students: StudentCenterCard[];
	isManager: boolean;
	onUpdate: () => void;
}

export default function StudentTab({ centerId, students, isManager, onUpdate }: Props) {
	const [searchName, setSearchName] = useState("");
	const [selectedCourseId, setSelectedCourseId] = useState("ALL");
	const [isAssignModalOpen, setAssignModalOpen] = useState(false);
	const [isCreateModalOpen, setCreateModalOpen] = useState(false);
	const [removingStudent, setRemovingStudent] = useState<StudentCenterCard | null>(null);

	const courseOptions = useMemo(() => {
		const map = new Map<number, string>();
		students.forEach((student) => {
			student.courses.forEach((course) => {
				map.set(course.id, course.name);
			});
		});

		return Array.from(map.entries())
			.map(([id, name]) => ({ id, name }))
			.sort((a, b) => a.name.localeCompare(b.name));
	}, [students]);

	const filteredStudents = useMemo(() => {
		const q = searchName.trim().toLowerCase();

		return students.filter((student) => {
			const firstName = (student.firstName || "").trim().toLowerCase();
			const lastName = (student.lastName || "").trim().toLowerCase();
			const fullName = `${lastName} ${firstName}`.trim();
			const reverseFullName = `${firstName} ${lastName}`.trim();
			const matchName =
				q.length === 0 ||
				fullName.includes(q) ||
				reverseFullName.includes(q) ||
				firstName.includes(q) ||
				lastName.includes(q);
			const matchCourse =
				selectedCourseId === "ALL" ||
				student.courses.some((course) => String(course.id) === selectedCourseId);

			return matchName && matchCourse;
		});
	}, [students, searchName, selectedCourseId]);

	const handleRemoveStudent = async (studentId: number) => {
		try {
			await removeStudentFromCenter(centerId, studentId);
			toast.success("Student removed from center.");
			setRemovingStudent(null);
			onUpdate();
		} catch {
			toast.error("Error removing student.");
		}
	};

	return (
		<div className="space-y-4">
			<ConfirmModal
				isOpen={!!removingStudent}
				title="Remove Student"
				message={`Remove "${removingStudent?.lastName || ""} ${removingStudent?.firstName || ""}" from this center?`}
				confirmText="Remove"
				onClose={() => setRemovingStudent(null)}
				onConfirm={() => (removingStudent ? handleRemoveStudent(removingStudent.id) : undefined)}
			/>

			<StudentModal
				isOpen={isCreateModalOpen}
				onClose={() => setCreateModalOpen(false)}
				onSuccess={onUpdate}
				centerId={centerId}
			/>

			<AssignStudentModal
				isOpen={isAssignModalOpen}
				onClose={() => setAssignModalOpen(false)}
				centerId={centerId}
				onSuccess={onUpdate}
			/>

			<div className="flex justify-between items-center gap-3 flex-wrap">
				<h3 className="font-bold text-[var(--color-text)] flex items-center gap-2">
					<Users size={18} className="text-[var(--color-main)]" />
					Student List ({filteredStudents.length})
				</h3>

				{isManager && (
					<div className="flex gap-2 flex-wrap">
						<button
							onClick={() => setAssignModalOpen(true)}
							className="flex items-center gap-2 whitespace-nowrap border-2 border-[var(--color-main)] text-[var(--color-main)] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-main)] hover:text-white transition"
						>
							<UserPlus size={16} />
							Assign Existing Student
						</button>

						<button
							onClick={() => setCreateModalOpen(true)}
							className="flex items-center gap-2 whitespace-nowrap bg-[var(--color-main)] border-2 border-[var(--color-main)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-soft-white)] hover:text-[var(--color-main)] transition"
						>
							<Plus size={16} />
							Create New Student
						</button>
					</div>
				)}
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
				<div className="relative md:col-span-2">
					<Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
					<input
						value={searchName}
						onChange={(e) => setSearchName(e.target.value)}
						placeholder="Search by student name"
						className="w-full pl-9 pr-3 py-2 border-2 border-[var(--color-main)] rounded-lg outline-none bg-white"
					/>
				</div>

				<div className="relative">
					<Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
					<select
						value={selectedCourseId}
						onChange={(e) => setSelectedCourseId(e.target.value)}
						className="w-full pl-9 pr-3 py-2 border-2 border-[var(--color-main)] rounded-lg outline-none bg-white"
					>
						<option value="ALL">All Courses</option>
						{courseOptions.map((course) => (
							<option key={course.id} value={course.id}>{course.name}</option>
						))}
					</select>
				</div>
			</div>

			{filteredStudents.length === 0 ? (
				<div className="p-10 text-center text-gray-500 border rounded-lg bg-white">
					{students.length === 0 ? "No students in this center yet." : "No students match your filters."}
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
					{filteredStudents.map((student) => (
						<div
							key={student.id}
							className="rounded-xl border border-[var(--color-main)]/30 bg-white p-4"
						>
							<div className="flex items-start justify-between gap-3 border-b-2 border-[var(--color-main)] pb-1">
								<div>
									<h4 className="font-bold text-[var(--color-text)]">
										{student.lastName} {student.firstName}
									</h4>
									<p className="text-xs text-gray-500">ID: {student.id}</p>
								</div>

								{isManager && (
									<button
										onClick={() => setRemovingStudent(student)}
										className="p-2 border-2 border-[var(--color-alert)] bg-[var(--color-alert)] text-white rounded hover:bg-[var(--color-soft-white)] hover:text-[var(--color-alert)] transition"
										title="Remove from center"
									>
										<Unlink size={16} />
									</button>
								)}
							</div>

							<div className="mt-3 space-y-2 text-sm text-[var(--color-text)]">
								<div className="flex items-center gap-2">
									<Mail size={14} className="text-[var(--color-main)]" />
									<span>{student.email}</span>
								</div>

								<div className="flex items-center gap-2">
									<Phone size={14} className="text-[var(--color-main)]" />
									<span>{student.phoneNumber || "---"}</span>
								</div>
							</div>

							<div className="mt-4">
								<p className="text-sm font-semibold text-[var(--color-text)] mb-2 flex items-center gap-2">
									<BookOpen size={14} className="text-[var(--color-main)]" />
									Courses
								</p>

								{student.courses.length > 0 ? (
									<div className="flex flex-wrap gap-2">
										{student.courses.map((course) => (
											<Link
												key={course.id}
												href={`/teacher/courses/${course.id}`}
												className="inline-flex items-center px-2 py-1 rounded text-xs font-medium border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 text-[var(--color-main)] hover:bg-[var(--color-main)] hover:text-white transition"
											>
												{course.name}
											</Link>
										))}
									</div>
								) : (
									<p className="text-xs italic text-gray-400">No courses</p>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
