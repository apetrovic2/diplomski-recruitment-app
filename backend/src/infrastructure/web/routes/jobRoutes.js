import { Router } from "express";
import { createJob, getAllJobs, getJobById } from "../controllers/jobController.js";

const router = Router();

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Kreira novi oglas za posao
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Frontend Developer
 *               company:
 *                 type: strings
 *                 example: Nordic Digital
 *     responses:
 *       201:
 *         description: Oglas uspešno kreiran
 *       400:
 *         description: Greška u podacima
 */
router.post("/jobs", createJob);

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Vraća listu svih oglasa
 *     responses:
 *       200:
 *         description: Lista oglasa
 */
router.get("/jobs", getAllJobs);

/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: Vraća jedan oglas po ID-u
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pronađen oglas
 *       404:
 *         description: Oglas nije pronađen
 */
router.get("/jobs/:id", getJobById);

export default router;