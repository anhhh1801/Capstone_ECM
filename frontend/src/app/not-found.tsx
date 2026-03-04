"use client";

import Link from "next/link";
import { Search, Home } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[var(--color-soft-white)] to-[var(--color-main)]/30 px-4">
            <div className="w-full max-w-md rounded-2xl bg-[var(--color-secondary)]/40 p-8 shadow-xl text-center">
                {/* Icon */}
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-main)]/20">
                    <Search size={48} className="text-[var(--color-main)]" />
                </div>

                {/* 404 Title */}
                <h1 className="text-5xl font-bold text-[var(--color-main)] mb-2">
                    404
                </h1>

                <h2 className="text-2xl font-bold text-[var(--color-text)] mb-4">
                    Page Not Found
                </h2>

                {/* Description */}
                <p className="text-[var(--color-text)] mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>

                {/* Buttons */}
                <div className="flex flex-col gap-3">
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 w-full rounded-lg bg-[var(--color-main)] border-2 border-[var(--color-main)] px-5 py-3 text-center text-base font-medium text-white hover:bg-[var(--color-soft-white)] hover:text-[var(--color-main)] transition"
                    >
                        <Home size={18} />
                        Back to Home
                    </Link>

                    <Link
                        href="/login"
                        className="flex items-center justify-center gap-2 w-full rounded-lg border-2 border-[var(--color-main)] bg-[var(--color-soft-white)] px-5 py-3 text-center text-base font-medium text-[var(--color-main)] hover:bg-[var(--color-main)] hover:text-[var(--color-soft-white)] transition"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
