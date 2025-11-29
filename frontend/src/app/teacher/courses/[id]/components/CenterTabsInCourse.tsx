import { BookOpen, Users, UserCog } from "lucide-react";

interface Props {
    activeTab: string;
    setActiveTab: (tab: "General Info" | "Students" | "Enrollment") => void;
    isManager: boolean;
}

export default function CenterTabsInCourse({ activeTab, setActiveTab, isManager }: Props) {
    return (
        <div className="border-b border-gray-200 flex gap-6 mb-6">
            <button
                onClick={() => setActiveTab("General Info")}
                className={`pb-3 font-medium text-sm flex items-center gap-2 transition relative ${activeTab === "General Info" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
                    }`}
            >
                <BookOpen size={18} /> Thông tin chung
                {activeTab === "General Info" && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>
                )}
            </button>

            <button
                onClick={() => setActiveTab("Students")}
                className={`pb-3 font-medium text-sm flex items-center gap-2 transition relative ${activeTab === "Students" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
                    }`}
            >
                <Users size={18} /> Học viên
                {activeTab === "Students" && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>
                )}
            </button>

            {/* Only show this tab if isManager is TRUE */}
            {isManager && (
                <button
                    onClick={() => setActiveTab("Enrollment")}
                    className={`pb-3 font-medium text-sm flex items-center gap-2 transition relative ${activeTab === "Enrollment" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <UserCog size={18} /> Quản lý ghi danh
                    {activeTab === "Enrollment" && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>
                    )}
                </button>
            )}
        </div>
    );
}