import { BookOpen, Users, UserCog } from "lucide-react";

interface Props {
    activeTab: string;
    setActiveTab: (tab: "General Info" | "Students" | "Enrollment") => void;
    isManager: boolean;
}

export default function CenterTabsInCourse({ activeTab, setActiveTab, isManager }: Props) {

    const tabStyle = (tab: string) =>
        `px-4 py-2 font-medium flex items-center gap-2 border-b-4 border-r-2 transition
        ${
            activeTab === tab
                ? "border-[var(--color-main)] text-[var(--color-main)]"
                : "border-transparent text-[var(--color-text)] hover:text-[var(--color-secondary)]"
        }`;

    return (
        <div className="flex border-b border-[var(--color-text)] gap-6">

            {/* GENERAL INFO */}
            <button
                onClick={() => setActiveTab("General Info")}
                className={tabStyle("General Info")}
            >
                <BookOpen size={18} />
                General Info
            </button>

            {/* STUDENTS */}
            <button
                onClick={() => setActiveTab("Students")}
                className={tabStyle("Students")}
            >
                <Users size={18} />
                Students
            </button>

            {/* ENROLLMENT (Manager only) */}
            {isManager && (
                <button
                    onClick={() => setActiveTab("Enrollment")}
                    className={tabStyle("Enrollment")}
                >
                    <UserCog size={18} />
                    Enrollment
                </button>
            )}

        </div>
    );
}