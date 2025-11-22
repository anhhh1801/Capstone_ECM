import { ShieldCheck } from "lucide-react";

interface Props {
    center: any;
    isManager: boolean;
}

export default function CenterHeader({ center, isManager }: Props) {
    if (!center) return null;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border flex justify-between items-start">
            <div>
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-gray-800">{center.name}</h1>
                    {isManager ? (
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                            <ShieldCheck size={12} /> QUẢN LÝ
                        </span>
                    ) : (
                        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">
                            GIÁO VIÊN MỜI
                        </span>
                    )}
                </div>
                <p className="text-gray-500 mt-1">{center.description}</p>
            </div>
        </div>
    );
}