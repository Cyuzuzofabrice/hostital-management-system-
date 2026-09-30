import { Router } from "express";

import {
  registerPatient,
} from "../controllers/patient.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

import { authorize } from "../middleware/role.middleware.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "RECEPTIONIST"),
  registerPatient
);

export default router;