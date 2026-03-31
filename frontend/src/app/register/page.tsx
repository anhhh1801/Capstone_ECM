"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerTeacher, resendOtp } from "@/services/authService";
import toast, { Toaster } from "react-hot-toast";
import { UserPlus, Mail, Phone, User } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // if already authenticated, redirect
  useEffect(() => {
    const stored = localStorage.getItem("loginResponse");
    if (stored) {
      try {
        const { user } = JSON.parse(stored);
        if (user?.role?.toString() === "TEACHER") {
          router.replace("/teacher/dashboard");
        } else if (user?.role?.toString() === "STUDENT") {
          router.replace("/student/dashboard");
        } else if (user?.role?.toString() === "ADMIN") {
          router.replace("/admin/users");
        } else {
          router.replace("/");
        }
      } catch (_) { }
    }
  }, [router]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    personalEmail: "",
    phoneNumber: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await registerTeacher(formData);

      toast.success("OTP Code is sent!", { duration: 4000 });
      router.push(`/verify?email=${encodeURIComponent(formData.personalEmail)}`);

    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data || "Sign up failed. Please try again.";
      if (typeof msg === 'string' && msg.includes("PENDING_VERIFICATION")) {
        toast((t) => (
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-gray-800">
              Waiting a confirmation!
            </span>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                await handleResendOld(formData.personalEmail);
              }}
              className="bg-blue-600 text-white text-xs py-1 px-3 rounded hover:bg-blue-700"
            >
              Resend OTP & Verify now
            </button>
          </div>
        ), { duration: 6000, icon: '⚠️' });
      } else {
        toast.error("Email used!!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOld = async (email: string) => {
    try {
      await resendOtp(email);
      toast.success("OTP Code is sent again!");
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } catch (e) {
      toast.error("Failed to resend OTP.");
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[var(--color-soft-white)] to-[var(--color-main)]/30 p-12">
      <Toaster position="top-center" />

      <div className="w-full max-w-md rounded-2xl bg-[var(--color-soft-white)]/40 p-8 shadow-xl transition-all hover:shadow-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-main)] text-white">
            <UserPlus size={32} />
          </div>
          <h2 className="header-1">Register</h2>
          <p className="text-sm text-[var(--color-text)] mt-2">
            Create your ECM account
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleRegister}>

          {/* Name row */}
          <div className="flex gap-4">
            <div className="w-1/2 relative">
              <User size={18} className="absolute left-3 top-3 text-[var(--color-text)]" />
              <input
                name="firstName"
                required
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full rounded-lg border-2 border-[var(--color-main)] bg-[var(--color-soft-white)] p-3 pl-10 text-[var(--color-text)] outline-none focus:border-[var(--color-alert)] focus:ring-2 focus:ring-[var(--color-secondary)] transition"
              />
            </div>

            <div className="w-1/2">
              <input
                name="lastName"
                required
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full rounded-lg border-2 border-[var(--color-main)] bg-[var(--color-soft-white)] p-3 text-[var(--color-text)] outline-none focus:border-[var(--color-alert)] focus:ring-2 focus:ring-[var(--color-secondary)] transition"
              />
            </div>
          </div>

          {/* Email */}
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-3 text-[var(--color-text)]" />
            <input
              name="personalEmail"
              type="email"
              required
              placeholder="Personal Email"
              value={formData.personalEmail}
              onChange={handleChange}
              className="w-full rounded-lg border-2 border-[var(--color-main)] bg-[var(--color-soft-white)] p-3 pl-10 text-[var(--color-text)] outline-none focus:border-[var(--color-alert)] focus:ring-2 focus:ring-[var(--color-secondary)] transition"
            />
          </div>

          {/* Phone */}
          <div className="relative">
            <Phone size={18} className="absolute left-3 top-3 text-[var(--color-text)]" />
            <input
              name="phoneNumber"
              required
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full rounded-lg border-2 border-[var(--color-main)] bg-[var(--color-soft-white)] p-3 pl-10 text-[var(--color-text)] outline-none focus:border-[var(--color-alert)] focus:ring-2 focus:ring-[var(--color-secondary)] transition"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg bg-[var(--color-main)] border-2 border-[var(--color-main)] px-5 py-3 font-medium text-white hover:bg-[var(--color-soft-white)] hover:text-[var(--color-main)] transition ${loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
          >
            {loading ? "Handling..." : "Create Account"}
          </button>

          {/* Login link */}
          <p className="text-center text-sm text-[var(--color-text)]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[var(--color-main)] underline hover:text-[var(--color-alert)]"
            >
              Sign in here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}