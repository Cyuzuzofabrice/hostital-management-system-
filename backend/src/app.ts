
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import patientRoutes from "./routes/patient.routes.js";

const app = express();

// Middleware
app.use(
  cors({
    origin:
      process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Hospital Management API is running",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/patients", patientRoutes);

export default app;
