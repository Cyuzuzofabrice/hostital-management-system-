import type { Request, Response } from "express";

import { prisma } from "../config/database.js";

import {
  createPatientSchema,
} from "../validators/patient.validator.js";

const generatePatientNumber = (): string => {
  const timestamp = Date.now();

  const random = Math.floor(
    1000 + Math.random() * 9000
  );

  return `PAT-${timestamp}-${random}`;
};

export const registerPatient = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = createPatientSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten(),
      });

      return;
    }

    const data = result.data;

    const patientNumber = generatePatientNumber();

    const patient = await prisma.patient.create({
      data: {
        patientNumber,

        firstName: data.firstName,
        lastName: data.lastName,

        dateOfBirth: new Date(data.dateOfBirth),

        gender: data.gender,

        phone: data.phone,

        email: data.email ?? null,

        address: data.address ?? null,

        emergencyContactName:
          data.emergencyContactName ?? null,

        emergencyContactPhone:
          data.emergencyContactPhone ?? null,

        bloodGroup: data.bloodGroup ?? null,

        allergies: data.allergies ?? null,
      },
    });

    res.status(201).json({
      success: true,
      message: "Patient registered successfully",
      data: patient,
    });
  } catch (error) {
    console.error("Register patient error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to register patient",
    });
  }
};