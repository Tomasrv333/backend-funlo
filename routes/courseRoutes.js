// routes/courseRoutes.js
import express from 'express';
import { createCourse, getCourses } from '../controllers/courseController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', authenticate, createCourse);
router.get('/', getCourses);

export default router;
