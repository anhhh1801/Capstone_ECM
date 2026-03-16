import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, Loader2, Save, FileBox } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/utils/axiosConfig';

interface MaterialAddFormProps {
    courseId: number;
    classSessionId?: number; // Optional: If undefined, it's a general course material
    onSuccess: () => void;
    onCancel: () => void;
    btnLabel?: string;
}

export default function MaterialAddForm({
    courseId,
    classSessionId,
    onSuccess,
    onCancel,
    btnLabel = "Save Material"
}: MaterialAddFormProps) {
    const [file, setFile] = useState<File | null>(null);
    const [customName, setCustomName] = useState("");
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Handle File Drag & Drop
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            setFile(droppedFile);
            // Auto-fill the name field with the file name (without extension) if empty
            if (!customName) {
                setCustomName(droppedFile.name.split('.').slice(0, -1).join('.'));
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            if (!customName) {
                setCustomName(selectedFile.name.split('.').slice(0, -1).join('.'));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            toast.error("Please select a file to upload.");
            return;
        }

        setLoading(true);
        try {
            // CRITICAL: We MUST use FormData to send physical files
            const formData = new FormData();
            formData.append("file", file);
            formData.append("courseId", courseId.toString());

            // Send the custom name if the user provided one
            if (customName) {
                formData.append("fileName", customName);
            }

            if (classSessionId) {
                formData.append("classSessionId", classSessionId.toString());
            }

            // Send to Backend
            await api.post('/materials', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            toast.success("Material uploaded successfully!");
            setFile(null);
            setCustomName("");
            onSuccess();

        } catch (error: any) {
            console.error("Upload error:", error);
            const errorMessage = typeof error.response?.data === 'object'
                ? error.response?.data?.message
                : error.response?.data || "Failed to upload material.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-[var(--color-soft-white)] p-8 rounded-xl shadow-sm">

            {/* DISPLAY NAME INPUT */}
            <div>
                <label className="block text-sm font-bold text-[var(--color-text)] mb-2 flex items-center gap-2">
                    <FileBox size={16} className="text-[var(--color-main)]" />
                    Display Name <span className="text-[var(--color-negative)]">*</span>
                </label>
                <input
                    required
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full p-3 border-2 border-[var(--color-main)] rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none bg-white transition"
                    placeholder="e.g., Unit 1: Introduction to Grammar"
                />
                <p className="text-xs mt-2 text-[var(--color-text)]/70">
                    * This is the name students will see. It auto-fills when you select a file.
                </p>
            </div>

            {/* FILE UPLOAD ZONE */}
            <div>
                <label className="block text-sm font-bold text-[var(--color-text)] mb-2">
                    Upload File {classSessionId ? "(For Lesson)" : "(Course Syllabus/General)"} <span className="text-[var(--color-negative)]">*</span>
                </label>

                <div
                    className={`relative w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer
                        ${dragActive
                            ? "border-[var(--color-main)] bg-[var(--color-main)]/10 scale-[1.02]"
                            : "border-[var(--color-main)]/40 bg-white hover:border-[var(--color-main)] hover:bg-[var(--color-soft-white)]"}
                        ${file ? "border-green-500 bg-green-50 hover:border-green-600" : ""}
                    `}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        onChange={handleChange}
                        className="hidden"
                    />

                    {file ? (
                        <div className="flex flex-col items-center text-center p-4 animate-in fade-in zoom-in duration-300">
                            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3 shadow-sm">
                                <FileText size={28} />
                            </div>
                            <p className="font-bold text-[var(--color-text)] line-clamp-1 max-w-[250px]">{file.name}</p>
                            <p className="text-xs text-[var(--color-text)]/60 mt-1 font-medium">
                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setFile(null);
                                    setCustomName("");
                                }}
                                className="mt-4 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
                            >
                                <X size={14} /> Remove File
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-center p-4 pointer-events-none">
                            <div className="w-14 h-14 bg-[var(--color-soft-white)] text-[var(--color-main)] rounded-full flex items-center justify-center mb-4 shadow-sm">
                                <UploadCloud size={28} />
                            </div>
                            <p className="font-bold text-[var(--color-text)] text-base">Click to upload or drag and drop</p>
                            <p className="text-sm text-[var(--color-text)]/60 mt-1">PDF, DOCX, PPTX, MP4, or Images</p>
                            <p className="text-xs text-[var(--color-text)]/40 mt-2 font-medium">Maximum file size: 10MB</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="px-6 py-3 text-sm font-bold text-[var(--color-text)] rounded-lg border-2 border-transparent hover:bg-gray-100 transition disabled:opacity-50"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={!file || !customName || loading}
                    className="flex-1 sm:flex-none bg-[var(--color-main)] border-2 border-[var(--color-main)] text-white px-8 py-3 rounded-lg font-bold hover:bg-[var(--color-soft-white)] hover:text-[var(--color-main)] transition disabled:bg-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <Save size={20} /> {btnLabel}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}