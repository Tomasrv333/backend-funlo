import express from 'express';
import { registerUser, loginUser, validationUser } from '../controllers/userController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/validation', validationUser);
// router.get('/getUser', getUser)

export default router;