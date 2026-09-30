import { Router } from "express";

import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/department.controller.js";

import {
  authenticate,
  type AuthRequest,
} from "../middleware/auth.middleware.js";

import { authorize } from "../middleware/role.middleware.js";

const router = Router();

router.get(
  "/",
  authenticate,
  getDepartments
);

router.get(
  "/:id",
  authenticate,
  getDepartmentById
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  createDepartment
);

router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  updateDepartment
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  deleteDepartment
);

export default router;