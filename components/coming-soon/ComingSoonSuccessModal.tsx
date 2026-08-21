"use client";

import { CheckCircle2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useTheme } from "@/context/ThemeContext";

type ComingSoonSuccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ComingSoonSuccessModal({
  isOpen,
  onClose,
}: ComingSoonSuccessModalProps) {
  const { getColor } = useTheme();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center">
        <div
          className="flex size-16 items-center justify-center rounded-full"
          style={{
            backgroundColor: `${getColor("success")}14`,
            color: getColor("success") || "#05dc7f",
          }}
        >
          <CheckCircle2 className="size-8" strokeWidth={1.75} />
        </div>

        <span
          className="mt-5 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em]"
          style={{
            backgroundColor: `${getColor("success")}14`,
            borderColor: `${getColor("success")}33`,
            color: getColor("success") || "#05dc7f",
          }}
        >
          Confirmed
        </span>

        <h2
          className="mt-4 font-serif text-2xl font-bold tracking-tight"
          style={{ color: getColor("primaryText") }}
        >
          You&apos;re on the list
        </h2>

        <p
          className="mt-3 text-sm leading-relaxed"
          style={{ color: getColor("secondaryText") }}
        >
          Thanks for signing up. We&apos;ll notify you as soon as Mazal is ready.
        </p>

        <div
          className="mt-6 w-full rounded-2xl border p-4"
          style={{
            backgroundColor: `${getColor("success")}0D`,
            borderColor: `${getColor("success")}22`,
          }}
        >
          <p
            className="text-sm font-medium"
            style={{ color: getColor("primaryText") }}
          >
            Keep an eye on your inbox for launch updates.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="lg"
          fullWidth
          className="mt-8 rounded-full"
          onClick={onClose}
        >
          Got it
        </Button>
      </div>
    </Modal>
  );
}
