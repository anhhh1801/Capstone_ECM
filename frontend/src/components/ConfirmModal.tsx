"use client";

import { useState } from "react";

interface ConfirmModalProps {
	isOpen: boolean;
	title?: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	onConfirm: () => Promise<void> | void;
	onClose: () => void;
}

export default function ConfirmModal({
	isOpen,
	title = "Confirm Action",
	message,
	confirmText = "Confirm",
	cancelText = "Cancel",
	onConfirm,
	onClose,
}: ConfirmModalProps) {
	const [submitting, setSubmitting] = useState(false);

	if (!isOpen) return null;

	const handleConfirm = async () => {
		try {
			setSubmitting(true);
			await onConfirm();
			onClose();
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4">
			<div className="w-full max-w-md rounded-xl border border-[var(--color-main)] bg-[var(--color-soft-white)] shadow-xl">
				<div className="border-b border-[var(--color-main)]/20 px-5 py-4">
					<h4 className="text-lg font-bold text-[var(--color-text)]">{title}</h4>
				</div>

				<div className="px-5 py-4">
					<p className="text-sm leading-relaxed text-[var(--color-text)]">{message}</p>
				</div>

				<div className="flex justify-end gap-2 px-5 pb-5">
					<button
						type="button"
						onClick={onClose}
						disabled={submitting}
						className="rounded-lg border border-[var(--color-main)] px-4 py-2 text-sm font-medium text-[var(--color-main)] transition hover:bg-[var(--color-main)] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
					>
						{cancelText}
					</button>

					<button
						type="button"
						onClick={handleConfirm}
						disabled={submitting}
						className="rounded-lg border border-[var(--color-alert)] bg-[var(--color-alert)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--color-soft-white)] hover:text-[var(--color-alert)] disabled:cursor-not-allowed disabled:opacity-60"
					>
						{submitting ? "Processing..." : confirmText}
					</button>
				</div>
			</div>
		</div>
	);
}
