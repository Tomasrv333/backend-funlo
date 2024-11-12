import express from 'express';
import { createCourse, updateCourse, deleteCourse, addComment, rateCourse, getCourses, addCourseToFavorites } from '../controllers/courseController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Crear un nuevo curso
router.post('/new', authenticate, createCourse);

// Obtener un curso
router.get('/:courseId', authenticate, getCourses);

// Actualizar un curso
router.put('/:courseId/update', authenticate, updateCourse);

// Eliminar un curso
router.delete('/:courseId/delete', authenticate, deleteCourse);

// Agregar un comentario a un curso
router.post('/:courseId/comments', authenticate, addComment);

// Calificar un curso
router.post('/:courseId/rate', authenticate, rateCourse);

// Ruta para agregar un curso a los favoritos
router.post('/:courseId/favorites', authenticate, addCourseToFavorites);

// Obtener los cursos
router.get('/', authenticate, getCourses);

export default router;
