"use client";

import { FormEvent, useEffect, useState } from "react";
import { Montserrat } from "next/font/google";
import * as yup from "yup";
import { comingSoonEndAt } from "@/config/featureFlags";
import { isValidCountryPhoneNumber } from "@/lib/phone-validation";
import ComingSoonSuccessModal from "./ComingSoonSuccessModal";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type WaitlistFields = {
  fullName: string;
  email: string;
  phone: string;
};

type FieldErrors = Partial<Record<keyof WaitlistFields, string>>;

const waitlistSchema: yup.ObjectSchema<WaitlistFields> = yup.object({
  fullName: yup
    .string()
    .trim()
    .required("Full name is required")
    .min(2, "Full name must be at least 2 characters")
    .max(80, "Full name must be at most 80 characters")
    .matches(
      /^[a-zA-Z][a-zA-Z\s'.-]*$/,
      "Full name can only contain letters, spaces, and - ' .",
    ),
  email: yup
    .string()
    .trim()
    .required("Email address is required")
    .email("Enter a valid email address"),
  phone: yup
    .string()
    .trim()
    .required("Phone number is required")
    .test("phone", "Enter a valid phone number", (value) =>
      isValidCountryPhoneNumber(value || ""),
    ),
});

function getTimeLeft(targetMs: number): TimeLeft {
  const diff = Math.max(0, targetMs - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

const UNITS: { key: keyof TimeLeft; label: string }[] = [
  { key: "days", label: "DAYS" },
  { key: "hours", label: "HOURS" },
  { key: "minutes", label: "MINUTES" },
  { key: "seconds", label: "SECONDS" },
];

const FIELD_DEFS = [
  {
    id: "fullName" as const,
    label: "FULL NAME",
    type: "text",
    autoComplete: "name",
  },
  {
    id: "email" as const,
    label: "EMAIL ADDRESS",
    type: "email",
    autoComplete: "email",
  },
  {
    id: "phone" as const,
    label: "PHONE NUMBER",
    type: "tel",
    autoComplete: "tel",
  },
];

export default function ComingSoonLanding() {
  const targetMs = comingSoonEndAt
    ? new Date(comingSoonEndAt).getTime()
    : NaN;
  const hasValidTarget = Number.isFinite(targetMs);

  // Stable zeros on SSR + first client paint so Date.now() can't mismatch hydration.
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [values, setValues] = useState<WaitlistFields>({
    fullName: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    if (!hasValidTarget) return;

    const tick = () => setTimeLeft(getTimeLeft(targetMs));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [hasValidTarget, targetMs]);

  const setField = (id: keyof WaitlistFields, value: string) => {
    setValues((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});

    try {
      await waitlistSchema.validate(values, { abortEarly: false });
      setSubmitting(true);
      window.setTimeout(() => {
        setSubmitting(false);
        setValues({ fullName: "", email: "", phone: "" });
        setSuccessOpen(true);
      }, 400);
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const next: FieldErrors = {};
        for (const issue of err.inner) {
          const path = issue.path as keyof WaitlistFields | undefined;
          if (path && !next[path]) next[path] = issue.message;
        }
        setErrors(next);
      }
    }
  };

  return (
    <div
      className={`${montserrat.className} relative isolate min-h-screen overflow-x-hidden text-[#f1f9ef]`}
    >
      {/* Background: black → deep green (Figma 46:2 / 53:51) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background:
            "linear-gradient(180deg, #000000 0%, #000000 50%, #142e2b 100%)",
        }}
      />

      {/* Diagonal stripe asset from Figma node 53:9 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div
          className="absolute left-1/2 top-1/2 h-[120%] w-[160%] max-w-none -translate-x-[48%] -translate-y-[52%] bg-contain bg-center bg-no-repeat opacity-90"
          style={{
            backgroundImage: "url(/coming-soon/diagonal-stripe-53-9.svg)",
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1728px] flex-col items-center px-6 pb-16 pt-16 sm:px-10 sm:pt-20 md:pb-24 md:pt-24 lg:pt-[7.5rem]">
        <h1 className="max-w-[1018px] text-center text-[clamp(1.125rem,2.4vw,2.25rem)] font-normal uppercase leading-[1.9] tracking-[0.35em] sm:tracking-[0.5em] md:tracking-[0.6em]">
          Some numbers are worth waiting for.
        </h1>

        <div className="mt-12 grid w-full max-w-[1280px] grid-cols-4 gap-2 sm:mt-16 sm:gap-4 md:mt-20 md:gap-6">
          {UNITS.map(({ key, label }) => (
            <div key={key} className="flex flex-col items-center text-center">
              <span
                className="bg-clip-text text-[clamp(2.75rem,11vw,11.875rem)] font-medium leading-none tracking-[0.06em] text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, #05dc7f 0%, #027646 100%)",
                }}
              >
                {pad2(timeLeft[key])}
              </span>
              <span className="mt-3 text-[clamp(0.65rem,1.6vw,1.5rem)] font-semibold uppercase tracking-[0.08em] text-[#f1f9ef] sm:mt-5">
                {label}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-14 max-w-[1018px] text-center text-[clamp(1.125rem,2.4vw,2.25rem)] font-normal uppercase leading-[1.9] tracking-[0.35em] sm:mt-20 sm:tracking-[0.5em] md:mt-24 md:tracking-[0.6em]">
          Soon, there&apos;ll be a new way to own them.
        </p>

        <form
          onSubmit={onSubmit}
          noValidate
          className="mt-12 w-full max-w-[1034px] space-y-8 sm:mt-16 md:mt-20 md:space-y-10"
        >
          {FIELD_DEFS.map((field) => {
            const hasError = Boolean(errors[field.id]);
            return (
              <label key={field.id} className="block" htmlFor={field.id}>
                <span className="mb-2 block text-left text-[clamp(0.8125rem,1.4vw,1.25rem)] font-medium uppercase tracking-[0.04em] text-[#f1f9ef]">
                  {field.label}
                </span>
                <input
                  id={field.id}
                  name={field.id}
                  type={field.type}
                  autoComplete={field.autoComplete}
                  value={values[field.id]}
                  aria-invalid={hasError}
                  aria-describedby={
                    hasError ? `${field.id}-error` : undefined
                  }
                  onChange={(e) => setField(field.id, e.target.value)}
                  className={`w-full border-0 border-b bg-transparent px-0 py-2 text-base text-[#f1f9ef] outline-none ring-0 placeholder:text-[#f1f9ef]/40 focus:ring-0 ${
                    hasError
                      ? "border-red-400 focus:border-red-400"
                      : "border-[#f1f9ef] focus:border-[#05dc7f]"
                  }`}
                />
                {hasError ? (
                  <span
                    id={`${field.id}-error`}
                    role="alert"
                    className="mt-2 block text-left text-sm text-red-400"
                  >
                    {errors[field.id]}
                  </span>
                ) : null}
              </label>
            );
          })}

          <div className="flex justify-center pt-6 md:pt-10">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-[60px] min-w-[227px] items-center justify-center rounded-full border-2 border-[#05dc7f] bg-transparent px-10 text-base font-light uppercase tracking-[0.12em] text-[#05dc7f] transition hover:bg-[#05dc7f]/10 disabled:opacity-60 sm:text-2xl"
            >
              {submitting ? "Sending…" : "Count me in!"}
            </button>
          </div>
        </form>
      </div>

      <ComingSoonSuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
      />
    </div>
  );
}
