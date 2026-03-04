"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createCourse } from "@/services/courseService";
import { getMyCenters, Center } from "@/services/centerService";
import toast from "react-hot-toast";
import { ArrowLeft, BookOpen } from "lucide-react";
import CourseForm, { CourseFormData } from "../components/CourseForm";

function CreateCourseLogic() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const centerIdParam = searchParams.get("centerId");

    const [loading, setLoading] = useState(false);
    const [centers, setCenters] = useState<Center[]>([]);

    useEffect(() => {
        const fetchCenters = async () => {
            const userStr = localStorage.getItem("user");
            if (!userStr) return;
            const user = JSON.parse(userStr);
            try {
                const res = await getMyCenters(user.id);
                setCenters(res);
            } catch (error) {
                console.error(error);
            }
        };
        fetchCenters();
    }, []);

    const handleCreate = async (data: CourseFormData) => {
        const finalCenterId = centerIdParam
            ? Number(centerIdParam)
            : data.centerId;

        if (!finalCenterId) {
            toast.error("Vui lòng chọn Trung tâm!");
            return;
        }

        setLoading(true);
        try {
            const userStr = localStorage.getItem("user");
            const user = JSON.parse(userStr || "{}");

            await createCourse({
                ...data,
                centerId: finalCenterId,
                teacherId: user.id,
            });

            toast.success("Tạo khóa học thành công!");
            router.push(`/teacher/centers/${finalCenterId}`);
        } catch (error: any) {
            toast.error(error.response?.data || "Có lỗi xảy ra khi tạo khóa học");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">

            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-[var(--color-text)] hover:text-[var(--color-main)] font-medium transition"
            >
                <ArrowLeft size={20} />
                Quay lại
            </button>

            <div>
                <h1 className="text-3xl font-bold text-[var(--color-text)] flex items-center gap-2">
                    <BookOpen className="text-[var(--color-main)]" />
                    Tạo khóa học mới
                </h1>
                <p className="text-[var(--color-text)]/70 mt-2">
                    Thiết lập thông tin lớp học và gán vào trung tâm quản lý.
                </p>
            </div>

            <CourseForm
                onSubmit={handleCreate}
                loading={loading}
                centers={centers}
                isCenterLocked={!!centerIdParam}
                initialData={{
                    name: "",
                    subject: "",
                    grade: 10,
                    description: "",
                    startDate: "",
                    endDate: "",
                    centerId: centerIdParam
                        ? Number(centerIdParam)
                        : undefined
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