import { Router } from "express";
import {
  applyToJob,
  getApplicationsByJob,
  getApplicationsByCandidate,
  changeApplicationStatus,
  scheduleInterview,
  rateCandidate,
  useProfileCv,
} from "../controllers/applicationController.js";
import upload from "../middleware/upload.js";
import { uploadCv } from "../controllers/applicationController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

/**
 * @swagger
 * /api/applications:
 *   post:
 *     summary: Kandidat se prijavljuje na oglas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               candidateId:
 *                 type: string
 *               jobId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Prijava kreirana
 *       400:
 *         description: Greška u podacima
 */
router.post("/applications", authenticate, applyToJob);

/**
 * @swagger
 * /api/applications/job/{jobId}:
 *   get:
 *     summary: Vraća sve prijave za jedan oglas
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista prijava
 */
router.get("/applications/job/:jobId", authenticate, authorize("admin"), getApplicationsByJob);

/**
 * @swagger
 * /api/applications/candidate/{candidateId}:
 *   get:
 *     summary: Vraća sve prijave jednog kandidata
 *     parameters:
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista prijava
 */
router.get("/applications/candidate/:candidateId", authenticate, getApplicationsByCandidate);

/**
 * @swagger
 * /api/applications/{applicationId}/status:
 *   put:
 *     summary: Menja status prijave
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: Pregledan
 *     responses:
 *       200:
 *         description: Status ažuriran
 *       400:
 *         description: Nevažeći status
 */
router.put("/applications/:applicationId/status", authenticate, authorize("admin"), changeApplicationStatus);

/**
 * @swagger
 * /api/applications/{applicationId}/interview:
 *   put:
 *     summary: Zakazuje intervju za prijavu
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               interviewDate:
 *                 type: string
 *                 example: "2026-09-15T10:00:00"
 *     responses:
 *       200:
 *         description: Intervju zakazan
 *       400:
 *         description: Greška u podacima
 */
router.put("/applications/:applicationId/interview", authenticate, authorize("admin"), scheduleInterview);

/**
 * @swagger
 * /api/applications/{applicationId}/rating:
 *   put:
 *     summary: Ocenjuje kandidata za prijavu
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 example: 4
 *               note:
 *                 type: string
 *                 example: "Dobar utisak, dobro poznaje React"
 *     responses:
 *       200:
 *         description: Ocena sačuvana
 *       400:
 *         description: Greška u podacima
 */
router.put("/applications/:applicationId/rating", authenticate, authorize("admin"), rateCandidate);

/**
 * @swagger
 * /api/applications/{applicationId}/cv:
 *   post:
 *     summary: Otprema CV za prijavu
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               cv:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: CV uspešno otpremljen
 *       400:
 *         description: Greška pri otpremanju
 */
router.post("/applications/:applicationId/cv", authenticate, upload.single("cv"), uploadCv);

/**
 * @swagger
 * /api/applications/{applicationId}/use-profile-cv:
 *   put:
 *     summary: Povezuje postojeći CV sa profila kandidata sa prijavom
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cvUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: CV povezan sa prijavom
 *       400:
 *         description: Greška u podacima
 */
router.put("/applications/:applicationId/use-profile-cv", authenticate, useProfileCv);

export default router;