import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./src/infrastructure/web/swagger.js";
import jobRoutes from "./src/infrastructure/web/routes/jobRoutes.js";
import authRoutes from "./src/infrastructure/web/routes/authRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", jobRoutes);

app.use("/api", authRoutes);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Povezano na MongoDB");
    app.listen(process.env.PORT, () => {
      console.log(`Server radi na portu ${process.env.PORT}`);
      console.log(`Swagger dokumentacija: http://localhost:${process.env.PORT}/api-docs`);
    });
  })
  .catch((error) => {
    console.error("Greška pri povezivanju na MongoDB:", error);
  });