import { Router } from "express";
import { register, login } from "../controllers/authController.js";

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

export default router;