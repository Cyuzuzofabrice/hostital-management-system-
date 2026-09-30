import type { Request, Response } from "express";

import { prisma } from "../config/database.js";

import {
  createDepartmentSchema,
  updateDepartmentSchema,
} from "../validators/department.validator.js";

const getDepartmentId = (req: Request): string | null => {
  const id = req.params.id;

  if (typeof id !== "string") {
    return null;
  }

  return id;
};

export const getDepartments = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            doctors: true,
            nurses: true,
            appointments: true,
            admissions: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: departments,
    });
  } catch (error) {
    console.error("Get departments error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve departments",
    });
  }
};

export const getDepartmentById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = getDepartmentId(req);

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Invalid department ID",
      });
      return;
    }

    const department = await prisma.department.findUnique({
      where: {
        id: id,
      },
      include: {
        doctors: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        nurses: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        _count: {
          select: {
            doctors: true,
            nurses: true,
            appointments: true,
            admissions: true,
          },
        },
      },
    });

    if (!department) {
      res.status(404).json({
        success: false,
        message: "Department not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: department,
    });
  } catch (error) {
    console.error("Get department by ID error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve department",
    });
  }
};

export const createDepartment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = createDepartmentSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten(),
      });
      return;
    }

    const { name, description } = result.data;

    const existingDepartment = await prisma.department.findUnique({
      where: {
        name,
      },
    });

    if (existingDepartment) {
      res.status(409).json({
        success: false,
        message: "A department with this name already exists",
      });
      return;
    }

    const department = await prisma.department.create({
      data: {
        name,
        description,
      },
    });

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: department,
    });
  } catch (error) {
    console.error("Create department error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create department",
    });
  }
};

export const updateDepartment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = getDepartmentId(req);

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Invalid department ID",
      });
      return;
    }

    const result = updateDepartmentSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten(),
      });
      return;
    }

    const existingDepartment = await prisma.department.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingDepartment) {
      res.status(404).json({
        success: false,
        message: "Department not found",
      });
      return;
    }

    if (result.data.name) {
      const duplicate = await prisma.department.findFirst({
        where: {
          name: result.data.name,
          NOT: {
            id: id,
          },
        },
      });

      if (duplicate) {
        res.status(409).json({
          success: false,
          message: "A department with this name already exists",
        });
        return;
      }
    }

    const department = await prisma.department.update({
      where: {
        id: id,
      },
      data: result.data,
    });

    res.status(200).json({
      success: true,
      message: "Department updated successfully",
      data: department,
    });
  } catch (error) {
    console.error("Update department error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update department",
    });
  }
};

export const deleteDepartment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = getDepartmentId(req);

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Invalid department ID",
      });
      return;
    }

    const department = await prisma.department.findUnique({
      where: {
        id: id,
      },
    });

    if (!department) {
      res.status(404).json({
        success: false,
        message: "Department not found",
      });
      return;
    }

    const doctorCount = await prisma.doctor.count({
      where: {
        departmentId: id,
      },
    });

    const nurseCount = await prisma.nurse.count({
      where: {
        departmentId: id,
      },
    });

    const appointmentCount = await prisma.appointment.count({
      where: {
        departmentId: id,
      },
    });

    const admissionCount = await prisma.admission.count({
      where: {
        departmentId: id,
      },
    });

    if (
      doctorCount > 0 ||
      nurseCount > 0 ||
      appointmentCount > 0 ||
      admissionCount > 0
    ) {
      res.status(409).json({
        success: false,
        message:
          "Cannot delete a department that is being used by doctors, nurses, appointments, or admissions",
      });
      return;
    }

    await prisma.department.delete({
      where: {
        id: id,
      },
    });

    res.status(200).json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    console.error("Delete department error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete department",
    });
  }
};