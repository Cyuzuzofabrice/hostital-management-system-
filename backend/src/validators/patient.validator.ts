import { z } from "zod";

export const createPatientSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(100),

  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(100),

  dateOfBirth: z
    .string()
    .refine(
      (value) => !Number.isNaN(Date.parse(value)),
      "Invalid date of birth"
    ),

  gender: z.enum(["MALE", "FEMALE", "OTHER"]),

  phone: z
    .string()
    .min(10, "Phone number must be at least 10 characters")
    .max(20),

  email: z
    .string()
    .email("Invalid email address")
    .optional(),

  address: z
    .string()
    .max(255)
    .optional(),

  emergencyContactName: z
    .string()
    .max(100)
    .optional(),

  emergencyContactPhone: z
    .string()
    .max(20)
    .optional(),

  bloodGroup: z
    .string()
    .max(10)
    .optional(),

  allergies: z
    .string()
    .max(1000)
    .optional(),
});

export type CreatePatientInput = z.infer<
  typeof createPatientSchema
>;