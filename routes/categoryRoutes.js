import express from 'express';
import { createCategory, getCategories, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Crear una nueva categoría
router.post('/', authenticate, createCategory);

// Obtener todas las categorías
router.get('/', authenticate, getCategories);

// Actualizar una categoría
router.put('/:id', authenticate, updateCategory);

// Eliminar una categoría
router.delete('/:id', authenticate, deleteCategory);

export default router;