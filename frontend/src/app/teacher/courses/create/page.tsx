"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createCourse } from "@/services/courseService";
import { getMyCenters, Center } from "@/services/centerService";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import CourseForm, { CourseFormData } from "../components/CourseForm";

function CreateCourseLogic() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // 1. Lấy tham số từ URL
    const centerIdParam = searchParams.get("centerId");

    const [loading, setLoading] = useState(false);
    const [centers, setCenters] = useState<Center[]>([]);

    // 2. Fetch danh sách Center ngay khi vào trang
    useEffect(() => {
        const fetchCenters = async () => {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                const user = JSON.parse(userStr);
                try {
                    const res = await getMyCenters(user.id);
                    setCenters(res);
                } catch (error) {
                    console.error("Lỗi lấy danh sách center", error);
                }
            }
        };
        fetchCenters();
    }, []);

    // 3. Xử lý Submit
    const handleCreate = async (data: CourseFormData) => {
        // Ưu tiên lấy ID từ URL, nếu không thì lấy từ Form chọn
        const finalCenterId = centerIdParam ? Number(centerIdParam) : data.centerId;

        if (!finalCenterId) {
            toast.error("Vui lòng chọn Trung tâm!");
            return;
        }

        setLoading(true);
        try {
            const userStr = localStorage.getItem("user");
            const user = JSON.parse(userStr || "{}");

            // Gọi API Backend (đã có @NotNull validate)
            await createCourse({
                ...data,
                centerId: finalCenterId,
                teacherId: user.id,
            });

            toast.success("Tạo khóa học thành công!");

            // Chuyển hướng: Luôn về trang chi tiết của Center đó
            router.push(`/teacher/centers/${finalCenterId}`);

        } catch (error: any) {
            toast.error(error.response?.data || "Có lỗi xảy ra khi tạo khóa học");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 mb-6 hover:text-blue-600 font-medium transition">
                <ArrowLeft size={20} /> Quay lại
            </button>

            <h1 className="text-3xl font-bold text-gray-800 mb-2">Tạo khóa học mới</h1>
            <p className="text-gray-500 mb-8">Thiết lập thông tin lớp học và gán vào trung tâm quản lý.</p>

            <CourseForm
                onSubmit={handleCreate}
                loading={loading}
                centers={centers} // Truyền list center vào dropdown

                // LOGIC KHÓA DROPDOWN:
                // Nếu URL có ?centerId=... thì -> Khóa lại, không cho chọn cái khác
                isCenterLocked={!!centerIdParam}

                // GIÁ TRỊ KHỞI TẠO:
                initialData={{
                    name: "", subject: "", grade: 10, description: "", startDate: "", endDate: "",
                    // Nếu có param -> Set sẵn giá trị đó
                    centerId: centerIdParam ? Number(centerIdParam) : undefined
                }}
            />
        </div>
    );
}

export default function CreateCoursePage() {
    return (
        <Suspense fallback={<p className="text-center p-10">Đang tải giao diện...</p>}>
            <CreateCourseLogic />
        </Suspense>
    );
}