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
    const [canCreateCourse, setCanCreateCourse] = useState(true);
    const [centersLoading, setCentersLoading] = useState(true);

    useEffect(() => {
        const fetchCenters = async () => {
            const userStr = localStorage.getItem("user");
            if (!userStr) {
                setCanCreateCourse(false);
                setCentersLoading(false);
                return;
            }

            const user = JSON.parse(userStr);

            try {
                const managedCenters = await getMyCenters(user.id);

                if (centerIdParam) {
                    const lockedCenterId = Number(centerIdParam);
                    const selectedCenter = managedCenters.find((center) => center.id === lockedCenterId);

                    if (selectedCenter) {
                        setCenters([selectedCenter]);
                        setCanCreateCourse(true);
                        return;
                    }

                    setCanCreateCourse(false);
                    setCenters([]);
                    toast.error("You can only create courses for centers you manage.");
                    router.replace("/teacher/courses");
                    return;
                }

                setCenters(managedCenters);
                setCanCreateCourse(managedCenters.length > 0);
            } catch (error) {
                console.error(error);
                setCanCreateCourse(false);
                toast.error("Unable to load your managed centers.");
            } finally {
                setCentersLoading(false);
            }
        };
        fetchCenters();
    }, [centerIdParam, router]);

    const handleCreate = async (data: CourseFormData) => {
        const finalCenterId = centerIdParam
            ? Number(centerIdParam)
            : data.centerId;

        if (!canCreateCourse) {
            toast.error("Only center managers can create courses.");
            return;
        }

        if (!finalCenterId) {
            toast.error("Please select a center!");
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

            toast.success("Course created successfully!");
            router.push(`/teacher/centers/${finalCenterId}`);
        } catch (error: any) {
            const responseData = error?.response?.data;
            const message =
                responseData?.error ||
                responseData?.message ||
                (typeof responseData === "string" ? responseData : null) ||
                "An error occurred while creating the course";
            toast.error(message);
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
                Back
            </button>

            <div>
                <h1 className="text-3xl font-bold text-[var(--color-text)] flex items-center gap-2">
                    <BookOpen className="text-[var(--color-main)]" />
                    Create new course
                </h1>
                <p className="text-[var(--color-text)]/70 mt-2">
                    Set up class information and assign it to a center.
                </p>
            </div>

            {!centersLoading && !canCreateCourse && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Only center managers can create courses.
                </div>
            )}

            <CourseForm
                onSubmit={handleCreate}
                loading={loading || centersLoading}
                centers={centers}
                isCenterLocked={!!centerIdParam}
                initialData={{
                    name: "",
                    subjectId: undefined,
                    gradeId: undefined,
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
        <Suspense fallback={<p className="text-center p-10">Loading interface...</p>}>
            <CreateCourseLogic />
        </Suspense>
    );
}