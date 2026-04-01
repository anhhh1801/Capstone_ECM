import { useEffect, useMemo, useState } from "react";
import { ShieldAlert, UserCog, UserPlus, Unlink, ChevronLeft, ChevronRight } from "lucide-react";
import { User } from "@/services/authService";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ConfirmModal";
import { unlinkTeacherFromCenter } from "@/services/centerService";
import InviteTeacherModal from "./InviteTeacherModal";

interface Props {
    centerId: number;
    teachers: User[];
    isManager: boolean;
    onUpdate: () => void;
}

export default function TeacherListTab({ centerId, teachers, isManager, onUpdate }: Props) {
    const teachersPerPage = 10;
    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const [unlinkTeacherId, setUnlinkTeacherId] = useState<number | null>(null);
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const managerId = useMemo(() => {
        const rawUser = localStorage.getItem("user");
        if (!rawUser) return null;
        try {
            const parsed = JSON.parse(rawUser);
            return Number(parsed?.id) || null;
        } catch {
            return null;
        }
    }, []);

    const filteredTeachers = useMemo(() => {
        const q = searchText.trim().toLowerCase();
        if (!q) return teachers;

        return teachers.filter((t) => {
            const fullName = `${t.firstName} ${t.lastName}`.toLowerCase();
            const email = (t.email || "").toLowerCase();
            return fullName.includes(q) || email.includes(q);
        });
    }, [teachers, searchText]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchText, teachers.length]);

    const totalPages = Math.max(1, Math.ceil(filteredTeachers.length / teachersPerPage));

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const paginatedTeachers = useMemo(() => {
        const startIndex = (currentPage - 1) * teachersPerPage;
        return filteredTeachers.slice(startIndex, startIndex + teachersPerPage);
    }, [currentPage, filteredTeachers]);

    const selectedTeacher = teachers.find((t) => t.id === unlinkTeacherId);

    const handleConfirmUnlink = async () => {
        if (!unlinkTeacherId) return;
        if (!managerId) {
            toast.error("Manager session not found");
            return;
        }

        try {
            await unlinkTeacherFromCenter(centerId, unlinkTeacherId, managerId);
            toast.success("Teacher unlinked. Their center courses were reassigned to manager.");
            setUnlinkTeacherId(null);
            onUpdate();
        } catch {
            toast.error("Failed to unlink teacher");
        }
    };

    if (!isManager) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-red-500 border border-red-100 bg-red-50 rounded-xl">
                <ShieldAlert size={48} className="mb-4" />
                <h3 className="font-bold">No access</h3>
                <p>Only center managers can view this section.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">

            <ConfirmModal
                isOpen={unlinkTeacherId !== null}
                title="Unlink Teacher"
                message={`Unlink ${selectedTeacher?.firstName || "this"} ${selectedTeacher?.lastName || "teacher"} from this center? All their courses in this center will be reassigned to the center manager.`}
                confirmText="Unlink"
                onClose={() => setUnlinkTeacherId(null)}
                onConfirm={handleConfirmUnlink}
            />

            <InviteTeacherModal
                courseId={null}
                centerId={centerId}
                isOpen={inviteModalOpen}
                onClose={() => setInviteModalOpen(false)}
                onSuccess={onUpdate}
            />

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-[var(--color-text)] flex items-center gap-2">
                    <UserCog size={18} /> Teachers
                    ({teachers.length})
                </h3>

                <button
                    onClick={() => setInviteModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-main)] text-white hover:bg-[var(--color-secondary)] transition"
                >
                    <UserPlus size={16} />
                    Invite Teacher
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
                <input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search teacher by name or email"
                    className="w-full p-3 border-2 border-[var(--color-main)] rounded-lg outline-none bg-white"
                />
            </div>

            {/* TABLE */}
            <div className="bg-[var(--color-soft-white)] border border-[var(--color-main)] rounded-xl shadow-sm overflow-hidden">

                {filteredTeachers.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        {teachers.length === 0 ? "No teachers found." : "No teachers match your search."}
                    </div>
                ) : (

                    <table className="w-full text-sm text-left">

                        {/* HEADER */}
                        <thead className="bg-[var(--color-main)] text-white text-xs uppercase">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Phone</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>

                        {/* BODY */}
                        <tbody className="divide-y divide-gray-100">

                            {paginatedTeachers.map((t) => (
                                <tr
                                    key={t.id}
                                    className="hover:bg-blue-50 transition"
                                >

                                    {/* NAME */}
                                    <td className="px-6 py-4 font-semibold text-[var(--color-text)]">
                                        {t.firstName} {t.lastName}
                                    </td>

                                    {/* EMAIL */}
                                    <td className="px-6 py-4 text-[var(--color-text)]">
                                        {t.email}
                                    </td>

                                    {/* PHONE */}
                                    <td className="px-6 py-4 text-gray-500">
                                        {t.phoneNumber || "---"}
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                        {managerId === t.id ? (
                                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-slate-300 text-slate-400 cursor-not-allowed">
                                                <Unlink size={14} />
                                                Owner
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => setUnlinkTeacherId(t.id)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-[var(--color-alert)] text-[var(--color-alert)] hover:bg-[var(--color-alert)] hover:text-white transition"
                                            >
                                                <Unlink size={14} />
                                                Unlink
                                            </button>
                                        )}
                                    </td>

                                </tr>
                            ))}

                        </tbody>

                    </table>

                )}

            </div>

            {filteredTeachers.length > 0 && (
                <div className="flex flex-col gap-3 rounded-2xl border border-[var(--color-main)]/15 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
                    <p className="text-sm text-[var(--color-text)]">
                        Showing {(currentPage - 1) * teachersPerPage + 1}
                        {" - "}
                        {Math.min(currentPage * teachersPerPage, filteredTeachers.length)} of {filteredTeachers.length} teachers
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                            disabled={currentPage === 1}
                            className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-main)] px-3 py-2 text-sm font-medium text-[var(--color-main)] transition hover:bg-[var(--color-main)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[var(--color-main)]"
                        >
                            <ChevronLeft size={16} />
                            Previous
                        </button>

                        <span className="min-w-[90px] text-center text-sm font-semibold text-[var(--color-text)]">
                            Page {currentPage} / {totalPages}
                        </span>

                        <button
                            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                            disabled={currentPage === totalPages}
                            className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-main)] px-3 py-2 text-sm font-medium text-[var(--color-main)] transition hover:bg-[var(--color-main)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[var(--color-main)]"
                        >
                            Next
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}