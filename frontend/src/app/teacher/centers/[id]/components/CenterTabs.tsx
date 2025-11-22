import { BookOpen, Users, UserCog } from "lucide-react";

interface Props {
    activeTab: string;
    setActiveTab: (tab: "courses" | "students" | "teachers") => void;
    isManager: boolean;
}

export default function CenterTabs({ activeTab, setActiveTab, isManager }: Props) {
    return (
        <div className="border-b border-gray-200 flex gap-6">
            <button
                onClick={() => setActiveTab("courses")}
                className={`pb-3 font-medium text-sm flex items-center gap-2 transition relative ${activeTab === "courses" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
                    }`}
            >
                <BookOpen size={18} /> Khóa học
                {activeTab === "courses" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>}
            </button>

            <button
                onClick={() => setActiveTab("students")}
                className={`pb-3 font-medium text-sm flex items-center gap-2 transition relative ${activeTab === "students" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
                    }`}
            >
                <Users size={18} /> Học viên
                {activeTab === "students" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>}
            </button>

            {isManager && (
                <button
                    onClick={() => setActiveTab("teachers")}
                    className={`pb-3 font-medium flex items-center gap-2 transition relative ${activeTab === "teachers" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <UserCog size={18} /> Giáo viên
                    {activeTab === "teachers" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>}
                </button>
            )}
        </div>
    );
}