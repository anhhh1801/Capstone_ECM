import { BookOpen, Building2, Users, UserCog } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

type TabKey = "courses" | "students" | "teachers" | "subjects" | "grades";

interface Props {
    activeTab: TabKey;
    setActiveTab: Dispatch<SetStateAction<TabKey>>;
    isManager: boolean;
}

export default function CenterTabs({ activeTab, setActiveTab, isManager }: Props) {
    return (
        <div className="flex border-b border-[var(--color-text)] gap-6">
            <button
                onClick={() => setActiveTab("courses")}
                className={`px-4 py-2 font-medium flex items-center gap-2 border-b-4 border-r-2 transition
        ${activeTab === "courses"
                        ? "border-[var(--color-main)] text-[var(--color-main)]"
                        : "border-transparent text-[var(--color-text)] hover:text-[var(--color-secondary)]"
                    }`}
            >
                <BookOpen size={18} /> Courses
            </button>

            <button
                onClick={() => setActiveTab("students")}
                className={`px-4 py-2 font-medium flex items-center gap-2 border-b-4 border-r-2 transition
        ${activeTab === "students"
                        ? "border-[var(--color-main)] text-[var(--color-main)]"
                        : "border-transparent text-[var(--color-text)] hover:text-[var(--color-secondary)]"
                    }`}
            >
                <Users size={18} /> Students
            </button>

            {isManager && (
                <>
                    <button
                        onClick={() => setActiveTab("subjects")}
                        className={`px-4 py-2 font-medium flex items-center gap-2 border-b-4 border-r-2 transition
                        ${activeTab === "subjects"
                                ? "border-[var(--color-main)] text-[var(--color-main)]"
                                : "border-transparent text-[var(--color-text)] hover:text-[var(--color-secondary)]"
                            }`}
                    >
                        <BookOpen size={18} /> Subjects
                    </button>

                    <button
                        onClick={() => setActiveTab("grades")}
                        className={`px-4 py-2 font-medium flex items-center gap-2 border-b-4 border-r-2 transition
                        ${activeTab === "grades"
                                ? "border-[var(--color-main)] text-[var(--color-main)]"
                                : "border-transparent text-[var(--color-text)] hover:text-[var(--color-secondary)]"
                            }`}
                    >
                        <Building2 size={18} /> Grades
                    </button>

                    <button
                        onClick={() => setActiveTab("teachers")}
                        className={`px-4 py-2 font-medium flex items-center gap-2 border-b-4 border-r-2 transition
                        ${activeTab === "teachers"
                                ? "border-[var(--color-main)] text-[var(--color-main)]"
                                : "border-transparent text-[var(--color-text)] hover:text-[var(--color-secondary)]"
                            }`}
                    >
                        <UserCog size={18} /> Teachers
                    </button>
                </>
            )}

        </div>
    );
}