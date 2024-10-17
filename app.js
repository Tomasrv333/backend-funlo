import express from 'express';
import connectDB from './config/db.js'; // Asegúrate de usar .js en la importación
import userRoutes from './routes/userRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import forumRoutes from './routes/forumRoutes.js';
import 'dotenv/config';

const app = express();
app.use(express.json());

connectDB()

app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/forums', forumRoutes);

try {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT,() => console.log('Servidor activo en el puerto ' + PORT));
} catch(e) {
    console.log(e);
}