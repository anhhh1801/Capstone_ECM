"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerTeacher } from "@/services/authService";
import toast, { Toaster } from "react-hot-toast";
import { UserPlus, Mail, Phone, User } from "lucide-react";

type ApiError = {
  response?: {
    data?: string;
  };
};

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [redirectEmail, setRedirectEmail] = useState<string | null>(null);

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
      } catch { }
    }
  }, [router]);

  useEffect(() => {
    if (!redirectEmail) {
      return;
    }

    toast.success("OTP code sent. Redirecting to verification...", {
      duration: 2500,
    });

    const timeoutId = window.setTimeout(() => {
      router.replace(`/verify?email=${encodeURIComponent(redirectEmail)}`);
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [redirectEmail, router]);

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

      setRedirectEmail(formData.personalEmail);
    } catch (error: unknown) {
      console.error(error);
      const msg = (error as ApiError).response?.data || "Sign up failed. Please try again.";
      if (typeof msg === 'string' && msg.includes("PENDING_VERIFICATION")) {
        toast("This account is waiting for verification. Redirecting to OTP verification...", {
          duration: 2500,
          icon: '⚠️',
        });
        setRedirectEmail(formData.personalEmail);
      } else {
        toast.error(typeof msg === "string" ? msg : "Sign up failed. Please try again.");
      }
    } finally {
      setLoading(false);
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
          <p className="text-sm text-[var(--color-text)]/70">Fields marked with <span className="text-[var(--color-negative)]">*</span> are required.</p>

          {/* Name row */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">First Name <span className="text-[var(--color-negative)]">*</span></label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--color-text)]">
                  <User size={18} />
                </div>
                <input
                  name="firstName"
                  required
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full rounded-lg border-2 border-[var(--color-main)] bg-[var(--color-soft-white)] p-3 pl-10 text-[var(--color-text)] outline-none focus:border-[var(--color-alert)] focus:ring-2 focus:ring-[var(--color-secondary)] transition"
                />
              </div>
            </div>

            <div className="w-1/2">
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Last Name <span className="text-[var(--color-negative)]">*</span></label>
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
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Personal Email <span className="text-[var(--color-negative)]">*</span></label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--color-text)]">
                <Mail size={18} />
              </div>
              <input
                name="personalEmail"
                type="email"
                required
                placeholder="name@example.com"
                value={formData.personalEmail}
                onChange={handleChange}
                className="w-full rounded-lg border-2 border-[var(--color-main)] bg-[var(--color-soft-white)] p-3 pl-10 text-[var(--color-text)] outline-none focus:border-[var(--color-alert)] focus:ring-2 focus:ring-[var(--color-secondary)] transition"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Phone Number <span className="text-[var(--color-negative)]">*</span></label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--color-text)]">
                <Phone size={18} />
              </div>
              <input
                name="phoneNumber"
                required
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full rounded-lg border-2 border-[var(--color-main)] bg-[var(--color-soft-white)] p-3 pl-10 text-[var(--color-text)] outline-none focus:border-[var(--color-alert)] focus:ring-2 focus:ring-[var(--color-secondary)] transition"
              />
            </div>
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