import Course from '../models/course.js'; // Asegúrate de tener la ruta correcta
import mongoose from 'mongoose';

// Crear un nuevo curso
export const createCourse = async (req, res) => {
  const { title, description, creatorId, categoryId } = req.body;

  // Validación de IDs
  if (!mongoose.Types.ObjectId.isValid(creatorId) || !mongoose.Types.ObjectId.isValid(categoryId)) {
    return res.status(400).json({ message: 'ID de creador o categoría no válidos' });
  }

  try {
    const newCourse = new Course({
      title,
      description,
      creatorId: new mongoose.Types.ObjectId(creatorId), // Convertir el id a ObjectId
      categoryId: new mongoose.Types.ObjectId(categoryId),
    });

    await newCourse.save();
    res.status(201).json({ message: 'Curso creado exitosamente', course: newCourse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el curso' });
  }
};

// Actualizar un curso existente
export const updateCourse = async (req, res) => {
  const { courseId } = req.params;
  const { title, description, categoryId } = req.body;

  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        title,
        description,
        categoryId: mongoose.Types.ObjectId(categoryId), // Convertir el id a ObjectId
      },
      { new: true } // Retorna el curso actualizado
    );

    if (!updatedCourse) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }

    res.status(200).json({ message: 'Curso actualizado', course: updatedCourse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el curso' });
  }
};

// Eliminar un curso
export const deleteCourse = async (req, res) => {
  const { courseId } = req.params;

  try {
    const deletedCourse = await Course.findByIdAndDelete(courseId);

    if (!deletedCourse) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }

    res.status(200).json({ message: 'Curso eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el curso' });
  }
};

// Comentar en un curso
export const addComment = async (req, res) => {
  const { courseId } = req.params;
  const { userId, comment } = req.body;

  try {
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }

    // Agregar el comentario
    course.comments.push({
      userId: mongoose.Types.ObjectId(userId),
      comment,
    });

    await course.save();
    res.status(200).json({ message: 'Comentario agregado exitosamente', comments: course.comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al agregar el comentario' });
  }
};

// Calificar un curso
export const rateCourse = async (req, res) => {
  const { courseId } = req.params;
  const { userId, rating } = req.body;

  if (rating < 0 || rating > 5) {
    return res.status(400).json({ message: 'La calificación debe estar entre 0 y 5' });
  }

  try {
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }

    // Buscar si el usuario ya calificó el curso
    const existingRating = course.ratings.find(r => r.userId.toString() === userId);

    if (existingRating) {
      // Actualizar calificación existente
      existingRating.rating = rating;
    } else {
      // Agregar nueva calificación
      course.ratings.push({ userId: mongoose.Types.ObjectId(userId), rating });
    }

    // Calcular el promedio de calificaciones
    const totalRatings = course.ratings.length;
    const sumRatings = course.ratings.reduce((sum, r) => sum + r.rating, 0);
    course.averageRating = sumRatings / totalRatings;

    await course.save();
    res.status(200).json({ message: 'Calificación actualizada', averageRating: course.averageRating });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al calificar el curso' });
  }
};

// Controlador para obtener los cursos
export const getCourses = async (req, res) => {
  try {
    // Extraer filtros de la query
    const { categoryId, title, rating, startDate, endDate } = req.query;

    // Crear un objeto de filtros dinámico
    let filters = {};

    // Filtrar por categoría (si se proporciona)
    if (categoryId) {
      filters.categoryId = categoryId;
    }

    // Filtrar por título (si se proporciona)
    if (title) {
      filters.title = { $regex: title, $options: 'i' };  // Filtro "like" para buscar por título
    }

    // Filtrar por calificación mínima (si se proporciona)
    if (rating) {
      filters.averageRating = { $gte: Number(rating) };  // Solo cursos con calificación >= rating
    }

    // Filtrar por fechas (si se proporciona)
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) {
        filters.createdAt.$gte = new Date(startDate);  // Cursos creados desde esta fecha
      }
      if (endDate) {
        filters.createdAt.$lte = new Date(endDate);  // Cursos creados hasta esta fecha
      }
    }

    // Obtener los cursos que cumplen con los filtros
    const courses = await Course.find(filters)
      .populate('categoryId', 'name')  // Para mostrar la información de la categoría (nombre)
      .populate('creatorId', 'name')   // Para mostrar el nombre del creador (si es necesario)
      .sort({ createdAt: -1 });  // Ordenar por fecha de creación (más recientes primero)

    // Enviar la lista de cursos como respuesta
    res.status(200).json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los cursos.' });
  }
};