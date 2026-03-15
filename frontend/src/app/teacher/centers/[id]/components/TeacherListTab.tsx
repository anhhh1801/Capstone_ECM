import { ShieldAlert, UserCog } from "lucide-react";
import { User } from "@/services/authService";

interface Props {
    teachers: User[];
    isManager: boolean;
}

export default function TeacherListTab({ teachers, isManager }: Props) {
    if (!isManager) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-red-500 border border-red-100 bg-red-50 rounded-xl">
                <ShieldAlert size={48} className="mb-4" />
                <h3 className="font-bold">No access</h3>
                <p>Only center managers can view this section.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-[var(--color-text)] flex items-center gap-2">
                    <UserCog size={18} /> Teachers
                    ({teachers.length})
                </h3>
            </div>

            {/* TABLE */}
            <div className="bg-[var(--color-soft-white)] border border-[var(--color-main)] rounded-xl shadow-sm overflow-hidden">

                {teachers.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        No teachers found.
                    </div>
                ) : (

                    <table className="w-full text-sm text-left">

                        {/* HEADER */}
                        <thead className="bg-[var(--color-main)] text-white text-xs uppercase">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Phone</th>
                            </tr>
                        </thead>

                        {/* BODY */}
                        <tbody className="divide-y divide-gray-100">

                            {teachers.map((t) => (
                                <tr
                                    key={t.id}
                                    className="hover:bg-blue-50 transition"
                                >

                                    {/* NAME */}
                                    <td className="px-6 py-4 font-semibold text-[var(--color-text)]">
                                        {t.firstName} {t.lastName}
                                    </td>

                                    {/* EMAIL */}
                                    <td className="px-6 py-4 text-[var(--color-text)]">
                                        {t.email}
                                    </td>

                                    {/* PHONE */}
                                    <td className="px-6 py-4 text-gray-500">
                                        {t.phoneNumber || "---"}
                                    </td>

                                </tr>
                            ))}

                        </tbody>

                    </table>

                )}

            </div>

        </div>
    );
}