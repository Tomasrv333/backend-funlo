import express from 'express';
import { registerUser, loginUser, validationUser, getAllUsers, updateUser } from '../controllers/userController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Ruta para registrar un nuevo usuario
router.post('/register', registerUser);

// Ruta para iniciar sesión
router.post('/login', loginUser);

// Ruta para validar el token y obtener información del usuario autenticado
router.get('/validate', validationUser);

// Ruta para obtener todos los usuarios (requiere autenticación)
router.get('/users', authenticate, getAllUsers);

// Ruta para actualizar la información del usuario (requiere autenticación)
router.put('/update', authenticate, updateUser);

export default router;