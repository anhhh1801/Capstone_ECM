
import { ShieldCheck } from "lucide-react";

interface Props {
    center: any;
    isManager: boolean;
}

export default function CenterHeader({ center, isManager }: Props) {
    if (!center) return null;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border flex justify-between items-start">
            <div className="max-w-full">

                {/* TITLE */}
                <h1 className="text-4xl font-bold text-[var(--color-text)] break-words">
                    {center.name}
                </h1>

                {/* ROLE BADGE */}
                {isManager ? (
                    <span className="mt-2 inline-flex bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded items-center gap-1">
                        <ShieldCheck size={12} /> MANAGER
                    </span>
                ) : (
                    <span className="mt-2 inline-block bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">
                        INVITED TEACHER
                    </span>
                )}

                {/* DESCRIPTION */}
                <p className="text-gray-500 mt-3 break-words">
                    {center.description}
                </p>

            </div>
        </div>
    );
}