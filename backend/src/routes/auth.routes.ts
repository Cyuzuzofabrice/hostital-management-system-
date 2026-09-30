import { Router } from "express";

import {
  register,
  login,
} from "../controllers/auth.controller.js";

import {
  authenticate,
  type AuthRequest,
} from "../middleware/auth.middleware.js";

import { prisma } from "../config/database.js";

const router = Router();

router.post("/register", register);

router.post("/login", login);

router.get(
  "/me",
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: {
          id: req.user.id,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error("Get current user error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to retrieve user",
      });
    }
  }
);

export default router;