import * as yup from "yup";
import { isValidCountryPhoneNumber } from "@/lib/phone-validation";

export type WaitlistFields = {
  fullName: string;
  email: string;
  phone: string;
};

export const waitlistSchema: yup.ObjectSchema<WaitlistFields> = yup.object({
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
