import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { Course, inviteTeacher, deleteCourse } from "@/services/courseService";
import toast from "react-hot-toast";

interface Props {
    courses: Course[];
    centerId: number;
    isManager: boolean;
    onUpdate: () => void; // Callback để reload list khi xóa
}

export default function CourseListTab({ courses, centerId, isManager, onUpdate }: Props) {

    const handleDelete = async (courseId: number) => {
        if (!confirm("Xóa khóa học này?")) return;
        try {
            await deleteCourse(courseId);
            toast.success("Đã xóa!");
            onUpdate();
        } catch (error) {
            toast.error("Lỗi khi xóa");
        }
    };

    const handleInvite = async (courseId: number) => {
        const email = prompt("Nhập email giáo viên muốn mời:");
        if (email) {
            try {
                await inviteTeacher(courseId, email);
                toast.success("Đã gửi lời mời!");
            } catch (e) { toast.error("Lỗi gửi lời mời"); }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-700">
                    {isManager ? "Tất cả khóa học" : "Khóa học bạn phụ trách"}
                </h3>
                {isManager && (
                    <Link
                        href={`/teacher/courses/create?centerId=${centerId}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-blue-700 transition"
                    >
                        <Plus size={16} /> Tạo khóa học mới
                    </Link>
                )}
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 font-semibold text-gray-700 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3">Tên khóa</th>
                            <th className="px-6 py-3">Môn</th>
                            <th className="px-6 py-3">Lớp</th>
                            {isManager && <th className="px-6 py-3">Giáo viên</th>}
                            <th className="px-6 py-3 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {courses.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-6 text-center text-gray-500">
                                    {isManager ? "Chưa có khóa học nào" : "Bạn chưa được phân công lớp nào"}
                                </td>
                            </tr>
                        ) : (
                            courses.map((course) => (
                                <tr key={course.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-3 font-medium text-blue-600">{course.name}</td>
                                    <td className="px-6 py-3">{course.subject}</td>
                                    <td className="px-6 py-3">{course.grade}</td>
                                    {isManager && (
                                        <td className="px-6 py-3">
                                            <div className="flex flex-col">
                                                <span>{course.teacher?.lastName} {course.teacher?.firstName}</span>
                                                {course.invitationStatus === "PENDING" && (
                                                    <span className="text-xs text-orange-500 italic">Đang chờ...</span>
                                                )}
                                                <button onClick={() => handleInvite(course.id)} className="text-xs text-blue-500 hover:underline text-left">
                                                    (Đổi)
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                    <td className="px-6 py-3 text-right flex justify-end gap-3">
                                        <Link href={`/teacher/courses/${course.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                                            Chi tiết
                                        </Link>
                                        {isManager && (
                                            <>
                                                <Link href={`/teacher/courses/${course.id}/edit`} className="text-blue-600 hover:text-blue-800 font-medium">
                                                    Sửa
                                                </Link>
                                                <button onClick={() => handleDelete(course.id)} className="text-red-400 hover:text-red-600">
                                                    <Trash2 size={18} />
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}