"use client";

import { useState, useEffect, useRef } from "react";
import { X, Building2, Plus, Trash2 } from "lucide-react";
import {
    createStudentAuto,
    updateStudent,
    assignStudentToCenter,
    removeStudentFromCenter
} from "../../../../services/userService";
import { getMyCenters, Center } from "@/services/centerService";
import toast from "react-hot-toast";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    studentToEdit?: any;
    preSelectedCenterId?: number;
}

export default function StudentModal({
    isOpen,
    onClose,
    onSuccess,
    studentToEdit,
    preSelectedCenterId
}: Props) {

    const [centers, setCenters] = useState<Center[]>([]);
    const [loading, setLoading] = useState(false);
    const [connectedCenters, setConnectedCenters] = useState<any[]>([]);
    const originalConnectedCentersRef = useRef<any[]>([]);
    const [pendingAddCenterIds, setPendingAddCenterIds] = useState<number[]>([]);
    const [pendingRemoveCenterIds, setPendingRemoveCenterIds] = useState<number[]>([]);
    const [newCenterId, setNewCenterId] = useState<number | "">("");

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        dateOfBirth: "",
        centerId: "" as any
    });

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

    useEffect(() => {

        if (!isOpen) return;

        if (studentToEdit) {
            setForm({
                firstName: studentToEdit.firstName,
                lastName: studentToEdit.lastName,
                phoneNumber: studentToEdit.phoneNumber || "",
                dateOfBirth: studentToEdit.dateOfBirth || "",
                centerId: ""
            });

            const centers = studentToEdit.connectedCenters ?? [];
            setConnectedCenters(centers);
            originalConnectedCentersRef.current = centers;
            setPendingAddCenterIds([]);
            setPendingRemoveCenterIds([]);
            setNewCenterId("");
        } else {
            setForm({
                firstName: "",
                lastName: "",
                phoneNumber: "",
                dateOfBirth: "",
                centerId: preSelectedCenterId || ""
            });

            setConnectedCenters([]);
            originalConnectedCentersRef.current = [];
            setPendingAddCenterIds([]);
            setPendingRemoveCenterIds([]);
            setNewCenterId("");
        }

    }, [isOpen, studentToEdit, preSelectedCenterId]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();
        setLoading(true);

        try {

            if (studentToEdit) {

                await updateStudent(studentToEdit.id, form);
                toast.success("Student updated successfully.");

                // Apply pending center changes only when the user clicks Save
                if (pendingRemoveCenterIds.length) {
                    await Promise.all(
                        pendingRemoveCenterIds.map(id => removeStudentFromCenter(id, studentToEdit.id))
                    );
                }

                if (pendingAddCenterIds.length) {
                    await Promise.all(
                        pendingAddCenterIds.map(id => assignStudentToCenter(id, studentToEdit.id))
                    );
                }

            } else {

                if (!form.centerId) {
                    toast.error("Please select a center.");
                    setLoading(false);
                    return;
                }

                await createStudentAuto(form);
                toast.success("Student created successfully.");
            }

            onSuccess();
            onClose();

        } catch (error) {
            toast.error("Operation failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddCenter = (centerIdToAdd: number) => {
        const center = centers.find(c => c.id === centerIdToAdd);
        if (!center) return;

        setConnectedCenters(prev => [...prev, center]);
        setPendingAddCenterIds(prev => Array.from(new Set([...prev, centerIdToAdd])));
        setPendingRemoveCenterIds(prev => prev.filter(id => id !== centerIdToAdd));
        setNewCenterId("");
    };

    const handleRemoveCenter = (centerIdToRemove: number) => {
        if (!confirm("Remove student from this center?")) return;

        setConnectedCenters(prev => prev.filter(c => c.id !== centerIdToRemove));
        setPendingRemoveCenterIds(prev => Array.from(new Set([...prev, centerIdToRemove])));
        setPendingAddCenterIds(prev => prev.filter(id => id !== centerIdToRemove));
    };

    const availableCenters = centers.filter(c =>
        !connectedCenters.some((cc: any) => cc.id === c.id)
    );

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-6">

                {/* Header */}
                <div className="flex justify-between items-center border-b pb-3">

                    <h2 className="text-lg font-bold text-[var(--color-text)]">
                        {studentToEdit ? "Edit Student" : "Create Student"}
                    </h2>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 transition"
                    >
                        <X size={20} />
                    </button>

                </div>

                <form
                    id="student-form"
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >

                    {!studentToEdit && (

                        <div>

                            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                                Affiliated Center
                            </label>

                            {preSelectedCenterId ? (

                                <div className="p-3 border-2 border-[var(--color-main)] rounded-lg bg-[var(--color-soft-white)] text-sm">
                                    {centers.find((c) => c.id === preSelectedCenterId)?.name ?? "(loading...)"}
                                </div>

                            ) : (

                                <select
                                    required
                                    value={form.centerId}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            centerId: Number(e.target.value)
                                        })
                                    }
                                    className="w-full p-3 border-2 border-[var(--color-main)] rounded-lg outline-none bg-white"
                                >

                                    <option value="">
                                        Select center
                                    </option>

                                    {centers.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}

                                </select>
                            )}

                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">

                        <div>

                            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                                Last Name
                            </label>

                            <input
                                required
                                value={form.lastName}
                                onChange={(e) =>
                                    setForm({ ...form, lastName: e.target.value })
                                }
                                className="w-full p-3 border-2 border-[var(--color-main)] rounded-lg outline-none"
                            />

                        </div>

                        <div>

                            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                                First Name
                            </label>

                            <input
                                required
                                value={form.firstName}
                                onChange={(e) =>
                                    setForm({ ...form, firstName: e.target.value })
                                }
                                className="w-full p-3 border-2 border-[var(--color-main)] rounded-lg outline-none"
                            />

                        </div>

                    </div>

                    <div>

                        <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                            Phone Number
                        </label>

                        <input
                            value={form.phoneNumber}
                            onChange={(e) =>
                                setForm({ ...form, phoneNumber: e.target.value })
                            }
                            className="w-full p-3 border-2 border-[var(--color-main)] rounded-lg outline-none"
                        />

                    </div>

                    <div>

                        <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                            Date of Birth
                        </label>

                        <input
                            type="date"
                            required
                            value={form.dateOfBirth}
                            onChange={(e) =>
                                setForm({ ...form, dateOfBirth: e.target.value })
                            }
                            className="w-full p-3 border-2 border-[var(--color-main)] rounded-lg outline-none"
                        />

                    </div>

                    {studentToEdit && (

                        <div className="pt-4 border-t space-y-4">

                            <h4 className="font-bold text-[var(--color-text)] flex items-center gap-2">
                                <Building2 size={18} />
                                Affiliated Centers
                            </h4>

                            <div className="space-y-2">

                                {studentToEdit.connectedCenters?.map((c: any) => (

                                    <div
                                        key={c.id}
                                        className="flex justify-between items-center p-3 rounded-lg border-2 border-[var(--color-main)]/30 bg-[var(--color-soft-white)]"
                                    >

                                        <span className="text-sm font-medium text-[var(--color-text)]">
                                            {c.name}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() => handleRemoveCenter(c.id)}
                                            className="text-[var(--color-alert)] hover:text-red-600"
                                        >
                                            <Trash2 size={16} />
                                        </button>

                                    </div>

                                ))}

                            </div>

                            {availableCenters.length > 0 && (

                                <div className="flex gap-2">

                                    <select
                                        id="add-center-select"
                                        value={newCenterId}
                                        onChange={(e) =>
                                            setNewCenterId(e.target.value ? Number(e.target.value) : "")
                                        }
                                        className="w-full max-w-full min-w-0 p-3 border-2 border-[var(--color-main)] rounded-lg outline-none bg-white truncate"
                                    >

                                        <option value="">Select center</option>

                                        {availableCenters.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}

                                    </select>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!newCenterId) return;
                                            handleAddCenter(Number(newCenterId));
                                        }}
                                        className="flex items-center gap-1 bg-[var(--color-main)] border-2 border-[var(--color-main)] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[var(--color-soft-white)] hover:text-[var(--color-main)] transition"
                                    >
                                        <Plus size={16} />
                                        Add
                                    </button>

                                </div>

                            )}
                        </div>
                    )}

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