"use client";

import { useEffect, useState } from "react";
import api from "@/utils/axiosConfig";
import { Center, createCenter, getMyCenters } from "@/services/centerService";
import { Building2, Plus, Briefcase, Bell, SaveIcon, Edit2Icon, DeleteIcon, Delete, Trash } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Course, getInvitations, respondInvitation } from "@/services/courseService";

export default function CenterManagementPage() {
    const [managedCenters, setManagedCenters] = useState<Center[]>([]);
    const [teachingCenters, setTeachingCenters] = useState<Center[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"managed" | "teaching">("managed");
    const [invitations, setInvitations] = useState<Course[]>([]);

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: "", description: "", phoneNumber: "" });
    const [deleteTarget, setDeleteTarget] = useState<Center | null>(null);
    const [expandedCard, setExpandedCard] = useState<number | null>(null);

    const fetchData = async () => {
        try {
            const userStr = localStorage.getItem("user");
            if (!userStr) return;
            const user = JSON.parse(userStr);

            const [resManaged, resTeaching] = await Promise.all([
                getMyCenters(user.id),
                api.get(`/centers/teaching/${user.id}`)
            ]);

            setManagedCenters(resManaged);
            setTeachingCenters(resTeaching.data);

            const pendingInvites = await getInvitations(user.id);
            setInvitations(pendingInvites);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (courseId: number, status: "ACCEPTED" | "REJECTED") => {
        try {
            await respondInvitation(courseId, status);
            toast.success(status === "ACCEPTED" ? "Accepted!" : "Rejected!");
            fetchData();
        } catch {
            toast.error("Error responding to invitation");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const userStr = localStorage.getItem("user");
            if (!userStr) return;
            const user = JSON.parse(userStr);

            await createCenter({ ...formData, managerId: user.id });

            toast.success("Center created successfully!");
            setShowForm(false);
            setFormData({ name: "", description: "", phoneNumber: "" });
            fetchData();
        } catch {
            toast.error("Failed to create center. Please try again.");
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        try {
            await api.delete(`/centers/${deleteTarget.id}`);
            toast.success("Center deleted successfully!");
            setDeleteTarget(null);
            fetchData();
        } catch {
            toast.error("Failed to delete center (possibly has courses)");
        }
    };

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
                    <Building2 className="text-[var(--color-main)]" />
                    Manage Centers
                </h1>

                {activeTab === "managed" && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-[var(--color-main)] border-2 border-[var(--color-main)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-soft-white)] hover:text-[var(--color-main)] flex items-center gap-2 transition"
                    >
                        <Plus size={20} /> New Center
                    </button>
                )}
            </div>

            {/* Invitations */}
            {invitations.length > 0 && (
                <div className="bg-[var(--color-alert)]/10 border border-orange-200 rounded-xl p-4 mb-6">
                    <h3 className="text-[var(--color-alert)] font-bold mb-3">
                        <Bell className="inline" size={18} /> You have {invitations.length} new teaching invitations!
                    </h3>

                    <div className="space-y-3">
                        {invitations.map(inv => (
                            <div key={inv.id} className="bg-[var(--color-soft-white)] p-3 rounded-lg border border-[var(--color-alert)] flex justify-between items-center shadow-sm">
                                <div>
                                    <p className="font-bold text-[var(--color-text)]">
                                        {inv.name} (Grade {inv.grade ? inv.grade.name : "-"})
                                    </p>
                                    <p className="text-sm text-[var(--color-text)]">
                                        At: {inv.center?.name}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleRespond(inv.id, "ACCEPTED")}
                                        className="bg-[var(--color-main)] text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[var(--color-positive)] transition"
                                    >
                                        Accept
                                    </button>

                                    <button
                                        onClick={() => handleRespond(inv.id, "REJECTED")}
                                        className="bg-[var(--color-soft-white)] border-2 border-[var(--color-alert)] text-[var(--color-alert)] px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[var(--color-negative)] hover:text-white transition"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Create Form */}
            {showForm && (
                <div className="bg-[var(--color-soft-white)] p-6 rounded-xl border border-blue-100">
                    <h3 className="font-bold text-[var(--color-text)] mb-4">Enter new center information</h3>

                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="font-medium text-[var(--color-text)]">Center Name</label>
                            <input
                                required
                                type="text"
                                className="w-full mt-1 p-2 border border-[var(--color-main)] rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
                                placeholder="Example: Math Learning Center"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-[var(--color-text)]">Phone Number</label>
                            <input
                                type="text"
                                className="w-full mt-1 p-2 border border-[var(--color-main)] rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
                                placeholder="0909..."
                                value={formData.phoneNumber}
                                onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="text-sm font-medium text-[var(--color-text)]">Description / Address</label>
                            <textarea
                                className="w-full mt-1 p-2 border border-[var(--color-main)] rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
                                rows={2}
                                placeholder="Short description..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="col-span-2 text-right">
                            <button
                                type="submit"
                                className="bg-[var(--color-main)] border-2 border-[var(--color-main)] text-white px-4 py-2 rounded-lg font-bold hover:bg-[var(--color-soft-white)] hover:text-[var(--color-main)] transition disabled:opacity-50"
                            >
                                <SaveIcon className="inline" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Tabs */}
            <div className="bg-[var(--color-soft-white)] p-4 rounded-xl">
                <div className="flex border-b border-[var(--color-text)] gap-6">
                    <button
                        onClick={() => setActiveTab("managed")}
                        className={`px-4 py-2 font-medium flex items-center gap-2 border-b-4 border-r-2 transition
                        ${activeTab === "managed"
                                ? "border-[var(--color-main)] text-[var(--color-main)]"
                                : "border-transparent text-[var(--color-text)] hover:text-[var(--color-secondary)]"
                            }`}
                    >
                        <Building2 size={18} /> Managed by Me ({managedCenters.length})
                    </button>

                    <button
                        onClick={() => setActiveTab("teaching")}
                        className={`px-4 py-2 font-medium flex items-center gap-2 border-b-4 border-r-2 transition
                            ${activeTab === "teaching"
                                ? "border-[var(--color-main)] text-[var(--color-main)]"
                                : "border-transparent text-[var(--color-text)] hover:text-[var(--color-secondary)]"
                            }`}
                    >
                        <Briefcase size={18} /> Teaching At ({teachingCenters.length})
                    </button>
                </div>
            </div>

            {/* Delete Modal */}
            {deleteTarget && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                    onClick={() => setDeleteTarget(null)}
                >
                    <div
                        className="bg-white rounded-xl p-6 w-96 shadow-xl text-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-bold text-[var(--color-text)] mb-4">
                            Confirm Delete
                        </h3>

                        <p className="mb-6 text-gray-600">
                            Are you sure you want to delete center:
                            <br />
                            <span className="font-bold text-red-600">
                                {deleteTarget.name}
                            </span>
                            ?
                        </p>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="px-4 py-2 rounded-lg border-2 border-[var(--color-main)] bg-[var(--color-main)] text-white hover:bg-white hover:text-[var(--color-main)] transition"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 rounded-lg border-2 border-[var(--color-negative)] text-[var(--color-negative)] hover:bg-[var(--color-negative)] hover:text-white transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    (activeTab === "managed" ? managedCenters : teachingCenters).map(center => (
                        <div
                            key={center.id}
                            className="bg-[var(--color-soft-white)] p-4 rounded-xl shadow-sm border-2 border-[var(--color-main)] flex flex-col gap-3"
                        >
                            {/* TITLE */}
                            <div className="flex justify-between items-start gap-2">
                                <h3 className="text-2xl font-semibold text-[var(--color-text)] leading-snug min-w-0 flex-1 break-words">
                                    {center.name}
                                </h3>

                                <Link
                                    href={`/teacher/centers/${center.id}`}
                                    className="text-[var(--color-main)] hover:text-[var(--color-secondary)] shrink-0"
                                >
                                    <ExternalLink size={36} />
                                </Link>
                            </div>

                            {/* DESCRIPTION */}
                            <div>
                                <div
                                    className={`text-sm text-[var(--color-text)] leading-relaxed break-words ${expandedCard === center.id
                                        ? "max-h-28 overflow-y-auto"
                                        : "line-clamp-3"
                                        }`}
                                >
                                    {center.description || "No description provided."}
                                </div>

                                {center.description && center.description.length > 120 && (
                                    <button
                                        onClick={() =>
                                            setExpandedCard(
                                                expandedCard === center.id ? null : center.id
                                            )
                                        }
                                        className="text-blue-600 text-xs mt-1 hover:underline"
                                    >
                                        {expandedCard === center.id ? "Show less" : "Show more"}
                                    </button>
                                )}
                            </div>

                            {/* ACTIONS */}
                            <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
                                {activeTab === "managed" ? (
                                    <div className="flex gap-2">
                                        <button className="bg-[var(--color-secondary)] text-white font-medium hover:bg-[var(--color-soft-white)] hover:text-[var(--color-secondary)] border-2 p-2 rounded-lg">
                                            <Edit2Icon size={22} />
                                        </button>
                                        <button
                                            onClick={() => setDeleteTarget(center)}
                                            className="bg-[var(--color-alert)] text-white font-medium hover:bg-[var(--color-soft-white)] hover:text-[var(--color-alert)] border-2 p-2 rounded-lg">
                                            <Trash size={22} />
                                        </button>
                                    </div>
                                ) : (
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                        Manager: {center.manager.lastName}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}