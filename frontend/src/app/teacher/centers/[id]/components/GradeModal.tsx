"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import {
  createCenterGrade,
  updateCenterGrade,
  CenterGrade,
} from "@/services/centerService";

interface Props {
  centerId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  grade?: CenterGrade | null;
}

export default function GradeModal({
  centerId,
  isOpen,
  onClose,
  onSuccess,
  grade,
}: Props) {
  const [fromAge, setFromAge] = useState<number | string>("");
  const [toAge, setToAge] = useState<number | string>("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (grade) {
      setFromAge(grade.fromAge ?? "");
      setToAge(grade.toAge ?? "");
      setName(grade.name);
      setDescription(grade.description || "");
    } else {
      setFromAge("");
      setToAge("");
      setName("");
      setDescription("");
    }
  }, [grade]);

  const handleSubmit = async () => {
    try {
      const payload = {
        name,
        fromAge: fromAge === "" ? undefined : Number(fromAge),
        toAge: toAge === "" ? undefined : Number(toAge),
        description,
      };

      if (grade) {
        await updateCenterGrade(centerId, grade.id, payload);
        toast.success("Grade updated successfully");
      } else {
        await createCenterGrade(centerId, payload);
        toast.success("Grade created successfully");
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
            {grade ? "Edit Grade" : "Create Grade"}
          </h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Example: Grade 10"
              />
            </div>

            <div>
              <label className="text-sm font-medium">From Age</label>
              <input
                type="number"
                value={fromAge}
                onChange={(e) => setFromAge(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Example: 14"
              />
            </div>

            <div>
              <label className="text-sm font-medium">To Age</label>
              <input
                type="number"
                value={toAge}
                onChange={(e) => setToAge(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Example: 18"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Optional description"
              />
            </div>
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