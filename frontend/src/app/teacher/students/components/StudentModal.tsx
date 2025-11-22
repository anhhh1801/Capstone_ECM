"use client";

import { useState, useEffect } from "react";
import { X, Save, Building2, Plus, Trash2 } from "lucide-react";
import { createStudentAuto, updateStudent, assignStudentToCenter, removeStudentFromCenter } from "../../../../services/userService";
import { getMyCenters, Center } from "@/services/centerService";
import toast from "react-hot-toast";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void; // Reload lại bảng dữ liệu
    studentToEdit?: any;   // Nếu có cái này -> Chế độ Edit
    preSelectedCenterId?: number; // Dùng cho chế độ tạo mới tại 1 center cụ thể
}

export default function StudentModal({ isOpen, onClose, onSuccess, studentToEdit, preSelectedCenterId }: Props) {
    const [centers, setCenters] = useState<Center[]>([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [form, setForm] = useState({
        firstName: "", lastName: "", phoneNumber: "", dateOfBirth: "", centerId: "" as any
    });

    // Load danh sách Center của giáo viên
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

    // Reset hoặc Fill dữ liệu khi mở Modal
    useEffect(() => {
        if (isOpen) {
            if (studentToEdit) {
                // CHẾ ĐỘ EDIT: Điền thông tin cũ vào form
                setForm({
                    firstName: studentToEdit.firstName,
                    lastName: studentToEdit.lastName,
                    phoneNumber: studentToEdit.phoneNumber || "",
                    dateOfBirth: studentToEdit.dateOfBirth || "",
                    centerId: "" // Không dùng trong edit mode
                });
            } else {
                // CHẾ ĐỘ CREATE: Reset form
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
                toast.success("Cập nhật thông tin thành công!");
            } else {
                // CREATE
                if (!form.centerId) {
                    toast.error("Vui lòng chọn trung tâm quản lý!");
                    setLoading(false);
                    return;
                }
                await createStudentAuto(form);
                toast.success("Tạo học sinh thành công!");
            }
            onSuccess();
            onClose();
        } catch (error) {
            toast.error("Có lỗi xảy ra!");
        } finally {
            setLoading(false);
        }
    };

    // Xử lý Thêm Center mới (Chỉ hiện khi Edit)
    const handleAddCenter = async (centerIdToAdd: number) => {
        try {
            await assignStudentToCenter(centerIdToAdd, studentToEdit.id);
            toast.success("Đã thêm vào trung tâm mới");
            onSuccess(); // Refresh lại list ở ngoài để cập nhật state studentToEdit (nếu cần logic phức tạp hơn thì phải fetch lại detail student)
        } catch (e) { toast.error("Lỗi thêm trung tâm"); }
    };

    // Xử lý Gỡ Center (Chỉ hiện khi Edit)
    const handleRemoveCenter = async (centerIdToRemove: number) => {
        if (!confirm("Gỡ học sinh khỏi trung tâm này?")) return;
        try {
            await removeStudentFromCenter(centerIdToRemove, studentToEdit.id);
            toast.success("Đã gỡ khỏi trung tâm");
            onSuccess();
        } catch (e) { toast.error("Lỗi gỡ trung tâm"); }
    };

    // Lọc ra những center mà học sinh CHƯA tham gia để hiện trong dropdown thêm
    const availableCenters = centers.filter(c =>
        !studentToEdit?.connectedCenters?.some((cc: any) => cc.id === c.id)
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center sticky top-0 z-10">
                    <h3 className="font-bold text-lg text-gray-800">
                        {studentToEdit ? "Chỉnh sửa Hồ sơ" : "Thêm Học viên Mới"}
                    </h3>
                    <button onClick={onClose}><X size={24} className="text-gray-400 hover:text-red-500" /></button>
                </div>

                <div className="p-6 space-y-6">
                    {/* FORM THÔNG TIN CÁ NHÂN */}
                    <form id="student-form" onSubmit={handleSubmit} className="space-y-4">
                        {/* Nếu là CREATE thì phải chọn Center. Nếu là EDIT thì ẩn đi */}
                        {!studentToEdit && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Thuộc Trung tâm <span className="text-red-500">*</span>
                                </label>
                                {preSelectedCenterId ? (
                                    <div className="p-2 bg-gray-100 border rounded text-sm">(Đã chọn trung tâm hiện tại)</div>
                                ) : (
                                    <select
                                        required
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                        value={form.centerId}
                                        onChange={e => setForm({ ...form, centerId: Number(e.target.value) })}
                                    >
                                        <option value="">-- Chọn trung tâm --</option>
                                        {centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Họ</label>
                                <input required className="w-full p-2 border rounded" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Tên</label>
                                <input required className="w-full p-2 border rounded" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">SĐT</label>
                            <input className="w-full p-2 border rounded" value={form.phoneNumber} onChange={e => setForm({ ...form, phoneNumber: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Ngày sinh</label>
                            <input required type="date" className="w-full p-2 border rounded" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} />
                        </div>
                    </form>

                    {/* PHẦN QUẢN LÝ CENTER (CHỈ HIỆN KHI EDIT) */}
                    {studentToEdit && (
                        <div className="border-t pt-6">
                            <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                                <Building2 size={18} /> Trung tâm trực thuộc
                            </h4>

                            {/* Danh sách center hiện tại */}
                            <div className="space-y-2 mb-4">
                                {studentToEdit.connectedCenters?.map((c: any) => (
                                    <div key={c.id} className="flex justify-between items-center bg-blue-50 p-2 rounded border border-blue-100">
                                        <span className="text-sm font-medium text-blue-800">{c.name}</span>
                                        {/* Nút gỡ (Chỉ cho gỡ nếu còn nhiều hơn 1 center, hoặc tùy logic) */}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveCenter(c.id)}
                                            className="text-red-400 hover:text-red-600 p-1"
                                            title="Gỡ khỏi trung tâm này"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Thêm center mới */}
                            {availableCenters.length > 0 && (
                                <div className="flex gap-2">
                                    <select
                                        id="add-center-select"
                                        className="flex-1 p-2 border rounded text-sm"
                                    >
                                        {availableCenters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const select = document.getElementById('add-center-select') as HTMLSelectElement;
                                            handleAddCenter(Number(select.value));
                                        }}
                                        className="bg-green-600 text-white px-3 py-2 rounded text-sm font-bold hover:bg-green-700 flex items-center gap-1"
                                    >
                                        <Plus size={16} /> Thêm
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 sticky bottom-0">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded font-medium">Hủy</button>
                    <button
                        form="student-form" type="submit" disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 transition disabled:bg-gray-400"
                    >
                        {loading ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                </div>
            </div>
        </div>
    );
}