"use client";

import { useState, useEffect } from "react";
import { X, Save, Building2, Plus, Trash2 } from "lucide-react";
import { createStudentAuto, updateStudent, assignStudentToCenter, removeStudentFromCenter } from "../../../../services/userService";
import { getMyCenters, Center } from "@/services/centerService";
import toast from "react-hot-toast";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void; // reload parent table data
    studentToEdit?: any;   // if present -> Edit mode
    preSelectedCenterId?: number; // used when creating a student inside a specific center
}

export default function StudentModal({ isOpen, onClose, onSuccess, studentToEdit, preSelectedCenterId }: Props) {
    const [centers, setCenters] = useState<Center[]>([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [form, setForm] = useState({
        firstName: "", lastName: "", phoneNumber: "", dateOfBirth: "", centerId: "" as any
    });

    // Load teacher's centers
    useEffect(() => {
        if (isOpen) {
            const fetchCenters = async () => {
                const user = JSON.parse(localStorage.getItem("user") || "{}");
                const res = await getMyCenters(user.id);
                setCenters(res);
            };
            fetchCenters();
        }
    }, [isOpen]);

    // Reset or fill data when opening the modal
    useEffect(() => {
        if (isOpen) {
                if (studentToEdit) {
                // EDIT MODE: Populate existing data into form
                setForm({
                    firstName: studentToEdit.firstName,
                    lastName: studentToEdit.lastName,
                    phoneNumber: studentToEdit.phoneNumber || "",
                    dateOfBirth: studentToEdit.dateOfBirth || "",
                    centerId: "" // Không dùng trong edit mode
                });
            } else {
                // CREATE MODE: Reset form
                setForm({
                    firstName: "", lastName: "", phoneNumber: "", dateOfBirth: "",
                    centerId: preSelectedCenterId || ""
                });
            }
        }
    }, [isOpen, studentToEdit, preSelectedCenterId]);

    if (!isOpen) return null;

    // Xử lý Submit (Tạo hoặc Sửa)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (studentToEdit) {
                // UPDATE
                await updateStudent(studentToEdit.id, form);
                toast.success("Updated successfully!");
            } else {
                // CREATE
                if (!form.centerId) {
                    toast.error("Please select a managing center!");
                    setLoading(false);
                    return;
                }
                await createStudentAuto(form);
                toast.success("Student created successfully!");
            }
            onSuccess();
            onClose();
        } catch (error) {
            toast.error("An error occurred!");
        } finally {
            setLoading(false);
        }
    };

    // Xử lý Thêm Center mới (Chỉ hiện khi Edit)
    const handleAddCenter = async (centerIdToAdd: number) => {
        try {
            await assignStudentToCenter(centerIdToAdd, studentToEdit.id);
            toast.success("Added to new center");
            onSuccess(); // Refresh parent list
        } catch (e) { toast.error("Error adding center"); }
    };

    // Xử lý Gỡ Center (Chỉ hiện khi Edit)
    const handleRemoveCenter = async (centerIdToRemove: number) => {
        if (!confirm("Remove student from this center?")) return;
        try {
            await removeStudentFromCenter(centerIdToRemove, studentToEdit.id);
            toast.success("Removed from center");
            onSuccess();
        } catch (e) { toast.error("Error removing center"); }
    };

    // Lọc ra những center mà học sinh CHƯA tham gia để hiện trong dropdown thêm
    const availableCenters = centers.filter(c =>
        !studentToEdit?.connectedCenters?.some((cc: any) => cc.id === c.id)
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="px-6 py-4 border-b bg-[var(--color-soft-white)] flex justify-between items-center sticky top-0 z-10">
                    <h3 className="font-bold text-lg text-[var(--color-text)]">
                        {studentToEdit ? "Edit Student Profile" : "Add New Student"}
                    </h3>
                    <button onClick={onClose}><X size={24} className="text-gray-400 hover:text-[var(--color-negative)]" /></button>
                </div>

                <div className="p-6 space-y-6">
                    {/* PERSONAL INFORMATION FORM */}
                    <form id="student-form" onSubmit={handleSubmit} className="space-y-4">
                        {/* Nếu là CREATE thì phải chọn Center. Nếu là EDIT thì ẩn đi */}
                        {!studentToEdit && (
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                                    Affiliated Center <span className="text-[var(--color-negative)]">*</span>
                                </label>
                                {preSelectedCenterId ? (
                                    <div className="w-full p-2 bg-gray-100 border border-gray-300 rounded-lg text-sm">(Selected current center)</div>
                                ) : (
                                    <select
                                        required
                                        className="w-full mt-1 p-2 border border-[var(--color-main)] rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
                                        value={form.centerId}
                                        onChange={e => setForm({ ...form, centerId: Number(e.target.value) })}
                                    >
                                        <option value="">-- Select a center --</option>
                                        {centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Last name</label>
                                <input required className="w-full p-2 border border-[var(--color-main)] rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">First name</label>
                                <input required className="w-full p-2 border border-[var(--color-main)] rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Phone Number</label>
                            <input className="w-full p-2 border border-[var(--color-main)] rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none" value={form.phoneNumber} onChange={e => setForm({ ...form, phoneNumber: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Date of Birth</label>
                            <input required type="date" className="w-full p-2 border border-[var(--color-main)] rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} />
                        </div>
                    </form>

                    {/* CENTER MANAGEMENT SECTION (ONLY SHOWN WHEN EDITING) */}
                    {studentToEdit && (
                        <div className="border-t pt-6">
                            <h4 className="font-bold text-[var(--color-text)] mb-3 flex items-center gap-2">
                                <Building2 size={18} /> Affiliated Centers
                            </h4>

                            {/* Current centers list */}
                            <div className="space-y-2 mb-4">
                                {studentToEdit.connectedCenters?.map((c: any) => (
                                    <div key={c.id} className="flex justify-between items-center bg-[var(--color-secondary)]/10 p-3 rounded-lg border border-[var(--color-secondary)]/20">
                                        <span className="text-sm font-medium text-[var(--color-text)]">{c.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveCenter(c.id)}
                                            className="text-[var(--color-negative)] hover:text-red-600 p-1"
                                            title="Remove from this center"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Add new center */}
                            {availableCenters.length > 0 && (
                                <div className="flex gap-2">
                                    <select
                                        id="add-center-select"
                                        className="flex-1 p-2 border border-[var(--color-main)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
                                    >
                                        {availableCenters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const select = document.getElementById('add-center-select') as HTMLSelectElement;
                                            handleAddCenter(Number(select.value));
                                        }}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition flex items-center gap-1"
                                    >
                                        <Plus size={16} /> Add
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t bg-[var(--color-soft-white)] flex justify-end gap-3 sticky bottom-0">
                    <button onClick={onClose} className="px-4 py-2 text-[var(--color-text)] hover:bg-gray-200 rounded font-medium transition">Cancel</button>
                    <button
                        form="student-form" type="submit" disabled={loading}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition disabled:bg-gray-400"
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}