import express from 'express';
import { createCourse, updateCourse, deleteCourse, addComment, rateCourse, getCourses  } from '../controllers/courseController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Crear un nuevo curso
router.post('/new', authenticate, createCourse);

// Obtener un curso
router.get('/:courseId', authenticate, getCourses);

// Actualizar un curso
router.put('/courses/:courseId', authenticate, updateCourse);

// Eliminar un curso
router.delete('/courses/:courseId', authenticate, deleteCourse);

// Agregar un comentario a un curso
router.post('/courses/:courseId/comments', authenticate, addComment);

// Calificar un curso
router.post('/courses/:courseId/rate', authenticate, rateCourse);

// Obtener los cursos
router.get('/', authenticate, getCourses);

export default router;
