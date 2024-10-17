import express from 'express';
import { createForum, getForum } from '../controllers/forumController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Ruta para crear un foro, protegida por autenticación
router.post('/', authenticate, createForum);

// Ruta para obtener todos los foros
router.get('/', getForum);

export default router;
