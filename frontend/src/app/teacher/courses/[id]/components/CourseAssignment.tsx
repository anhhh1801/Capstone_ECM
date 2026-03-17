"use client";

import { useState, useEffect } from "react";
import {
    ClipboardList,
    Search,
    Plus,
    Download,
    Trash2,
    Loader2,
    X,
    Clock,
    Eye,
    Paperclip
} from "lucide-react";
import toast from "react-hot-toast";
import api from '@/utils/axiosConfig';
import AssignmentForm from "./AddAssignmentForm";
import AssignmentDetailModal from "./AssignmentDetail";

interface Props {
    courseId: number;
    readOnly?: boolean;
}

interface Assignment {
    id: number;
    title: string;
    description: string;
    dueDate: string;
    fileUrl: string | null;
    fileName: string | null;
    createdDate: string;
}

export default function CourseAssignments({ courseId, readOnly = false }: Props) {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [keyword, setKeyword] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // Modal Management
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Fetch assignments list from Backend
    const fetchAssignments = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/assignments/course/${courseId}`);
            setAssignments(response.data);
        } catch (error) {
            console.error("Error fetching assignments:", error);
            toast.error("Unable to load the assignments list.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (courseId) fetchAssignments();
    }, [courseId]);

    const formatDateTime = (dateString: string) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isOverdue = (dueDateStr: string) => {
        return new Date(dueDateStr).getTime() < new Date().getTime();
    };

    const filteredAssignments = assignments.filter((a) =>
        a.title.toLowerCase().includes(keyword.toLowerCase())
    );

    const executeDelete = async () => {
        if (confirmDeleteId === null) return;

        setDeletingId(confirmDeleteId);
        try {
            await api.delete(`/assignments/${confirmDeleteId}`);
            toast.success("Assignment deleted successfully!");
            setAssignments(assignments.filter(a => a.id !== confirmDeleteId));
        } catch (error) {
            console.error("Error deleting assignment:", error);
            toast.error("Error deleting assignment.");
        } finally {
            setDeletingId(null);
            setConfirmDeleteId(null);
        }
    };

    return (
        <div className="bg-[var(--color-soft-white)] rounded-xl border border-[var(--color-main)] shadow-sm mt-6 overflow-hidden">

            {/* --- 0. DELETE CONFIRMATION MODAL --- */}
            {confirmDeleteId !== null && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Assignment?</h3>
                        <p className="text-gray-600 text-sm mb-6">
                            Are you sure you want to delete this assignment? All student submissions will also be permanently deleted. This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmDeleteId(null)}
                                disabled={deletingId !== null}
                                className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeDelete}
                                disabled={deletingId !== null}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                            >
                                {deletingId !== null ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                {deletingId !== null ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- 1. VIEW DETAILS (AND EDIT) ASSIGNMENT MODAL --- */}
            {selectedAssignment && (
                <AssignmentDetailModal
                    courseId={courseId}
                    assignment={selectedAssignment}
                    readOnly={readOnly}
                    onClose={() => setSelectedAssignment(null)}
                    onRefresh={() => {
                        fetchAssignments();
                        setSelectedAssignment(null); // Close modal after saving successfully to see new data
                    }}
                />
            )}

            {/* --- 2. CREATE NEW ASSIGNMENT MODAL --- */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                            <h2 className="font-bold text-gray-800 text-lg">Create New Assignment</h2>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-gray-500 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <AssignmentForm
                            courseId={courseId}
                            onSuccess={() => {
                                setIsAddModalOpen(false);
                                fetchAssignments();
                            }}
                            onCancel={() => setIsAddModalOpen(false)}
                        />
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div className="bg-[var(--color-main)] text-white px-6 py-4 flex items-center justify-between font-semibold">
                <div className="flex items-center gap-2">
                    <ClipboardList size={18} />
                    Assignments & Quizzes ({assignments.length})
                </div>

                {!readOnly && (
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition text-sm font-bold"
                    >
                        <Plus size={16} /> Create Assignment
                    </button>
                )}
            </div>

            <div className="p-6">
                {/* SEARCH BAR */}
                <div className="mb-6 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Search size={16} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search assignments by title..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 text-sm border-2 border-[var(--color-main)] rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none transition"
                    />
                </div>

                {/* ASSIGNMENTS TABLE */}
                <div className="overflow-x-auto border border-[var(--color-main)] rounded-lg">
                    <table className="w-full text-left text-sm border-collapse bg-white">
                        <thead>
                            <tr className="bg-[var(--color-secondary)]/10 text-[var(--color-text)] border-b border-[var(--color-main)]">
                                <th className="p-4 font-semibold">Assignment Title</th>
                                <th className="p-4 font-semibold w-56">Due Date</th>
                                <th className="p-4 font-semibold w-32 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={3} className="text-center py-10">
                                        <Loader2 size={24} className="animate-spin text-[var(--color-main)] mx-auto mb-2" />
                                        <p className="text-gray-500">Loading assignments...</p>
                                    </td>
                                </tr>
                            ) : filteredAssignments.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="text-center text-gray-500 py-10 border-dashed">
                                        {keyword ? "No assignments match your search." : "No assignments have been created yet."}
                                    </td>
                                </tr>
                            ) : (
                                filteredAssignments.map((assignment) => {
                                    const overdue = isOverdue(assignment.dueDate);
                                    return (
                                        <tr
                                            key={assignment.id}
                                            className="border-b last:border-0 border-gray-200 hover:bg-[var(--color-secondary)]/5 transition group"
                                        >
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-bold text-[var(--color-text)] text-base">
                                                        {assignment.title}
                                                    </span>
                                                    {assignment.fileName && (
                                                        <a
                                                            href={assignment.fileUrl || "#"}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 text-xs text-blue-600 hover:underline w-fit"
                                                        >
                                                            <Paperclip size={12} /> {assignment.fileName}
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className={`flex items-center gap-1.5 font-medium ${overdue ? 'text-red-600' : 'text-gray-600'}`}>
                                                    <Clock size={16} className={overdue ? 'text-red-500' : 'text-[var(--color-main)]'} />
                                                    {formatDateTime(assignment.dueDate)}
                                                </div>
                                                {overdue && <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded uppercase mt-1 inline-block">Overdue</span>}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    {/* VIEW DETAILS BUTTON (Opens Modal) */}
                                                    <button
                                                        onClick={() => setSelectedAssignment(assignment)}
                                                        className="p-2 text-[var(--color-main)] hover:bg-[var(--color-main)]/10 rounded-lg transition"
                                                        title="View Details"
                                                    >
                                                        <Eye size={18} />
                                                    </button>

                                                    {/* DELETE BUTTON */}
                                                    {!readOnly && (
                                                        <button
                                                            onClick={() => setConfirmDeleteId(assignment.id)}
                                                            disabled={deletingId === assignment.id || confirmDeleteId === assignment.id}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                                            title="Delete Assignment"
                                                        >
                                                            {deletingId === assignment.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}