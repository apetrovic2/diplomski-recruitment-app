import { Router } from "express";
import { register, login, uploadUserCv, deleteUserCv, getUserById } from "../controllers/authController.js";
import upload from "../middleware/upload.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registruje novog korisnika
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ana Petrović
 *               email:
 *                 type: string
 *                 example: ana@mail.com
 *               password:
 *                 type: string
 *                 example: mojasifra123
 *               role:
 *                 type: string
 *                 example: candidate
 *     responses:
 *       201:
 *         description: Korisnik uspešno registrovan
 *       400:
 *         description: Greška u podacima
 */
router.post("/auth/register", register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Prijava korisnika
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: ana@mail.com
 *               password:
 *                 type: string
 *                 example: mojasifra123
 *     responses:
 *       200:
 *         description: Uspešna prijava, vraća token
 *       401:
 *         description: Pogrešan email ili lozinka
 */
router.post("/auth/login", login);

/**
 * @swagger
 * /api/auth/{userId}:
 *   get:
 *     summary: Vraća osnovne podatke o korisniku (samo admin)
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Podaci o korisniku
 *       404:
 *         description: Korisnik nije pronađen
 */
router.get("/auth/:userId", authenticate, authorize("admin"), getUserById);

/**
 * @swagger
 * /api/auth/{userId}/cv:
 *   post:
 *     summary: Otprema opšti CV korisnika (na profilu)
 *     parameters:
 *       - in: path
 *         name: userId
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
router.post("/auth/:userId/cv", authenticate, upload.single("cv"), uploadUserCv);

router.delete("/auth/:userId/cv", authenticate, deleteUserCv);

export default router;