"use client";

import { useState, useEffect } from "react";
import { X, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { inviteTeacher } from "@/services/courseService";
import { getCenterTeachers } from "@/services/centerService";

interface Teacher {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

interface Props {
  courseId: number | null;
  centerId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InviteTeacherModal({
  courseId,
  centerId,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [email, setEmail] = useState("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filtered, setFiltered] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchTeachers = async () => {
      try {
        const data = await getCenterTeachers(centerId);
        setTeachers(data);
        setFiltered(data);
      } catch {
        toast.error("Failed to load teachers");
      }
    };

    fetchTeachers();
  }, [isOpen, centerId]);

  const handleSearch = (value: string) => {
    setEmail(value);

    const filteredTeachers = teachers.filter((t) =>
      `${t.firstName} ${t.lastName} ${t.email}`
        .toLowerCase()
        .includes(value.toLowerCase())
    );

    setFiltered(filteredTeachers);
  };

  const selectTeacher = (teacher: Teacher) => {
    setEmail(teacher.email);
    setFiltered([]);
  };

  const handleInvite = async () => {
    if (!email) {
      toast.error("Please enter an email");
      return;
    }

    try {
      setLoading(true);
      await inviteTeacher(courseId!, email);
      toast.success("Invitation sent!");
      setEmail("");
      onSuccess();
      onClose();
    } catch {
      toast.error("Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !courseId) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl shadow-xl w-[420px] p-6 space-y-4">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Mail size={18} />
            Invite Teacher
          </h2>

          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">

          <input
            type="text"
            placeholder="Search teacher or enter email"
            value={email}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--color-main)]"
          />

          {/* Teacher suggestions */}
          {filtered.length > 0 && (
            <div className="absolute w-full bg-white border rounded-lg shadow mt-1 max-h-40 overflow-y-auto z-10">

              {filtered.map((teacher) => (
                <div
                  key={teacher.id}
                  onClick={() => selectTeacher(teacher)}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                >
                  <div className="font-medium">
                    {teacher.firstName} {teacher.lastName}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {teacher.email}
                  </div>
                </div>
              ))}

            </div>
          )}

        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2">

          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleInvite}
            disabled={loading}
            className="px-4 py-2 text-sm bg-[var(--color-main)] text-white rounded-lg hover:bg-[var(--color-secondary)]"
          >
            {loading ? "Sending..." : "Send Invite"}
          </button>

        </div>

      </div>
    </div>
  );
}