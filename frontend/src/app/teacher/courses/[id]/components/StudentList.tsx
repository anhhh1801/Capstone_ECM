"use client";

import { useEffect, useState } from "react";
import { User as UserIcon } from "lucide-react";
import toast from "react-hot-toast";
import { getStudentsInCourse } from "@/services/courseService";

interface Props {
	courseId: number;
}

export default function StudentList({ courseId }: Props) {
	const [students, setStudents] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchStudents = async () => {
			try {
				setLoading(true);
				const data = await getStudentsInCourse(courseId);
				setStudents(Array.isArray(data) ? data : []);
			} catch (error) {
				console.error(error);
				toast.error("Cannot load students.");
			} finally {
				setLoading(false);
			}
		};

		fetchStudents();
	}, [courseId]);

	if (loading) {
		return <div className="p-6 text-center text-[var(--color-text)]">Loading students...</div>;
	}

	return (
		<div className="bg-[var(--color-soft-white)] rounded-xl border border-[var(--color-main)] shadow-sm mt-6 overflow-hidden">
			<div className="bg-[var(--color-main)] text-white px-6 py-4 flex items-center gap-2 font-semibold">
				<UserIcon size={18} />
				Students ({students.length})
			</div>

			<div className="p-6">
				{students.length === 0 ? (
					<div className="text-center text-gray-500 py-6 border border-dashed rounded-lg">
						No students in this course yet
					</div>
				) : (
					<div className="space-y-2">
						{students.map((student) => (
							<div
								key={student.id}
								className="flex justify-between items-center p-3 border border-[var(--color-main)] rounded-lg hover:bg-[var(--color-secondary)]/10 transition"
							>
								<div className="flex items-center gap-3">
									<div className="w-9 h-9 rounded-full bg-[var(--color-secondary)]/20 text-[var(--color-main)] flex items-center justify-center font-bold text-sm">
										{student.lastName?.charAt(0) || "?"}
									</div>

									<div>
										<p className="font-semibold text-[var(--color-text)]">
											{student.lastName} {student.firstName}
										</p>

										<p className="text-xs text-[var(--color-alert)]">
											{student.email}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

