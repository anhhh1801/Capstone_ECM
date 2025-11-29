"use client";

import { useEffect, useState } from "react";
import api from "@/utils/axiosConfig"; // Import trực tiếp api để gọi nhanh
import { Center, createCenter, getMyCenters } from "@/services/centerService";
import { Building2, Plus, Phone, Briefcase } from "lucide-react";
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

    const fetchData = async () => {
        try {
            const userStr = localStorage.getItem("user");
            if (!userStr) return;
            const user = JSON.parse(userStr);

            // Gọi song song 2 API: Quản lý & Giảng dạy
            const [resManaged, resTeaching] = await Promise.all([
                getMyCenters(user.id), // API cũ
                api.get(`/centers/teaching/${user.id}`) // API mới
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
            toast.success(status === "ACCEPTED" ? "Đã nhận lớp!" : "Đã từ chối!");
            fetchData(); // Load lại để cập nhật danh sách chính thức
        } catch (e) { toast.error("Lỗi"); }
    }

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

            toast.success("Tạo trung tâm thành công!");
            setShowForm(!showForm); // Ẩn form đi
            setFormData({ name: "", description: "", phoneNumber: "" }); // Reset form
            fetchData(); // Load lại danh sách
        } catch (error) {
            toast.error("Lỗi khi tạo trung tâm");
        }
    };

    // Hàm xóa (Gọi API Delete)
    const handleDelete = async (id: number) => {
        if (!confirm("Bạn có chắc muốn xóa trung tâm này?")) return;
        try {
            await api.delete(`/centers/${id}`);
            toast.success("Đã xóa!");
            fetchData();
        } catch (error) {
            toast.error("Không thể xóa (Có thể do đang có khóa học)");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Building2 className="text-blue-600" />
                    Quản lý Trung tâm
                </h1>
                {activeTab === "managed" && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition"
                    >
                        <Plus size={20} /> Thêm Trung tâm
                    </button>
                )}
            </div>

            {invitations.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 animate-pulse-once">
                    <h3 className="text-orange-800 font-bold flex items-center gap-2 mb-3">
                        🔔 Bạn có {invitations.length} lời mời giảng dạy mới!
                    </h3>
                    <div className="space-y-3">
                        {invitations.map(inv => (
                            <div key={inv.id} className="bg-white p-3 rounded-lg border flex justify-between items-center shadow-sm">
                                <div>
                                    <p className="font-bold text-gray-800">{inv.name} (Lớp {inv.grade})</p>
                                    <p className="text-sm text-gray-500">Tại: {inv.center?.name}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleRespond(inv.id, "ACCEPTED")}
                                        className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700"
                                    >
                                        Chấp nhận
                                    </button>
                                    <button
                                        onClick={() => handleRespond(inv.id, "REJECTED")}
                                        className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-300"
                                    >
                                        Từ chối
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Form tạo mới (Giữ nguyên logic ẩn hiện) */}
            {showForm && (
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-bold text-gray-800 mb-4">Nhập thông tin trung tâm mới</h3>
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2 md:col-span-1">
                            <label className="text-sm font-medium text-gray-700">Tên trung tâm</label>
                            <input
                                required
                                type="text"
                                className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="VD: Trung tâm Toán Thầy Ba"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Số điện thoại</label>
                            <input
                                type="text"
                                className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="0909..."
                                value={formData.phoneNumber}
                                onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-sm font-medium text-gray-700">Mô tả / Địa chỉ</label>
                            <textarea
                                className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                rows={2}
                                placeholder="Mô tả ngắn gọn..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2 text-right">
                            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium">
                                Lưu lại
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* TABS MENU */}
            <div className="flex border-b border-gray-200 gap-6">
                <button
                    onClick={() => setActiveTab("managed")}
                    className={`pb-3 font-medium flex items-center gap-2 border-b-2 transition ${activeTab === "managed" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <Building2 size={18} /> Của tôi quản lý ({managedCenters.length})
                </button>
                <button
                    onClick={() => setActiveTab("teaching")}
                    className={`pb-3 font-medium flex items-center gap-2 border-b-2 transition ${activeTab === "teaching" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <Briefcase size={18} /> Được mời dạy ({teachingCenters.length})
                </button>
            </div>

            {/* CONTENT */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loading ? <p>Đang tải...</p> : (
                    (activeTab === "managed" ? managedCenters : teachingCenters).map(center => (
                        <div key={center.id} className="bg-white p-6 rounded-xl shadow-sm border relative group">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold text-gray-800 line-clamp-1">
                                    {/* Bấm vào tên sẽ nhảy vào trang chi tiết */}
                                    <Link href={`/teacher/centers/${center.id}`} className="hover:text-blue-600 transition">
                                        {center.name}
                                    </Link>
                                </h3>
                                {/* Icon Link để người dùng biết là bấm được */}
                                <Link href={`/teacher/centers/${center.id}`} className="text-gray-400 hover:text-blue-600">
                                    <ExternalLink size={20} />
                                </Link>
                            </div>

                            <p className="text-sm text-gray-500 mb-4">{center.description}</p>

                            {/* Nếu là Tab Quản lý thì hiện nút Xóa/Sửa */}
                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                {activeTab === "managed" ? (
                                    <div className="flex gap-3 text-sm">
                                        <button className="text-blue-600 font-medium hover:underline">Sửa</button>
                                        <button onClick={() => handleDelete(center.id)} className="text-red-500 font-medium hover:underline">Xóa</button>
                                    </div>
                                ) : (
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                        Quản lý: {center.manager.lastName}
                                    </span>
                                )}

                                {/* NÚT TRUY CẬP CHÍNH */}
                                <Link
                                    href={`/teacher/centers/${center.id}`}
                                    className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-100 transition flex items-center gap-1"
                                >
                                    Truy cập <ExternalLink size={14} />
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}