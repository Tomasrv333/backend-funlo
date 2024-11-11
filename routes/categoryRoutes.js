// routes/categoryRoutes.js
import express from 'express';
import { 
    createCategoryOrArea, 
    getCategoriesAndAreas, 
    updateCategoryOrArea, 
    deleteCategoryOrArea 
} from '../controllers/categoryController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Crear una nueva categoría o área
router.post('/', authenticate, createCategoryOrArea); 

// Obtener todas las categorías y áreas
router.get('/', authenticate, getCategoriesAndAreas); 

// Actualizar una categoría o área
router.put('/:id', authenticate, updateCategoryOrArea); 

// Eliminar una categoría o área
router.delete('/:id', authenticate, deleteCategoryOrArea); 

export default router;