"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/axiosConfig";
import toast, { Toaster } from "react-hot-toast";
import { User, Phone, Mail, Calendar, Save, AlertTriangle, ShieldAlert, Lock, X } from "lucide-react";

interface UserProfile {
    id: number;
    firstName: string;
    lastName: string;
    email: string; // Login email
    personalEmail: string; // Contact email
    phoneNumber: string;
    dateOfBirth: string;
    role: { name: string };
    avatarImg: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passData, setPassData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        dateOfBirth: ""
    });

    useEffect(() => {
        // 1. Get ID from localStorage
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            router.push("/login");
            return;
        }
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // 2. Initialize Form
        setFormData({
            firstName: parsedUser.firstName || "",
            lastName: parsedUser.lastName || "",
            phoneNumber: parsedUser.phoneNumber || "",
            dateOfBirth: parsedUser.dateOfBirth || ""
        });
        setLoading(false);
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSaving(true);

        try {
            const response = await api.put(`/users/${user.id}/profile`, formData);

            const updatedUser = { ...user, ...response.data };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);

            toast.success("Cập nhật thông tin thành công!");
        } catch (error: any) {
            toast.error("Lỗi khi cập nhật.");
        } finally {
            setSaving(false);
        }
    };

    // HANDLE DEACTIVATE ACCOUNT
    const handleDeactivate = async () => {
        if (!user) return;

        const confirm = window.confirm(
            "CẢNH BÁO: Bạn có chắc chắn muốn vô hiệu hóa tài khoản?\n\nBạn sẽ không thể đăng nhập lại cho đến khi liên hệ Admin để mở khóa."
        );

        if (!confirm) return;

        try {
            await api.post(`/users/${user.id}/deactivate`);

            toast.success("Tài khoản đã bị vô hiệu hóa.");

            // Clear data and kick to login
            localStorage.removeItem("user");
            setTimeout(() => {
                router.push("/login");
            }, 1500);

        } catch (error) {
            toast.error("Không thể vô hiệu hóa tài khoản.");
        }
    };

    const handleChangePassword = async () => {
        if (!user) return;

        if (!passData.oldPassword || !passData.newPassword) {
            toast.error("Vui lòng nhập đầy đủ thông tin.");
            return;
        }
        if (passData.newPassword !== passData.confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp!");
            return;
        }
        if (passData.newPassword.length < 6) {
            toast.error("Mật khẩu mới phải có ít nhất 6 ký tự.");
            return;
        }

        try {
            await api.put(`/users/${user.id}/change-password`, {
                oldPassword: passData.oldPassword,
                newPassword: passData.newPassword
            });

            toast.success("Đổi mật khẩu thành công!");
            setShowPasswordModal(false);
            setPassData({ oldPassword: "", newPassword: "", confirmPassword: "" }); // Reset form
        } catch (error: any) {
            const msg = error.response?.data || "Đổi mật khẩu thất bại.";
            toast.error(msg);
        }
    };

    if (loading) return <div className="p-8">Loading profile...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Toaster />

            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Thông tin cá nhân</h1>
                    <p className="text-gray-500 text-sm">Quản lý thông tin hiển thị và bảo mật</p>
                </div>
                <button
                    onClick={() => setShowPasswordModal(true)}
                    className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-black transition text-sm font-medium"
                >
                    <Lock size={16} /> Đổi mật khẩu
                </button>
            </div>

            {/* CARD 1: Basic Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        <User size={20} className="text-blue-600" />
                        Thông tin cơ bản
                    </h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                        {user?.role.name}
                    </span>
                </div>

                <form onSubmit={handleSave} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Họ</label>
                        <input
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    {/* Last Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
                        <input
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    {/* Email (Read Only) */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email đăng nhập</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                            <input
                                value={user?.email}
                                disabled
                                className="w-full p-2 pl-10 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Liên hệ Admin để thay đổi email.</p>
                    </div>

                    {/* Personal Email (Read Only) */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email cá nhân (Liên hệ)</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                            <input
                                value={user?.personalEmail || ""}
                                disabled
                                className="w-full p-2 pl-10 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                        <div className="relative">
                            <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                            <input
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="w-full p-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                        <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                className="w-full p-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="md:col-span-2 flex justify-end mt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
                        >
                            <Save size={18} />
                            {saving ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                    </div>
                </form>
            </div>

            {/* CARD 2: DANGER ZONE */}
            <div className="bg-red-50 rounded-xl shadow-sm border border-red-100 overflow-hidden">
                <div className="p-6 border-b border-red-100 flex items-center gap-2 text-red-700">
                    <ShieldAlert size={20} />
                    <h3 className="font-bold">Vùng nguy hiểm (Danger Zone)</h3>
                </div>
                <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h4 className="font-semibold text-gray-800">Vô hiệu hóa tài khoản</h4>
                        <p className="text-sm text-gray-500">
                            Tài khoản của bạn sẽ bị khóa ngay lập tức. Bạn sẽ không thể đăng nhập cho đến khi Admin kích hoạt lại.
                        </p>
                    </div>
                    <button
                        onClick={handleDeactivate}
                        className="flex items-center gap-2 bg-white border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm whitespace-nowrap"
                    >
                        <AlertTriangle size={18} />
                        Vô hiệu hóa ngay
                    </button>
                </div>
            </div>

            {showPasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-96 animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h3 className="text-lg font-bold">Đổi mật khẩu</h3>
                            <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-black"><X size={20} /></button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Mật khẩu cũ</label>
                                <input
                                    type="password"
                                    className="w-full p-2 border rounded focus:border-blue-500 outline-none"
                                    value={passData.oldPassword}
                                    onChange={(e) => setPassData({ ...passData, oldPassword: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Mật khẩu mới</label>
                                <input
                                    type="password"
                                    className="w-full p-2 border rounded focus:border-blue-500 outline-none"
                                    value={passData.newPassword}
                                    onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Nhập lại mật khẩu mới</label>
                                <input
                                    type="password"
                                    className="w-full p-2 border rounded focus:border-blue-500 outline-none"
                                    value={passData.confirmPassword}
                                    onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                                />
                            </div>

                            <button
                                onClick={handleChangePassword}
                                className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 mt-2"
                            >
                                Xác nhận đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}