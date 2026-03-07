"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import {
    createCenterGrade,
    updateCenterGrade,
    CenterGrade,
} from "@/services/centerService";

interface Props {
    centerId: number;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    grade?: CenterGrade | null;
}

export default function GradeModal({
    centerId,
    isOpen,
    onClose,
    onSuccess,
    grade,
}: Props) {

    const [fromAge, setFromAge] = useState<number | string>("");
    const [toAge, setToAge] = useState<number | string>("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (grade) {
            setFromAge(grade.fromAge ?? "");
            setToAge(grade.toAge ?? "");
            setName(grade.name);
            setDescription(grade.description || "");
        } else {
            setFromAge("");
            setToAge("");
            setName("");
            setDescription("");
        }
    }, [grade]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Grade name is required.");
            return;
        }

        const fromAgeNum = fromAge === "" ? undefined : Number(fromAge);
        const toAgeNum = toAge === "" ? undefined : Number(toAge);

        if (fromAgeNum != null && (fromAgeNum < 3 || fromAgeNum > 100)) {
            toast.error("From age must be between 3 and 100.");
            return;
        }

        if (toAgeNum != null && (toAgeNum < 3 || toAgeNum > 100)) {
            toast.error("To age must be between 3 and 100.");
            return;
        }

        if (fromAgeNum != null && toAgeNum != null && fromAgeNum > toAgeNum) {
            toast.error("From age must be less than or equal to To age.");
            return;
        }

        const payload = {
            name: name.trim(),
            fromAge: fromAgeNum,
            toAge: toAgeNum,
            description: description.trim(),
        };

        try {
            setLoading(true);

            if (grade) {
                await updateCenterGrade(centerId, grade.id, payload);
                toast.success("Grade updated successfully.");
            } else {
                await createCenterGrade(centerId, payload);
                toast.success("Grade created successfully.");
            }

            onSuccess();
            onClose();

        } catch (error) {
            console.error(error);
            toast.error("Operation failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-6">

                {/* Header */}
                <div className="flex justify-between items-center border-b pb-3">
                    <h2 className="text-lg font-bold text-[var(--color-text)]">
                        {grade ? "Edit Grade" : "Create Grade"}
                    </h2>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-4">

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                            Display Name
                        </label>
                        <input
                            required
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Example: Grade 10"
                            className="w-full p-3 border-2 border-[var(--color-main)] rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none bg-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">

                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                                From Age
                            </label>
                            <input
                                type="number"
                                min={3}
                                max={100}
                                value={fromAge}
                                onChange={(e) =>
                                    setFromAge(e.target.value === "" ? "" : Number(e.target.value))
                                }
                                className="w-full p-3 border-2 border-[var(--color-main)] rounded-lg outline-none bg-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                                To Age
                            </label>
                            <input
                                type="number"
                                min={3}
                                max={100}
                                value={toAge}
                                onChange={(e) =>
                                    setToAge(e.target.value === "" ? "" : Number(e.target.value))
                                }
                                className="w-full p-3 border-2 border-[var(--color-main)] rounded-lg outline-none bg-white"
                            />
                        </div>

                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                            Description
                        </label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-3 border-2 border-[var(--color-main)] rounded-lg outline-none bg-white"
                        />
                    </div>

                    {/* Footer */}
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