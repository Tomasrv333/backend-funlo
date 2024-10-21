// controllers/userController.js
import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
  
    // Verifica que todos los campos estén presentes
    if (!username || !email || !password) {
        return res.status(400).json({ status: 400, message: 'Todos los campos son requeridos.' });
    }
  
    const domainRegex = /^[a-zA-Z0-9._%+-]+@amigo\.edu\.co$/;
    if (!domainRegex.test(email)) {
        return res.status(400).json({ status: 400, message: 'El correo electrónico debe tener el dominio @amigo.edu.co' });
    }

    // Validación de la contraseña
    const passwordRequirements = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRequirements.test(password)) {
        return res.status(400).json({
            status: 400,
            message: 'La contraseña debe tener al menos 8 caracteres, incluir una letra mayúscula, una minúscula, un número y un carácter especial.'
        });
    }
  
    try {
        // Verifica si el correo ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ status: 400, message: 'El correo electrónico ya está registrado.' });
        }
  
        // Si el correo no existe, procede a crear el usuario
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });

        await user.save();

        // Generar token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

        res.setHeader('Set-Cookie', [
            `token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=900`, // 15 minutos de vida para el JWT
            `refreshToken=${refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}` // 7 días de vida para el refresh token
        ]);

        // Devolver el token y el refresh token en la respuesta
        return res.status(200).json({
            status: 200,
            message: 'Registro exitoso',
            token, // También devolver el token en el cuerpo de la respuesta (opcional)
            refreshToken // Devolver el refresh token (opcional)
        });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error al registrar el usuario', error: error.message });
    }
};   

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
    }
  
    try {
        // Buscar el usuario en la base de datos
        const user = await User.findOne({ email });
    
        if (user && await bcrypt.compare(password, user.password)) {
            // Generar el JWT y el Refresh Token
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
            const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

            // Configurar las cookies para el token y el refresh token
            res.setHeader('Set-Cookie', [
            `token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=900`, // 15 minutos de vida para el JWT
            `refreshToken=${refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}` // 7 días de vida para el refresh token
            ]);
    
            // Devolver el token y el refresh token en la respuesta
            return res.status(200).json({
                status: 200,
                message: 'Login exitoso',
                token: token, // También devolver el token en el cuerpo de la respuesta (opcional)
            });
        } else {
            return res.status(401).json({ status: 401, message: 'Credenciales inválidas' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
    }
};

export const validationUser = async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Obtener el token del encabezado

    if (!token) {
        return res.status(401).json({ status: 'error', message: 'Token no proporcionado' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ status: 'error', message: 'Token inválido' });
        }

        // Obtener el ID del usuario desde el token decodificado
        const userId = decoded.id; // Asegúrate de que el token tenga esta propiedad

        try {
            // Buscar al usuario en la base de datos
            const user = await User.findById(userId); // Cambia esto si usas otro método para buscar usuarios

            if (!user) {
                return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
            }

            // Devolver la data del usuario junto con el estado de validación
            res.json({
                status: 200,
                message: 'Token válido',
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name, // Incluye otros campos según tu modelo
                    // Puedes añadir más campos si los necesitas
                },
            });
        } catch (error) {
            console.error('Error al buscar el usuario:', error);
            return res.status(500).json({ status: 'error', message: 'Error en el servidor' });
        }
    });
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Excluimos las contraseñas
        return res.status(200).json({ status: 200, data: users });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: 'Error al obtener los usuarios' });
    }
};

export const updateUser = async (req, res) => {
    const { userId } = req.params; // ID del usuario a actualizar
    const { username, email, password } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ status: 404, message: 'Usuario no encontrado' });
        }

        // Actualización de email, username o password
        if (username) user.username = username;
        if (email) {
            const domainRegex = /^[a-zA-Z0-9._%+-]+@amigo\.edu\.co$/;
            if (!domainRegex.test(email)) {
                return res.status(400).json({ status: 400, message: 'El correo electrónico debe tener el dominio @amigo.edu.co' });
            }
            user.email = email;
        }
        if (password) {
            const passwordRequirements = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
            if (!passwordRequirements.test(password)) {
                return res.status(400).json({
                    status: 400,
                    message: 'La contraseña debe tener al menos 8 caracteres, incluir una letra mayúscula, una minúscula, un número y un carácter especial.'
                });
            }
            user.password = await bcrypt.hash(password, 10); // Actualizar y encriptar la nueva contraseña
        }

        await user.save();

        return res.status(200).json({ status: 200, message: 'Usuario actualizado exitosamente' });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: 'Error al actualizar el usuario', error: error.message });
    }
};