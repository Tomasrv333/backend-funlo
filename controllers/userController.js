// controllers/userController.js
import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
  
    // Verifica que todos los campos estén presentes
    if (!username || !email || !password) {
        return res.status(200).json({ status: 400, message: 'Todos los campos son requeridos.' });
    }
  
    const domainRegex = /^[a-zA-Z0-9._%+-]+@amigo\.edu\.co$/;
    if (!domainRegex.test(email)) {
        return res.status(200).json({ status: 400, message: 'El correo electrónico debe tener el dominio @amigo.edu.co' });
    }

    // Validación de la contraseña
    const passwordRequirements = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRequirements.test(password)) {
        return res.status(200).json({
            status: 400,
            message: 'La contraseña debe tener al menos 8 caracteres, incluir una letra mayúscula, una minúscula, un número y un carácter especial.'
        });
    }
  
    try {
        // Verifica si el correo ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(200).json({ status: 400, message: 'El correo electrónico ya está registrado.' });
        }
  
        // Si el correo no existe, procede a crear el usuario
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });

        await user.save();
        res.status(201).json({ status: 201, message: 'Usuario registrado con éxito' });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error al registrar el usuario', error: error.message });
    }
};   

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
        return res.status(200).json({ status: 400, message: 'Email y contraseña son requeridos.' });
  }

  try {
        const user = await User.findOne({ email });

        if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.status(200).json({ status: 200, token });
        } else {
        res.status(200).json({ status: 401, message: 'Credenciales inválidas' });
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error al iniciar sesión', error: error.message });
    }
};