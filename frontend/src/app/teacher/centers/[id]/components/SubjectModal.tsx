"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import {
  createCenterSubject,
  updateCenterSubject,
  CenterSubject,
} from "@/services/centerService";

interface Props {
  centerId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subject?: CenterSubject | null;
}

export default function SubjectModal({
  centerId,
  isOpen,
  onClose,
  onSuccess,
  subject,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (subject) {
      setName(subject.name);
      setDescription(subject.description || "");
    } else {
      setName("");
      setDescription("");
    }
  }, [subject]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Subject name is required");
      return;
    }

    try {
      if (subject) {
        await updateCenterSubject(centerId, subject.id, {
          name,
          description,
        });
        toast.success("Subject updated successfully");
      } else {
        await createCenterSubject(centerId, {
          name,
          description,
        });
        toast.success("Subject created successfully");
      }

      onSuccess();
      onClose();
    } catch {
      toast.error("Operation failed");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[400px] space-y-4 shadow-xl">

        <div className="flex justify-between items-center">
          <h2 className="font-bold text-lg">
            {subject ? "Edit Subject" : "Create Subject"}
          </h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">

          <div>
            <label className="text-sm font-medium">Subject Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="border px-4 py-2 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="bg-[var(--color-main)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-secondary)]"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
}